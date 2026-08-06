-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN', 'SHOP_MANAGER', 'RIDER', 'DECOR_MANAGER', 'DECOR_STAFF') NOT NULL DEFAULT 'CUSTOMER',
    `auth_provider` VARCHAR(191) NOT NULL,
    `google_id` VARCHAR(191) NULL,
    `email_verified_at` DATETIME(3) NULL,
    `status` ENUM('active', 'blocked', 'suspended') NOT NULL DEFAULT 'active',
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationOtp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `otp_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `label` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `alternative_phone` VARCHAR(191) NULL,
    `address_line_1` VARCHAR(191) NOT NULL,
    `address_line_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `postal_code` VARCHAR(191) NULL,
    `delivery_instructions` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GiftType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `image_public_id` VARCHAR(191) NULL,
    `image_alt_text` VARCHAR(191) NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL,
    `status` ENUM('draft', 'active', 'inactive', 'archived') NOT NULL DEFAULT 'draft',
    `is_visible` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GiftType_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `image_public_id` VARCHAR(191) NULL,
    `image_alt_text` VARCHAR(191) NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL,
    `status` ENUM('draft', 'active', 'inactive', 'archived') NOT NULL DEFAULT 'draft',
    `is_visible` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `gift_type_id` INTEGER NOT NULL,

    UNIQUE INDEX `ProductCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_category_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `short_description` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `regular_price` DECIMAL(10, 2) NOT NULL,
    `sale_price` DECIMAL(10, 2) NULL,
    `cost_price` DECIMAL(10, 2) NULL,
    `stock_quantity` INTEGER NOT NULL,
    `low_stock_threshold` INTEGER NOT NULL,
    `weight_grams` INTEGER NULL,
    `average_rating` DOUBLE NOT NULL DEFAULT 0,
    `reviews_count` INTEGER NOT NULL DEFAULT 0,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('draft', 'active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NULL,
    `alt_text` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `session_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cart_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `line_total` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryZone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `delivery_charge` DECIMAL(10, 2) NOT NULL,
    `minimum_order_amount` DECIMAL(10, 2) NOT NULL,
    `free_delivery_minimum` DECIMAL(10, 2) NULL,
    `estimated_min_minutes` INTEGER NULL,
    `estimated_max_minutes` INTEGER NULL,
    `cash_on_delivery_available` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `delivery_zone_id` INTEGER NOT NULL,
    `order_number` VARCHAR(191) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `delivery_charge` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL,
    `grand_total` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('cod', 'stripe', 'paypal', 'jazzcash', 'easypaisa', 'bank_transfer') NOT NULL,
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    `order_status` ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'assigned_to_rider', 'picked_up', 'on_the_way', 'delivered', 'cancelled', 'returned') NOT NULL DEFAULT 'pending',
    `customer_note` VARCHAR(191) NULL,
    `delivery_date` DATETIME(3) NULL,
    `delivery_time_slot` VARCHAR(191) NULL,
    `placed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmed_at` DATETIME(3) NULL,
    `ready_at` DATETIME(3) NULL,
    `picked_up_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_order_number_key`(`order_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `product_slug` VARCHAR(191) NULL,
    `product_sku` VARCHAR(191) NOT NULL,
    `primary_image_url` VARCHAR(191) NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `line_total` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDeliveryAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `customer_address_id` INTEGER NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `alternative_phone` VARCHAR(191) NULL,
    `address_line_1` VARCHAR(191) NOT NULL,
    `address_line_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `postal_code` VARCHAR(191) NULL,
    `delivery_instructions` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OrderDeliveryAddress_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `payment_method` ENUM('cod', 'stripe', 'paypal', 'jazzcash', 'easypaisa', 'bank_transfer') NOT NULL,
    `gateway_name` VARCHAR(191) NULL,
    `transaction_id` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    `gateway_response` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `changed_by_user_id` INTEGER NULL,
    `previous_status` ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'assigned_to_rider', 'picked_up', 'on_the_way', 'delivered', 'cancelled', 'returned') NOT NULL,
    `new_status` ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'assigned_to_rider', 'picked_up', 'on_the_way', 'delivered', 'cancelled', 'returned') NOT NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `order_item_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `is_verified_purchase` BOOLEAN NOT NULL DEFAULT false,
    `admin_reply` VARCHAR(191) NULL,
    `admin_replied_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `order_id` INTEGER NULL,
    `decor_booking_id` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `sent_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryOtp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `otp_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `verified_at` DATETIME(3) NULL,
    `invalidated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiderProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `vehicle_type` VARCHAR(191) NULL,
    `vehicle_number` VARCHAR(191) NULL,
    `availability_status` VARCHAR(191) NOT NULL DEFAULT 'available',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RiderProfile_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderRiderAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `rider_user_id` INTEGER NOT NULL,
    `assigned_by_user_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'assigned',
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accepted_at` DATETIME(3) NULL,
    `picked_up_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `short_description` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `image_public_id` VARCHAR(191) NULL,
    `image_alt_text` VARCHAR(191) NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL,
    `status` ENUM('draft', 'active', 'inactive', 'archived') NOT NULL DEFAULT 'draft',
    `is_visible` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EventType_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_type_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `short_description` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `image_public_id` VARCHAR(191) NULL,
    `image_alt_text` VARCHAR(191) NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL,
    `status` ENUM('draft', 'active', 'inactive', 'archived') NOT NULL DEFAULT 'draft',
    `is_visible` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DecorCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_category_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `package_code` VARCHAR(191) NOT NULL,
    `short_description` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `included_items` JSON NOT NULL,
    `excluded_items` JSON NULL,
    `terms_and_conditions` VARCHAR(191) NULL,
    `starting_price` DECIMAL(10, 2) NOT NULL,
    `sale_price` DECIMAL(10, 2) NULL,
    `estimated_setup_hours` INTEGER NULL,
    `maximum_guests` INTEGER NULL,
    `service_city` VARCHAR(191) NULL,
    `average_rating` DOUBLE NOT NULL DEFAULT 0,
    `reviews_count` INTEGER NOT NULL DEFAULT 0,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('draft', 'active', 'inactive', 'archived') NOT NULL DEFAULT 'draft',
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DecorPackage_slug_key`(`slug`),
    UNIQUE INDEX `DecorPackage_package_code_key`(`package_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorPackageImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_package_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NULL,
    `alt_text` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `decor_package_id` INTEGER NOT NULL,
    `event_type_id` INTEGER NOT NULL,
    `booking_number` VARCHAR(191) NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `event_start_time` VARCHAR(191) NULL,
    `event_end_time` VARCHAR(191) NULL,
    `guest_count` INTEGER NULL,
    `venue_type` VARCHAR(191) NULL,
    `venue_name` VARCHAR(191) NULL,
    `theme_preferences` VARCHAR(191) NULL,
    `customer_notes` VARCHAR(191) NULL,
    `package_starting_price` DECIMAL(10, 2) NOT NULL,
    `transport_charge` DECIMAL(10, 2) NOT NULL,
    `quoted_amount` DECIMAL(10, 2) NULL,
    `final_amount` DECIMAL(10, 2) NULL,
    `booking_status` ENUM('pending', 'under_review', 'site_visit_required', 'site_visit_completed', 'quotation_sent', 'customer_approved', 'confirmed', 'preparation_started', 'team_dispatched', 'setup_in_progress', 'setup_completed', 'event_completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `payment_method` ENUM('cod', 'stripe', 'paypal', 'jazzcash', 'easypaisa', 'bank_transfer') NULL,
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DecorBooking_booking_number_key`(`booking_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorBookingVenue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_booking_id` INTEGER NOT NULL,
    `customer_address_id` INTEGER NULL,
    `contact_name` VARCHAR(191) NOT NULL,
    `contact_phone` VARCHAR(191) NOT NULL,
    `alternative_phone` VARCHAR(191) NULL,
    `venue_name` VARCHAR(191) NULL,
    `address_line_1` VARCHAR(191) NOT NULL,
    `address_line_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `postal_code` VARCHAR(191) NULL,
    `venue_instructions` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DecorBookingVenue_decor_booking_id_key`(`decor_booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorQuotation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_booking_id` INTEGER NOT NULL,
    `quotation_number` VARCHAR(191) NOT NULL,
    `package_amount` DECIMAL(10, 2) NOT NULL,
    `transport_charge` DECIMAL(10, 2) NOT NULL,
    `additional_charge` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `valid_until` DATETIME(3) NULL,
    `status` ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled') NOT NULL DEFAULT 'draft',
    `created_by_user_id` INTEGER NOT NULL,
    `accepted_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DecorQuotation_quotation_number_key`(`quotation_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorTeamAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_booking_id` INTEGER NOT NULL,
    `assigned_user_id` INTEGER NOT NULL,
    `assigned_by_user_id` INTEGER NOT NULL,
    `role_name` VARCHAR(191) NOT NULL,
    `assignment_status` ENUM('assigned', 'accepted', 'working', 'completed', 'cancelled') NOT NULL DEFAULT 'assigned',
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accepted_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorBookingPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_booking_id` INTEGER NOT NULL,
    `payment_type` ENUM('advance', 'remaining', 'full', 'refund') NOT NULL,
    `payment_method` ENUM('cod', 'stripe', 'paypal', 'jazzcash', 'easypaisa', 'bank_transfer') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NULL,
    `status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorBookingStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_booking_id` INTEGER NOT NULL,
    `changed_by_user_id` INTEGER NULL,
    `previous_status` ENUM('pending', 'under_review', 'site_visit_required', 'site_visit_completed', 'quotation_sent', 'customer_approved', 'confirmed', 'preparation_started', 'team_dispatched', 'setup_in_progress', 'setup_completed', 'event_completed', 'cancelled') NOT NULL,
    `new_status` ENUM('pending', 'under_review', 'site_visit_required', 'site_visit_completed', 'quotation_sent', 'customer_approved', 'confirmed', 'preparation_started', 'team_dispatched', 'setup_in_progress', 'setup_completed', 'event_completed', 'cancelled') NOT NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DecorReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decor_booking_id` INTEGER NOT NULL,
    `decor_package_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `is_verified_booking` BOOLEAN NOT NULL DEFAULT false,
    `admin_reply` VARCHAR(191) NULL,
    `admin_replied_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerificationOtp` ADD CONSTRAINT `VerificationOtp_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerAddress` ADD CONSTRAINT `CustomerAddress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_gift_type_id_fkey` FOREIGN KEY (`gift_type_id`) REFERENCES `GiftType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_product_category_id_fkey` FOREIGN KEY (`product_category_id`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `Cart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_delivery_zone_id_fkey` FOREIGN KEY (`delivery_zone_id`) REFERENCES `DeliveryZone`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeliveryAddress` ADD CONSTRAINT `OrderDeliveryAddress_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_changed_by_user_id_fkey` FOREIGN KEY (`changed_by_user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductReview` ADD CONSTRAINT `ProductReview_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductReview` ADD CONSTRAINT `ProductReview_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductReview` ADD CONSTRAINT `ProductReview_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `OrderItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryOtp` ADD CONSTRAINT `DeliveryOtp_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryOtp` ADD CONSTRAINT `DeliveryOtp_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiderProfile` ADD CONSTRAINT `RiderProfile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRiderAssignment` ADD CONSTRAINT `OrderRiderAssignment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRiderAssignment` ADD CONSTRAINT `OrderRiderAssignment_rider_user_id_fkey` FOREIGN KEY (`rider_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRiderAssignment` ADD CONSTRAINT `OrderRiderAssignment_assigned_by_user_id_fkey` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorCategory` ADD CONSTRAINT `DecorCategory_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `EventType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorPackage` ADD CONSTRAINT `DecorPackage_decor_category_id_fkey` FOREIGN KEY (`decor_category_id`) REFERENCES `DecorCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorPackageImage` ADD CONSTRAINT `DecorPackageImage_decor_package_id_fkey` FOREIGN KEY (`decor_package_id`) REFERENCES `DecorPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBooking` ADD CONSTRAINT `DecorBooking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBooking` ADD CONSTRAINT `DecorBooking_decor_package_id_fkey` FOREIGN KEY (`decor_package_id`) REFERENCES `DecorPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBooking` ADD CONSTRAINT `DecorBooking_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `EventType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBookingVenue` ADD CONSTRAINT `DecorBookingVenue_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorQuotation` ADD CONSTRAINT `DecorQuotation_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorQuotation` ADD CONSTRAINT `DecorQuotation_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorTeamAssignment` ADD CONSTRAINT `DecorTeamAssignment_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorTeamAssignment` ADD CONSTRAINT `DecorTeamAssignment_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorTeamAssignment` ADD CONSTRAINT `DecorTeamAssignment_assigned_by_user_id_fkey` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBookingPayment` ADD CONSTRAINT `DecorBookingPayment_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBookingStatusHistory` ADD CONSTRAINT `DecorBookingStatusHistory_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorBookingStatusHistory` ADD CONSTRAINT `DecorBookingStatusHistory_changed_by_user_id_fkey` FOREIGN KEY (`changed_by_user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorReview` ADD CONSTRAINT `DecorReview_decor_booking_id_fkey` FOREIGN KEY (`decor_booking_id`) REFERENCES `DecorBooking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorReview` ADD CONSTRAINT `DecorReview_decor_package_id_fkey` FOREIGN KEY (`decor_package_id`) REFERENCES `DecorPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DecorReview` ADD CONSTRAINT `DecorReview_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
