import postgres from "postgres";
import {
  ConnectionConfig,
  DatabaseMetaData,
  SchemaMetaData,
  TableMetaData,
} from "../types";
import { DatabaseAdapter } from "./base-adapter";

export class PostgreSQLAdapter extends DatabaseAdapter {
  constructor(config: ConnectionConfig) {
    super(config);
  }

  protected buildConnectionString(config: ConnectionConfig): string {
    if (config.connectionString) return config.connectionString;

    const { username, password, database, host, port, ssl } = config;

    let connStr = `postgresql://${username}:${password}@${host}:${port || 5432}/${database}`;
    if (ssl) connStr += "?sslmode=require";
    return connStr;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const sql = postgres(this.connectionString, { connect_timeout: 5 });
      await sql`SELECT 1`;
      await sql.end();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getDatabaseMetadata(): Promise<DatabaseMetaData> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });
    try {
      const versionResult = await sql`SELECT version()`;
      const version = versionResult[0].version;

      const schemas = await this.getSchema();

      return {
        type: "postgresql",
        version,
        schemas,
      };
    } finally {
      await sql.end();
    }
  }

  async getSchema(): Promise<SchemaMetaData[]> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

    try {
      const schemaRows = await sql`
    SELECT 
      schema_name,
      (SELECT COUNT(*)
      FROM information_schema.tables t
      WHERE t.table_schema = s.schema_name
      AND t.table_type = 'BASE TABLE') as table_count
    FROM information_schema.schemata s
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY schema_name
    `;

      const schemas: SchemaMetaData[] = [];

      for (const row of schemaRows) {
        const tables = await sql`
        SELECT 
          t.table_name,
          t.table_type,
          COALESCE(s.n_live_tup, 0) as row_count
        FROM information_schema.tables t
        LEFT JOIN pg_stat_user_tables s
          ON s.schemaname = ${row.schema_name}
          AND s.relname = t.table_name
        WHERE t.table_schema = ${row.schema_name}
        AND t.table_type IN ('BASE TABLE', 'VIEW')
        ORDER BY t.table_name
      `;

        schemas.push({
          name: row.schema_name,
          tables: tables.map((t) => ({
            name: t.table_name,
            type: t.table_type,
            rowCount: t.row_count ? parseInt(t.row_count) : undefined,
          })),
        });
      }

      return schemas;
    } finally {
      await sql.end();
    }
  }

  async getTables(schema: string): Promise<TableMetaData[]> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

    try {
      const tables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = ${schema}
        AND table_type = 'BASE TYPE'
        ORDER BY table_name
      `;

      const tableMetaData: TableMetaData[] = [];

      for (const table of tableMetaData) {
        const metaData = await this.getTableSchema(schema, table.table_name);
        tableMetaData.push(metaData);
      }

      return tableMetaData;
    } finally {
      await sql.end();
    }
  }
}
