/*
  Warnings:

  - You are about to drop the column `expiredAt` on the `session` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "expiredAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
