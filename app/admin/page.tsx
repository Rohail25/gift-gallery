import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, Users, Package, Calendar, DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [
    totalUsers,
    verifiedUsers,
    newCustomers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    pendingOrders,
    preparingOrders,
    onTheWayOrders,
    deliveredOrders,
    totalRevenue,
    pendingDecorBookings,
    quotationsAwaiting,
    confirmedBookings,
    pendingReviews,
    failedNotifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { email_verified_at: { not: null } } }),
    prisma.user.count({ where: { role: "CUSTOMER", created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.product.count(),
    prisma.product.count({ where: { stock_quantity: { lte: prisma.product.fields.low_stock_threshold } } }),
    prisma.product.count({ where: { stock_quantity: 0 } }),
    prisma.order.count({ where: { order_status: "pending" } }),
    prisma.order.count({ where: { order_status: "preparing" } }),
    prisma.order.count({ where: { order_status: "on_the_way" } }),
    prisma.order.count({ where: { order_status: "delivered" } }),
    prisma.order.aggregate({ _sum: { grand_total: true }, where: { order_status: "delivered" } }),
    prisma.decorBooking.count({ where: { booking_status: "pending" } }),
    prisma.decorQuotation.count({ where: { status: "sent" } }),
    prisma.decorBooking.count({ where: { booking_status: "confirmed" } }),
    prisma.productReview.count({ where: { status: "pending" } }),
    prisma.notification.count({ where: { status: "failed" } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      order_number: true,
      order_status: true,
      grand_total: true,
      created_at: true,
      user: { select: { full_name: true } },
      delivery_zone: { select: { name: true } },
    },
  });

  return {
    totalUsers,
    verifiedUsers,
    newCustomers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    pendingOrders,
    preparingOrders,
    onTheWayOrders,
    deliveredOrders,
    totalRevenue: totalRevenue._sum.grand_total || 0,
    pendingDecorBookings,
    quotationsAwaiting,
    confirmedBookings,
    pendingReviews,
    failedNotifications,
    recentOrders,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-luxury text-gold-primary">Dashboard Overview</h1>
        <p className="text-text-secondary">Welcome back, Admin</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Users</p>
              <p className="text-2xl font-luxury text-text-primary">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-custom">
            <p className="text-sm text-text-secondary">
              <span className="text-green-600 font-medium">+{stats.newCustomers}</span> new this week
            </p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Products</p>
              <p className="text-2xl font-luxury text-text-primary">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-custom">
            <p className="text-sm text-text-secondary">
              <span className="text-yellow-600 font-medium">{stats.lowStockProducts}</span> low stock
            </p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Pending Orders</p>
              <p className="text-2xl font-luxury text-text-primary">{stats.pendingOrders}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-custom">
            <p className="text-sm text-text-secondary">
              <span className="text-blue-600 font-medium">{stats.preparingOrders}</span> preparing
            </p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-luxury text-text-primary">
                Rs. {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-custom">
            <p className="text-sm text-text-secondary">
              <span className="text-green-600 font-medium">{stats.deliveredOrders}</span> delivered
            </p>
          </div>
        </div>
      </div>

      {/* Decor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Pending Decor Bookings</p>
              <p className="text-2xl font-luxury text-text-primary">{stats.pendingDecorBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Quotations Awaiting Response</p>
              <p className="text-2xl font-luxury text-text-primary">{stats.quotationsAwaiting}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Confirmed Bookings</p>
              <p className="text-2xl font-luxury text-text-primary">{stats.confirmedBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.outOfStockProducts > 0 || stats.pendingReviews > 0 || stats.failedNotifications > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-luxury text-text-primary mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Attention Required
          </h3>
          <div className="space-y-2">
            {stats.outOfStockProducts > 0 && (
              <p className="text-sm text-text-secondary">
                • <span className="font-medium text-red-600">{stats.outOfStockProducts}</span> products are out of stock
              </p>
            )}
            {stats.pendingReviews > 0 && (
              <p className="text-sm text-text-secondary">
                • <span className="font-medium text-yellow-600">{stats.pendingReviews}</span> product reviews pending approval
              </p>
            )}
            {stats.failedNotifications > 0 && (
              <p className="text-sm text-text-secondary">
                • <span className="font-medium text-red-600">{stats.failedNotifications}</span> failed notifications need attention
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <h3 className="font-luxury text-text-primary flex items-center gap-2">
            <Package className="w-5 h-5 text-gold-primary" />
            Recent Orders
          </h3>
          <Link href="/admin/orders" className="text-sm text-gold-primary hover:text-gold-dark transition">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Order #</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Zone</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-text-primary">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                    No orders yet
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-secondary/50 transition">
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-gold-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-primary">{order.user.full_name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{order.delivery_zone.name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-bg-secondary text-text-primary capitalize">
                        {order.order_status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-text-primary">
                      Rs. {Number(order.grand_total).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 p-4 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
        >
          <ShoppingBag className="w-5 h-5" />
          Add Product
        </Link>
        <Link
          href="/admin/orders?status=pending"
          className="flex items-center justify-center gap-2 p-4 border border-gold-primary text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition"
        >
          <Package className="w-5 h-5" />
          View Orders
        </Link>
        <Link
          href="/admin/decor-bookings?status=pending"
          className="flex items-center justify-center gap-2 p-4 border border-gold-primary text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition"
        >
          <Calendar className="w-5 h-5" />
          Decor Bookings
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center justify-center gap-2 p-4 border border-gold-primary text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition"
        >
          <Users className="w-5 h-5" />
          Manage Users
        </Link>
      </div>
    </div>
  );
}
