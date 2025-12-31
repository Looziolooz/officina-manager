import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json([]);

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { plate: { contains: query, mode: "insensitive" } },
          { owner: { lastName: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        owner: {
          select: { firstName: true, lastName: true }
        }
      },
      take: 5,
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore ricerca" }, { status: 500 });
  }
}