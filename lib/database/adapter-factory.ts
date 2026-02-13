import { DatabaseAdapter } from "./adapters/base-adapter";
import { PostgreSQLAdapter } from "./adapters/postgresql-adapter";
import { ConnectionConfig, DatabaseType } from "./types";

export class DatabaseAdapterFactory {
  static createAdapter(config: ConnectionConfig): DatabaseAdapter {
    switch (config.type) {
      case "POSTGRES":
        return new PostgreSQLAdapter(config);

      case "MYSQL":
        throw new Error("Mysql adapter not yet implemented.");

      case "SQLITE":
        throw new Error("SQLite adapter not yet implemented.");
      default:
        throw new Error(`Unsupported databse type: ${config.type}`);
    }
  }

  static getSupportedDatabases(): DatabaseType[] {
    return ["POSTGRES", "MYSQL", "SQLITE"];
  }
}
