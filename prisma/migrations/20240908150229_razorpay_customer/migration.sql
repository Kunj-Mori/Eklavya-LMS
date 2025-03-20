/*
  Warnings:

  - You are about to drop the `RazorpayOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `RazorpayOrder`;

-- CreateTable
CREATE TABLE `RazorpayCustomer` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RazorpayCustomer_orderId_key`(`orderId`),
    INDEX `RazorpayCustomer_userId_idx`(`userId`),
    INDEX `RazorpayCustomer_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
