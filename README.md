# Gift Gallery - Luxury Boutique

## Project Overview

Build a production-ready, full-stack e-commerce and event decor website called **Gift Gallery**, embodying a premium luxury boutique aesthetic. The platform consists of two main business modules:

1. **Gift Shop**: An elegant online store for premium gifts.
2. **Event Decor**: A sophisticated decor booking and quotation system.

The website supports customers, admins, shop managers, riders, and decor staff, with complete, role-based workflows for order and booking management, built with Next.js, TypeScript, MySQL, and Tailwind CSS. Modern aesthetic elements like Champagne backgrounds, metallic gold accents, elegant serif headings, and subtle animations convey a high-end, premium feel throughout both modules.

## Required Technology Stack

* **Frontend Framework**: Next.js with App Router
* **Language**: TypeScript
* **Database**: MySQL 8+
* **ORM**: Prisma ORM
* **Styling**: Tailwind CSS
* **UI Components**: shadcn/ui
* **Authentication**: Auth.js or Better Auth (Credentials & Google OAuth)
* **Validation**: Zod
* **Email System**: Gmail App Password (Google SMTP) with customized templates
* **Background Jobs**: For notification retries (e.g., node-cron or vercel KV/cron for serverless)
* **Storage**: Cloudinary/Amazon S3 for images

## Key Business Workflows

### 💻 User Management & Authentication

*   **Shared User System**: Customers, admins, managers, riders, and staff share a single user model with role-based access.
*   **Registration & Verification**: New customers register with basic info, receive an Email OTP for verification, and must enter valid OTP before login/order.
*   **Authentication Flows**: Credentials (hashed passwords), seamless Google OAuth social login, Forgot Password via Email OTP, and Change Password functionality.

### 🎁 Gift Shop Module (Customer)

*   **Elegant Catalog Navigation**: A logical hierarchy using Gift Type $\xrightarrow{}$ Category $\xrightarrow{}$ Product.
*   **Catalog Browser**: Advanced search, filtering, and pagination support for a clean and efficient browsing experience.
*   **Premium Product Cards**: Feature multiple image support, quick view, wishlist (optional), cart controls, and unique hover animation effects.
*   **Cart & Checkout**: Multi-step backend validation (inventory, price, zone) occurs before final Cash on Delivery (COD) order confirmation within a transactional process.
*   **Advanced Checkout Logic**: Backend calculation of correct delivery charges occurs automatically based on the chosen city and area.
*   **Customer Dashboard**: Allows account management, multi-address storage (with primary/default logic), and simplifies order tracking via a simplified timeline.

### 🚗 Gift Shop Module (Rider & Delivery)

*   **Assignment & Processing**: A dedicated dashboard for riders to handle accepted assignments, pick-up from shop, and confirm delivery.
*   **OTP-Based Handover**: A 6-digit Delivery OTP (expire after 3 hours) is emailed to the customer upon rider pick-up.
*   **Delivery Flow**: Rider must enter and verify customer-provided OTP before backend updates the order status to `delivered` and marks COD payment as `paid`.

### ✨ Event Decor Module (Customer)

*   **Sophisticated Catalog Hierarchy**: Follows a strict model: Event Type $\xrightarrow{}$ Decor Category $\xrightarrow{}$ Decor Package.
*   **Detailed Package View**: Public pages showcase high-quality images and a clear breakdown of included items, terms, and conditions.
*   **Quotation-Based Booking**: Packages display 'starting price' (requires login), where the actual final pricing is custom-generated via a formal quotation process.
*   **Quotation Request:** Customers must complete a form requesting information (venue details, event date, guest count, etc.), and their selected package starting price will be snapshotted.
*   **Quotation Review:** Customers can review formal quotations on their dashboard, provide responses of either 'approved' or 'rejected'.
*   **Dashboard Management:** Allows customers full control over viewing their booking history, current booking details, and providing reviews for completed events.

### 🛠️ Admin & Management (Full Unified System)

*   **Role-Based Access Control (RBAC)**: Fine-grained permissions on the server backend ensure modules are restricted (Admin, Shop/Decor Managers, Riders, Staff).
*   **Comprehensive Dashboards**: Interactive data visualizations (total users, low-stock, gift revenue, pending quotations, confirmed decor bookings, upcoming event dates, failed notifications, active riders, available riders, busy riders, etc.) and comprehensive date filtering available.
*   **Feature-Rich Gift Shop CRUD**: Full control over Gift Types, categories, products (bulk excel import, low-stock alerts, multisync image management), inventory, gift orders (history timeline, rider assignment), delivery zones (charges, minimums, COD availability), riders, and product reviews.
*   **Complete Event Decor Management**: Administration of Event Types, decor categories, and packages (inclusions stored in MySQL JSON), with full control over decor bookings, formal quotations, payment processing, staff assignment management, and review verification.
*   **Platform-Wide Controls**: Full management of SEO, static pages (About Us, Contact Us, Policies), homepage sections, customer database, and complete notification history (badges, logic, emails).

### 🔔 Integrated Notification System

*   **Multi-Channel Strategy**: Initial implementation supports **In-App Notification Badge** and specialized **Email Templates**.
*   **Contextual Alerts**: Triggers notifications for key events across authentication, gift shop flow (order confirmation, on-the-way email with Delivery OTP), and decor management (quotation sent, booking confirmed).
*   **System Reliability**: Features a background job system for automatic retry of failed email notifications.

### 🔍 Search, Filter, SEO & Data Management

*   **Robust Dynamic Routing**: Optimized, clean slugs for Gift Catalog, products, event types, decor categories and packages.
*   **Comprehensive SEO Control**: Full admin interface for on-page SEO (meta title, description, character counters, canonical values). Fallback behavior handles any missing inputs.
*   **Advanced Sitemaps**: Dynamic XML sitemap generation included. Complete management interface using modern static page controls, Open Graph, and JSON-LD structured data.
*   **Mobile First Responsive Design**: Strict design principle ensures all interfaces are completely mobile-responsive and never break across various devices.
*   **Complete Pagination Integration**: pagination implemented throughout search, gift catalogs, customer orders, decor bookings, reviews, and notifications for efficient handling of large datasets.

### 🔒 Security, Integrity & Performance

*   **Backend Validation Priority**: Business logic (product price, stock, delivery charge, total cart value, ownership checks, role permissions, quotation amounts, payment totals) is *strictly* verified again on the backend, ensuring data integrity.
*   **Strong Server Protection**: Implementation of production-grade protection using Zod for input validation, file size/type constraints, SQL injection guards via Prisma, secure session management with Auth.js, CSRF prevention where applicable, and robust rate limiting to control traffic spikes and abusive behavior.
*   **Comprehensive Database Caching**: Backend database connection pooling and optimized indexing on critical fields (Slugs, SKU, Status/Visibility, Foreign Keys, Order/Booking Numbers, User Email) are implemented, maximizing website speed while the external database connection remains robust within serverless deployments.

## Global Color System (Global Theme Configuration)

The platform follows a centralized luxury theme based on the Gift Gallery poster. The entire website maps all visual components, including pages, forms, components, tables, buttons, and admin panels, *directly* to this globally declared color system in `app/globals.css`, ensuring visual consistency across all interfaces. hardcoded color strings are never allowed within any individual code component. Any changes on global context must declare inside `:root`.

| Luxury Theme Global Color Variable | Mapping | Example Color Code |
| :--- | :--- | :--- |
| `--bg-primary` | Primary Background | `#F3E7DB` Champagne |
| `--bg-secondary` | Secondary Background | `#FAF5EF` Ivory |
| `--bg-card` | Card Background | `#FFFDFC` Cream |
| `--gold-primary` | Metallic Primary Gold | `#B8864A` Gold |
| `--gold-light` | Light Gold Accents | `#D8B97A` |
| `--gold-dark` | Dark Gold Accent | `#8E673E` |
| `--rose-gold` | Rose Gold Icons/Highlights| `#C89A7A` |
| `--text-primary` | Primary Text Color | `#6B4A32` Dark Brown |
| `--text-secondary` | Secondary Text Color | `#8D7463` Light Brown |
| `--border-custom` | Global Border Color | `#E6D5C7` Soft Beige |
| `--footer-bg` | Footer Background | `#4D3626` Very Dark Brown|
| `--footer-text` | Footer Text Color | `#FAF5EF` Off-White |

## Design Guidelines

*   **Luxury Aesthetics**: Elegant serif headings ("Playfair Display"), soft shadows, rounded context-aware cards, premium spacing for readability, subtle and premium animations (fade-ins, soft lifts), and optimized imagery conveying highest brand prestige are used throughout the entire product.
*   **Responsive UI**: Strict attention to detail ensures the platform looks polished and functions seamlessly cross mobile, tablet, laptop, and desktop interfaces.

## Database & Structure Integrity

*   **Optimized Indexing**: Backend connection pooling and database indexes are added *strictly* to critical fields (Slugs, SKU, Status, Visibility, Foreign Keys, Order/Booking Numbers, User Email, Product/Decor review fields).
*   **MySQL Transactions**: Critical flows are *always* wrapped inside multi-statement transactions to guarantee consistent data integrity, particularly during concurrent operations in checkout flows, inventory management, order creation, booking confirmations, quotation approvals, staff assignments, delivery OTP verification, and payment updates.
