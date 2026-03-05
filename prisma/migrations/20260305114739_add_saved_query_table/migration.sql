-- CreateTable
CREATE TABLE "saved_queries" (
    "id" TEXT NOT NULL,
    "query_name" TEXT NOT NULL,
    "sql_query" TEXT NOT NULL,
    "db_type" "DbType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "saved_queries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "saved_queries" ADD CONSTRAINT "saved_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
