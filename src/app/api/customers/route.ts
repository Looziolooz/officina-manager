import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      firstName, lastName, email, phone, address, 
      technicalNotes, familyNotes,
      plate, brand, model, year 
    } = body;

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
          brand,
          model,
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