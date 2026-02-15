import postgres from "postgres";
import { ConnectionConfig, DatabaseMetaData, SchemaMetaData } from "../types";
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

  diconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getDatabaseMetadata(): Promise<DatabaseMetaData> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

    const versionResult = await sql`SELECT version()`;
    const version = versionResult[0].version;

    const schemas = await this.getSchema();

    await sql.end();

    return {
      type: "postgresql",
      version,
      schemas,
    };
  }

  async getSchema(): Promise<SchemaMetaData[]> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

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

    for (const rows of schemaRows) {
      const tables = await sql`
        SELECT 
          table_name,
          table_type,
          (SELECT n_live_tup
          FROM pg_stat_user_tables
          WHERE schemaname = ${rows.schema_name}
          AND relname = t.table_name) as row_count
        FROM information_schema.tables t
        WHERE table_schema = ${rows.schema_name}
        AND table_type IN ('BASE TABLE', 'VIEW')
        ORDER BY table_name
      `;

      schemas.push({
        name: rows.schema_name,
        tables: tables.map((t) => ({
          name: t.table_name,
          type: t.table_type,
          rowCount: t.row_count ? parseInt(t.row_count) : undefined,
        })),
      });
    }

    await sql.end();
    return schemas;
  }
}
