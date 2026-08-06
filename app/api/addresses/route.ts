import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AddressSchema } from "@/validators/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { user_id: user.id, is_active: true },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
    });

    return NextResponse.json({ data: addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const addressData = AddressSchema.parse(body);

    // If this is default, remove default status from other addresses
    if (addressData.is_default) {
      await prisma.customerAddress.updateMany({
        where: { user_id: user.id, is_default: true },
        data: { is_default: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        user_id: user.id,
        ...addressData,
      },
    });

    return NextResponse.json(
      { message: "Address created successfully", data: address },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
