// src/app/api/vehicles/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  // Verifica sessione per sicurezza
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { 
            plate: { 
              contains: query.toUpperCase().replace(/\s/g, ""), 
              mode: "insensitive" 
            } 
          },
          { 
            owner: { 
              lastName: { 
                contains: query, 
                mode: "insensitive" 
              } 
            } 
          },
        ],
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      take: 10, // Limita i risultati per performance
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Errore durante la ricerca veicoli:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}