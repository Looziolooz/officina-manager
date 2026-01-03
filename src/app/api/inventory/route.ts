import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, buyPrice, sellPrice, stock, minStock } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Codice e Nome sono obbligatori" },
        { status: 400 }
      );
    }

    const newPart = await prisma.part.create({
      data: {
        code: code.toUpperCase(),
        name,
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        stock: Number(stock),
        minStock: Number(minStock),
      },
    });

    return NextResponse.json(newPart, { status: 201 });
  } catch (error: unknown) {
    console.error("ERRORE MAGAZZINO:", error);
    
    // FIX: Controllo sicuro per l'errore Prisma P2002 (Unique constraint)
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