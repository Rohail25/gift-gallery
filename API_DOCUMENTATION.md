# API Documentation

## Auth APIs
- `POST /api/auth/register` (Register credentials)
- `POST /api/auth/verify-otp` (Account activation via email code)

## Product APIs
- `GET /api/products` (Paginated product feed filtering visible statuses)
- `POST /api/products` (Admin/Manager role required to create new product)

## Cart & Checkout APIs
- `GET /api/cart` (Get session specific cart entries)
- `POST /api/cart` (Add/update cart quantities)
- `POST /api/checkout` (Transactional order placement processing subtotal, zone delivery and stock mutations)

## Event Decor Booking APIs
- `POST /api/decor-bookings` (Customer facing quotation booking)
- `POST /api/quotations` (Admin generation of price quote mapping back to decor bookings)

## Rider Logistics APIs
- `POST /api/rider/assign` (Admin maps riderUserId to Order ID)
- `POST /api/rider/verify-delivery` (Rider matches 6-digit delivery OTP to confirm cash collection and successful handover)
