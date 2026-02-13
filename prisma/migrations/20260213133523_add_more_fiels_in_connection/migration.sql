-- AlterTable
ALTER TABLE "connections" ADD COLUMN     "database" TEXT,
ADD COLUMN     "host" TEXT,
ADD COLUMN     "last_connected" TIMESTAMP(3),
ADD COLUMN     "port" INTEGER,
ADD COLUMN     "username" TEXT;
