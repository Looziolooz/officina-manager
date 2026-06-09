import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { z } from "zod";
import { Role } from "@prisma/client";

const createPartSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  category: z.string().optional(),
  brand: z.string().optional(),
  buyPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  location: z.string().optional(),
  supplierCode: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Check role
  const userRole = session.user.role as Role;
  if (userRole !== Role.SUPER_ADMIN && userRole !== Role.ADMIN && userRole !== Role.MANAGER) {
    return NextResponse.json({ error: "Permessi insufficienti" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createPartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const newPart = await prisma.part.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        markup: data.buyPrice > 0 ? ((data.sellPrice - data.buyPrice) / data.buyPrice) * 100 : 0,
        totalValue: data.stock * data.buyPrice,
        stockLevel: data.stock <= 0 ? "CRITICAL" : data.stock < data.minStock ? "LOW" : "NORMAL",
      },
    });

    return NextResponse.json(newPart, { status: 201 });
  } catch (error: unknown) {
    console.error("ERRORE MAGAZZINO:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Un articolo con questo codice esiste già" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}