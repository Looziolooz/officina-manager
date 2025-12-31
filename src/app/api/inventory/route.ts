import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, buyPrice, sellPrice, stock, minStock } = body;

    // Validazione semplice
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
    
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Un articolo con questo codice esiste già" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}