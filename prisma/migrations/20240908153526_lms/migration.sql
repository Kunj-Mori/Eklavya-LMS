/*
  Warnings:

  - Added the required column `razorpaypaymentid` to the `RazorpayCustomer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RazorpayCustomer` ADD COLUMN `razorpaypaymentid` VARCHAR(191) NOT NULL;
