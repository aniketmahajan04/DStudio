"use server";

import { auth, prisma } from "@/lib/auth";
import { encryptConnectionUrl } from "@/lib/crypto/encryption";
import { DatabaseAdapterFactory } from "@/lib/database/adapter-factory";
import {
  ConnectionConfig,
  DatabaseMetaData,
  TableMetaData,
} from "@/lib/database/types";
import { adapter } from "next/dist/server/web/adapter";

async function testConnectionToDatabase(config: ConnectionConfig) {
  try {
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, error: "Unauthorized" };
    // }
    const adapter = DatabaseAdapterFactory.createAdapter(config);
    const testResult = await adapter.testConnection();

    if (!testResult.success) {
      return { success: false, error: testResult.error };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function saveConnectionAndFetchMetadata(
  connectionName: string,
  config: ConnectionConfig,
): Promise<{
  success: boolean;
  data?: {
    connectionId: string;
    metadata: DatabaseMetaData;
    tableDetails: TableMetaData[];
  };
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    let connectionUrl: string;

    const adapter = DatabaseAdapterFactory.createAdapter(config);
    if (config.connectionString) {
      connectionUrl = config.connectionString;
    } else {
      connectionUrl = adapter.buildConnectionString(config);
    }

    const testResult = await adapter.testConnection();
    if (testResult.success) {
      return { success: false, error: testResult.error };
    }

    const { encryptedUrl, iv } = encryptConnectionUrl(connectionUrl);

    const connection = await prisma.connection.create({
      data: {
        connectionName,
        type:
          config.type === "postgresql"
            ? "POSTGRES"
            : config.type === "mysql"
              ? "MYSQL"
              : "SQLITE",
        connectionUrl: encryptedUrl,
        iv,
        userId: session.user.id,
      },
    });

    const metadata = await adapter.getDatabaseMetadata();

    const tableDetailsPromises: Promise<TableMetaData>[] = [];

    for (const schema of metadata.schemas) {
      for (const table of schema.tables) {
        tableDetailsPromises.push(
          adapter.getTableSchema(schema.name, table.name),
        );
      }
    }

    const tableDetails = await Promise.all(tableDetailsPromises);

    return {
      success: true,
      data: {
        connectionId: connection.id,
        metadata,
        tableDetails,
      },
    };
  } catch (err: any) {
    console.error("Save connection error:", err);
    return { success: false, error: err.message };
  }
}

export { testConnectionToDatabase, saveConnectionAndFetchMetadata };
