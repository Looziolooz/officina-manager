"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUserSchema, updateUserSchema, changePasswordSchema } from "@/lib/schemas";
import type { CreateUserFormData, UpdateUserFormData } from "@/lib/schemas";
import bcrypt from "bcryptjs";

export async function createUser(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = createUserSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, message: "Email gia registrata" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error("Errore creazione utente:", error);
    return { success: false, message: "Errore durante la creazione dell'utente" };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = updateUserSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error("Errore aggiornamento utente:", error);
    return { success: false, message: "Errore durante l'aggiornamento" };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${data.id}`);
  return { success: true };
}

export async function changeUserPassword(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = changePasswordSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  try {
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: data.userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      },
    });
  } catch (error) {
    console.error("Errore cambio password:", error);
    return { success: false, message: "Errore durante il cambio password" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore aggiornamento stato" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.role === "ADMIN" && adminCount <= 1) {
      return { success: false, message: "Impossibile eliminare l'unico amministratore attivo" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore durante l'eliminazione" };
  }
}

export async function toggle2FA(userId: string, enabled: boolean) {
  try {
    const updateData: any = { twoFactorEnabled: enabled };

    if (!enabled) {
      updateData.twoFactorSecret = null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Errore aggiornamento 2FA" };
  }
}

// --- HELPERS ---

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isLocked: true,
        twoFactorEnabled: true,
        lastLoginSuccess: true,
        createdAt: true,
        _count: {
          select: {
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isLocked: true,
        twoFactorEnabled: true,
        lastLoginSuccess: true,
        lastLoginIP: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}
