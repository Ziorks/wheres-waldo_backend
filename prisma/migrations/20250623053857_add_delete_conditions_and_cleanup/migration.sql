/*
  Warnings:

  - You are about to drop the column `locationId` on the `Character` table. All the data in the column will be lost.
  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Location` table. All the data in the column will be lost.
  - The primary key for the `Objective` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Objective` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[characterId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `characterId` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_locationId_fkey";

-- DropIndex
DROP INDEX "Character_locationId_key";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "Location" DROP CONSTRAINT "Location_pkey",
DROP COLUMN "id",
ADD COLUMN     "characterId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Objective" DROP CONSTRAINT "Objective_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Objective_pkey" PRIMARY KEY ("characterId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_characterId_key" ON "Location"("characterId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
