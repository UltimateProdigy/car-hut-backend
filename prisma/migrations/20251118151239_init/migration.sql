/*
  Warnings:

  - You are about to drop the column `brandId` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the `favourites` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `brand_id` to the `cars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `cars` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cars" DROP CONSTRAINT "cars_brandId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cars" DROP CONSTRAINT "cars_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cars" DROP CONSTRAINT "cars_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favourites" DROP CONSTRAINT "favourites_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favourites" DROP CONSTRAINT "favourites_userId_fkey";

-- AlterTable
ALTER TABLE "cars" DROP COLUMN "brandId",
DROP COLUMN "categoryId",
DROP COLUMN "userId",
ADD COLUMN     "brand_id" TEXT NOT NULL,
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."favourites";

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_car_id_key" ON "favorites"("user_id", "car_id");

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
