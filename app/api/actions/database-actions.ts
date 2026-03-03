"use server";

import { auth, prisma } from "@/lib/auth";
import {
  decryptConnectionUrl,
  encryptConnectionUrl,
} from "@/lib/crypto/encryption";
import { DatabaseAdapterFactory } from "@/lib/database/adapter-factory";
import { PostgreSQLAdapter } from "@/lib/database/adapters/postgresql-adapter";
import {
  ConnectionConfig,
  DatabaseMetaData,
  TableMetaData,
} from "@/lib/database/types";
import { headers } from "next/headers";

function mapDbType(
  dbType: "POSTGRES" | "MYSQL" | "SQLITE",
): "postgresql" | "mysql" | "sqlite" {
  const map = {
    POSTGRES: "postgresql" as const,
    MYSQL: "mysql" as const,
    SQLITE: "sqlite" as const,
  };
  return map[dbType];
}

async function testConnectionToDatabase(config: ConnectionConfig) {
  try {
    const session = await auth.api.getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
    if (!testResult.success) {
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

async function connectToSavedConnection(connectionId: string): Promise<{
  success: boolean;
  data?: {
    connectionName: string;
    metadata: DatabaseMetaData;
    tableDetails: TableMetaData[];
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        userId: session.user.id,
      },
    });

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    const connectionUrl = decryptConnectionUrl(
      connection.connectionUrl,
      connection.iv,
    );

    const config: ConnectionConfig = {
      type: mapDbType(connection.type),
      connectionString: connectionUrl,
    };

    const adapter = new PostgreSQLAdapter(config);

    const testResult = await adapter.testConnection();
    if (!testResult.success) {
      return { success: false, error: testResult.error };
    }

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
        connectionName: connection.connectionName,
        metadata,
        tableDetails,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function fetchTableData(
  connectionId: string,
  schema: string,
  tableName: string,
  page: number = 1,
  pageSize: number = 50,
): Promise<{
  success: boolean;
  data?: {
    rows: any[];
    totalCount: number;
    columns: string[];
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        userId: session.user.id,
      },
    });

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    const connectionUrl = decryptConnectionUrl(
      connection.connectionUrl,
      connection.iv,
    );

    const config: ConnectionConfig = {
      type: mapDbType(connection.type),
      connectionString: connectionUrl,
    };

    const adapter = new PostgreSQLAdapter(config);
    const result = await adapter.getTableData(
      schema,
      tableName,
      page,
      pageSize,
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Execute raw postgresql query and save to history
 */

async function executeQuery(
  connectionId: string,
  query: string,
): Promise<{
  success: boolean;
  data?: {
    rows: any[];
    rowCount: number;
    fields: string[];
    executionTime: number;
  };
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        userId: session.user.id,
      },
    });

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    const connectionUrl = decryptConnectionUrl(
      connection.connectionUrl,
      connection.iv,
    );

    const config: ConnectionConfig = {
      type: mapDbType(connection.type),
      connectionString: connectionUrl,
    };

    const adapter = new PostgreSQLAdapter(config);
    const result = await adapter.executeQuery(query);

    const executionTime = Date.now() - startTime;

    await prisma.history.create({
      data: {
        sqlQuery: query,
        status: "SUCCESS",
        executiedTime: executionTime,
        connectionId: connection.id,
      },
    });

    return {
      success: true,
      data: {
        ...result,
        executionTime,
      },
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user.id) {
        const connection = await prisma.connection.findFirst({
          where: {
            id: connectionId,
            userId: session.user.id,
          },
        });

        if (connection) {
          await prisma.history.create({
            data: {
              sqlQuery: query,
              status: "FAILED",
              executedTime: executionTime,
              errorMessage: error.message,
              connectionId: connection.id,
            },
          });
        }
      }
    } catch (historyError) {
      console.error("Failed to save history", historyError);
    }

    return { success: false, error: error.message };
  }
}

export {
  testConnectionToDatabase,
  saveConnectionAndFetchMetadata,
  connectToSavedConnection,
  fetchTableData,
  executeQuery,
};
