import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("GTService2025!", 12);

    await prisma.user.upsert({
      where: { email: "giovanni@gtservice.it" },
      update: {},
      create: {
        email: "giovanni@gtservice.it",
        name: "Giovanni Tambuscio",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({ success: true, message: "Admin creato!" });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}