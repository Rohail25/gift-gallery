import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail, emailTemplates } from "@/lib/email";
import { handleApiError, generateOrderNumber } from "@/lib/utils";
import { Prisma, PaymentMethod, OrderStatus } from "@prisma/client";

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Prisma.OrderWhereInput = { user_id: user.id };
    if (status) {
      where.order_status = status as OrderStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          delivery_address: true,
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
      return NextResponse.json(
        { error: "Please login to place an order" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.email_verified_at) {
      return NextResponse.json(
        { error: "Please verify your email before placing an order" },
        { status: 400 }
      );
    }

    const { customerAddressId, paymentMethod = "cod", customerNote } = await req.json();

    // Get cart
    const cart = await prisma.cart.findFirst({
      where: { user_id: user.id, status: "active" },
      include: {
        items: {
          include: {
            product: {
              include: {
                product_category: {
                  include: {
                    giftTypes: { include: { gift_type: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate address
    const address = await prisma.customerAddress.findFirst({
      where: { id: customerAddressId, user_id: user.id, is_active: true },
    });

    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Find delivery zone
    const deliveryZone = await prisma.deliveryZone.findFirst({
      where: {
        city: address.city,
        area: address.area,
        is_active: true,
      },
    });

    if (!deliveryZone) {
      return NextResponse.json(
        { error: "Delivery not available in your area" },
        { status: 400 }
      );
    }

    // Validate all cart items and calculate totals
    let subtotal = 0;
    const orderItems: Array<{
      product_id: number;
      product_name: string;
      product_slug: string;
      product_sku: string;
      primary_image_url: string | null;
      unit_price: number;
      quantity: number;
      line_total: number;
    }> = [];

    for (const item of cart.items) {
      const product = item.product;

      // Validate product visibility
      if (!product.is_visible || product.status !== "active") {
        return NextResponse.json(
          { error: `${product.name} is not available` },
          { status: 400 }
        );
      }

      // Validate parent category visibility
      if (
        !product.product_category.is_visible ||
        product.product_category.status !== "active"
      ) {
        return NextResponse.json(
          { error: `${product.name} category is not available` },
          { status: 400 }
        );
      }

      // Validate parent gift type visibility
      const hasActiveGiftType = product.product_category.giftTypes.some(
        (gt) => gt.gift_type.is_visible && gt.gift_type.status === "active"
      );
      if (!hasActiveGiftType) {
        return NextResponse.json(
          { error: `${product.name} is not available` },
          { status: 400 }
        );
      }

      // Validate stock
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      // Get primary image
      const primaryImage = await prisma.productImage.findFirst({
        where: { product_id: product.id, is_primary: true, is_visible: true },
      });

      const price = product.sale_price ?? product.regular_price;
      const lineTotal = price.toNumber() * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_sku: product.sku,
        primary_image_url: primaryImage?.image_url || null,
        unit_price: price.toNumber(),
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    // Check minimum order amount
    if (subtotal < deliveryZone.minimum_order_amount.toNumber()) {
      return NextResponse.json(
        {
          error: `Minimum order amount is Rs. ${deliveryZone.minimum_order_amount.toNumber()}`,
        },
        { status: 400 }
      );
    }

    // Calculate delivery charge
    let deliveryCharge = deliveryZone.delivery_charge.toNumber();
    if (
      deliveryZone.free_delivery_minimum &&
      subtotal >= deliveryZone.free_delivery_minimum.toNumber()
    ) {
      deliveryCharge = 0;
    }

    const grandTotal = subtotal + deliveryCharge;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const orderCount = await tx.order.count();
      const newOrder = await tx.order.create({
        data: {
          user_id: user.id,
          delivery_zone_id: deliveryZone.id,
          order_number: generateOrderNumber(orderCount + 1),
          subtotal,
          delivery_charge: deliveryCharge,
          discount_amount: 0,
          tax_amount: 0,
          grand_total: grandTotal,
          payment_method: paymentMethod as PaymentMethod,
          payment_status: "pending",
          order_status: "pending",
          customer_note: customerNote,
          placed_at: new Date(),
        },
      });

      // Create order items
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            order_id: newOrder.id,
            ...item,
          },
        });
      }

      // Create delivery address snapshot
      await tx.orderDeliveryAddress.create({
        data: {
          order_id: newOrder.id,
          customer_address_id: address.id,
          full_name: address.full_name,
          phone: address.phone,
          alternative_phone: address.alternative_phone,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2,
          city: address.city,
          area: address.area,
          postal_code: address.postal_code,
          delivery_instructions: address.delivery_instructions,
          latitude: address.latitude,
          longitude: address.longitude,
        },
      });

      // Create COD payment record
      await tx.payment.create({
        data: {
          order_id: newOrder.id,
          payment_method: "cod",
          amount: grandTotal,
          currency: "PKR",
          status: "pending",
        },
      });

      // Reduce stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock_quantity: { decrement: item.quantity } },
        });
      }

      // Mark cart as converted
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "converted" },
      });

      // Create order status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: newOrder.id,
          changed_by_user_id: user.id,
          previous_status: "pending",
          new_status: "pending",
          note: "Order placed",
        },
      });

      return newOrder;
    });

    // Send confirmation email
    const template = emailTemplates.orderConfirmation(
      order.order_number,
      user.full_name,
      grandTotal.toString()
    );
    await sendMail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: user.id,
        order_id: order.id,
        type: "order_placed",
        channel: "in_app",
        title: "Order Placed Successfully",
        message: `Your order #${order.order_number} has been placed.`,
        status: "sent",
        sent_at: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}