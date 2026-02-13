/*
  Warnings:

  - You are about to drop the column `idAddress` on the `session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "idAddress",
ADD COLUMN     "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DEFAULT false;
