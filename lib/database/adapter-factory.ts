import { DatabaseAdapter } from "./adapters/base-adapter";
import { PostgreSQLAdapter } from "./adapters/postgresql-adapter";
import { ConnectionConfig, DatabaseType } from "./types";

export class DatabaseAdapterFactory {
  static createAdapter(config: ConnectionConfig): DatabaseAdapter {
    switch (config.type) {
      case "postgresql":
        return new PostgreSQLAdapter(config);

      case "mysql":
        throw new Error("Mysql adapter not yet implemented.");

      case "sqlite":
        throw new Error("SQLite adapter not yet implemented.");
      default:
        throw new Error(`Unsupported databse type: ${config.type}`);
    }
  }

  static getSupportedDatabases(): DatabaseType[] {
    return ["postgresql", "mysql", "sqlite"];
  }
}
