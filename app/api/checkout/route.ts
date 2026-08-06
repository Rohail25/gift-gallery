// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckoutSchema } from "@/validators/order";
import { handleApiError } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { customerAddressId, paymentMethod, customerNote } = CheckoutSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    const cart = await prisma.cart.findFirst({
      where: { user_id: user!.id, status: "active" },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const address = await prisma.customerAddress.findFirst({
        where: { id: customerAddressId, user_id: user!.id, is_active: true }
    });
    if (!address) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

    const deliveryZone = await prisma.deliveryZone.findFirst({
        where: { city: address.city, area: address.area, is_active: true }
    });
    if (!deliveryZone) return NextResponse.json({ error: "No delivery zone" }, { status: 400 });

    let subtotal = 0;
    for(const item of cart.items) {
       subtotal += (item.product.sale_price ?? item.product.regular_price).toNumber() * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
              user_id: user!.id,
              delivery_zone_id: deliveryZone.id,
              order_number: `ORD-${Date.now()}`,
              subtotal,
              delivery_charge: deliveryZone.delivery_charge,
              discount_amount: 0,
              tax_amount: 0,
              grand_total: subtotal + deliveryZone.delivery_charge.toNumber(),
              payment_method: paymentMethod,
              payment_status: "pending",
              order_status: "pending",
              customer_note: customerNote,
              placed_at: new Date()
            }
        });

        for(const item of cart.items) {
           await tx.orderItem.create({
               data: {
                   order_id: newOrder.id,
                   product_name: item.product.name,
                   product_sku: item.product.sku,
                   unit_price: item.product.sale_price ?? item.product.regular_price,
                   quantity: item.quantity,
                   line_total: (item.product.sale_price ?? item.product.regular_price).toNumber() * item.quantity,
               }
           });
           await tx.product.update({
               where: { id: item.product_id },
               data: { stock_quantity: { decrement: item.quantity } }
           });
        }
        await tx.cart.update({ where: { id: cart.id }, data: { status: "converted" } });
        return newOrder;
    });

    return NextResponse.json({ message: "Order placed", order }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
