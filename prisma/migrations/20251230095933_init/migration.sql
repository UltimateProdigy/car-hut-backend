/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `staffs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `staffs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `cars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `staffs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cars" ADD COLUMN     "auction_end_date" TIMESTAMP(3),
ADD COLUMN     "auction_start_date" TIMESTAMP(3),
ADD COLUMN     "buy_now_price" DOUBLE PRECISION,
ADD COLUMN     "current_bid" DOUBLE PRECISION,
ADD COLUMN     "reserve_price" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "staffs" ADD COLUMN     "email" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_winning" BOOLEAN NOT NULL DEFAULT false,
    "car_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bids_car_id_amount_idx" ON "bids"("car_id", "amount");

-- CreateIndex
CREATE INDEX "bids_car_id_created_at_idx" ON "bids"("car_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_username_key" ON "staffs"("username");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_email_key" ON "staffs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
