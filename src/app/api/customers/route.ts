import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { z } from "zod";

const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1),
  address: z.string().optional(),
  technicalNotes: z.string().optional(),
  familyNotes: z.string().optional(),
  plate: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { 
      firstName, lastName, email, phone, address, 
      technicalNotes, familyNotes,
      plate, brand, model, year 
    } = parsed.data;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.create({
        data: {
          firstName,
          lastName,
          email: email || null,
          phone,
          address,
          technicalNotes,
          familyNotes,
        },
      });

      const vehicle = await tx.vehicle.create({
        data: {
          plate: plate.toUpperCase().replace(/\s/g, ""),
          brand: brand || "UNKNOWN",
          modelName: model || "UNKNOWN",
          year: Number(year),
          ownerId: customer.id,
        },
      });

      return { customer, vehicle };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "La targa inserita è già presente nel sistema" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}