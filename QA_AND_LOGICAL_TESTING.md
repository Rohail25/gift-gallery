# QA and Logical Testing Guide

## 1. Authentication Testing
- Test successful registration creating user in database with hashed password.
- Verify OTP generation and expiry checking.
- Test login fails if the user is suspended or blocked.
- Test password reset logic overrides the previous hash securely.

## 2. Authorization & Role Testing
- Only ADMIN or SHOP_MANAGER can access CRUD for products.
- Check rider restriction – can only view assigned orders, cannot see general administration logic.

## 3. Product Module Testing
- Confirm bulk imports handle non-unique SKUs gracefully.
- Test category/gift-type visibility rules – a hidden gift type hides the category and its products in general catalog.

## 4. Checkout Testing & Transactions
- Place order with insufficient product stock – should fail entirely (ROLLBACK).
- Validate incorrect region or hidden address denies checkout.
- Check empty carts are denied from hitting checkout API.

## 5. Rider Handover and Delivery
- Test OTP logic: if the rider submits wrong OTP 5+ times, it is invalidated.
- Verify setting order string to "delivered" strictly requires OTP matched success.

## 6. Security Testing
- Verify XSS escaping across form inputs (especially Notes fields).

## 7. Business Logic Testing
- Validate 3-hours expiry timer logic for delivery OTP.
- Test Quotations correctly calculate total price using (package + transport + additional - discount).
