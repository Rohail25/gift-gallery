import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    // Get or create active cart
    let cart = await prisma.cart.findFirst({
      where: { user_id: user.id, status: "active" },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { is_visible: true },
                  orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
                  take: 2,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: user.id, status: "active" },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });
    }

    // Calculate totals
    let subtotal = 0;
    const items = cart.items.map((item) => {
      const price =
        item.product.sale_price ?? item.product.regular_price;
      const lineTotal = price.toNumber() * item.quantity;
      subtotal += lineTotal;
      return { ...item, line_total: lineTotal };
    });

    return NextResponse.json({
      data: {
        ...cart,
        items,
        subtotal,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
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

    const { productId, quantity = 1 } = await req.json();

    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.is_visible || product.status !== "active") {
      return NextResponse.json({ error: "Product not available" }, { status: 400 });
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { user_id: user.id, status: "active" },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: user.id, status: "active" },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });

    const price = product.sale_price ?? product.regular_price;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock_quantity < newQuantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unit_price: price,
          line_total: price.toNumber() * newQuantity,
        },
      });
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id: productId,
          quantity,
          unit_price: price,
          line_total: price.toNumber() * quantity,
        },
      });
    }

    return NextResponse.json({ message: "Added to cart" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
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

    const { itemId, quantity } = await req.json();

    if (quantity < 1) {
      // Remove item
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity
      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { product: true },
      });

      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      if (item.product.stock_quantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity,
          unit_price: item.unit_price,
          line_total: item.unit_price.toNumber() * quantity,
        },
      });
    }

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      // Remove single item
      await prisma.cartItem.delete({
        where: { id: parseInt(itemId) },
      });
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: {
          cart: { user_id: user.id, status: "active" },
        },
      });
    }

    return NextResponse.json({ message: "Cart cleared" });
  } catch (error) {
    return handleApiError(error);
  }
}