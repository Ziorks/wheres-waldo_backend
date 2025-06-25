/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `vector2dId` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vector2dId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Objective" DROP CONSTRAINT "Objective_gameId_fkey";

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "vector2dId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "vector2dId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Location";

-- CreateTable
CREATE TABLE "Vector2d" (
    "id" SERIAL NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "Vector2d_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_vector2dId_fkey" FOREIGN KEY ("vector2dId") REFERENCES "Vector2d"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_vector2dId_fkey" FOREIGN KEY ("vector2dId") REFERENCES "Vector2d"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
