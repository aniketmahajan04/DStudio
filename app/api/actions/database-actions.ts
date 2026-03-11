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
  DatabaseType,
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const adapter = DatabaseAdapterFactory.createAdapter(config);
    const testResult = await adapter.testConnection();

    if (!testResult.success) {
      return { success: false, error: testResult.error };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to test connection";
    return { success: false, error: message };
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save connection and fetch metadata";
    return { success: false, error: message };
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to connect to save connection";
    return { success: false, error: message };
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to Fetch table data";
    return { success: false, error: message };
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
        executedTime: executionTime,
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

/*
 * Save Frequent queries to db
 */

async function saveQuery(
  name: string,
  sqlQuery: string,
  dbType: DatabaseType,
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const prismaDbType =
      dbType === "postgresql"
        ? "POSTGRES"
        : dbType === "mysql"
          ? "MYSQL"
          : "SQLITE";

    const savedQuery = await prisma.savedQuery.create({
      data: {
        name,
        sqlQuery,
        dbType: prismaDbType,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      data: { id: savedQuery.id },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save query";
    return { success: false, error: message };
  }
}

/*
 * Get all saved queries
 */

async function getSavedQueries(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    sqlQuery: string;
    dbType: "postgresql" | "mysql" | "sqlite";
    createdAt: Date;
    updatedAt: Date;
  }>;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const queries = await prisma.savedQuery.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      data: queries.map((q) => ({
        ...q,
        dbType: mapDbType(q.dbType),
      })),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get saved queries";
    return { success: false, error: message };
  }
}

async function deleteSavedQuery(
  queryId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.savedQuery.delete({
      where: {
        id: queryId,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete saved query";
    return { success: false, error: message };
  }
}

async function updateSavedQuery(
  queryId: string,
  name: string,
  sqlQuery: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.savedQuery.update({
      where: {
        id: queryId,
        userId: session.user.id,
      },
      data: {
        name,
        sqlQuery,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update saved query";
    return { success: false, error: message };
  }
}

async function getQueryHistory(
  connectionId: string,
  limit: 30,
): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    sqlQuery: string;
    status: "SUCCESS" | "FAILED";
    executedTime: number;
    errorMessage: string | null;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const histories = await prisma.history.findMany({
      where: {
        connectionId,
        connection: {
          userId: session.user.id,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: histories,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch query history";
    return { success: false, error: message };
  }
}

async function refreshTableMetadata(
  connectionId: string,
  schema: string,
  tableName: string,
): Promise<{
  success: boolean;
  data?: TableMetaData;
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

    const tableMetaData = await adapter.getTableSchema(schema, tableName);

    return {
      success: true,
      data: tableMetaData,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to refresh table metadata";
    return { success: false, error: message };
  }
}

async function getUserConnections(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    connectionName: string;
    type: DatabaseType;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const connections = await prisma.connection.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        connectionName: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: connections.map((conn) => ({
        id: conn.id,
        connectionName: conn.connectionName,
        type: conn.type.toLowerCase() as "postgresql" | "mysql" | "sqlite",
        createdAt: conn.createdAt,
      })),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch user connections";
    return { success: false, error: message };
  }
}

export {
  testConnectionToDatabase,
  saveConnectionAndFetchMetadata,
  connectToSavedConnection,
  fetchTableData,
  executeQuery,
  saveQuery,
  getSavedQueries,
  deleteSavedQuery,
  updateSavedQuery,
  getQueryHistory,
  refreshTableMetadata,
  getUserConnections,
};
