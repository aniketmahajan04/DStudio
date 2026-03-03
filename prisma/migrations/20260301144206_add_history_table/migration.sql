/*
  Warnings:

  - You are about to drop the column `database` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `host` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `port` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `connections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "connections" DROP COLUMN "database",
DROP COLUMN "host",
DROP COLUMN "port",
DROP COLUMN "username";

-- CreateTable
CREATE TABLE "history" (
    "id" TEXT NOT NULL,
    "sql_query" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "executedTime" INTEGER NOT NULL,
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connection_id" TEXT NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
