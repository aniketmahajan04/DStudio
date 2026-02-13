import postgres from "postgres";
import { ConnectionConfig } from "../types";
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
}
