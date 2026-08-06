-- CreateTable
CREATE TABLE `gift_type_product_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gift_type_id` INTEGER NOT NULL,
    `product_category_id` INTEGER NOT NULL,

    INDEX `gift_type_product_categories_product_category_id_idx`(`product_category_id`),
    UNIQUE INDEX `gift_type_product_categories_gift_type_id_product_category_i_key`(`gift_type_id`, `product_category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill existing category -> gift type mappings into the junction table
INSERT INTO `gift_type_product_categories` (`gift_type_id`, `product_category_id`)
SELECT `gift_type_id`, `id` FROM `productcategory`
WHERE `gift_type_id` IS NOT NULL;

-- DropForeignKey
ALTER TABLE `productcategory` DROP FOREIGN KEY `ProductCategory_gift_type_id_fkey`;

-- DropIndex
DROP INDEX `ProductCategory_gift_type_id_fkey` ON `productcategory`;

-- AlterTable
ALTER TABLE `productcategory` DROP COLUMN `gift_type_id`;

-- AddForeignKey
ALTER TABLE `gift_type_product_categories` ADD CONSTRAINT `gift_type_product_categories_gift_type_id_fkey` FOREIGN KEY (`gift_type_id`) REFERENCES `GiftType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_type_product_categories` ADD CONSTRAINT `gift_type_product_categories_product_category_id_fkey` FOREIGN KEY (`product_category_id`) REFERENCES `ProductCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
