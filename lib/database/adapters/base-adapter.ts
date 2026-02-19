import {
  ConnectionConfig,
  DatabaseMetaData,
  SchemaMetaData,
  TableMetaData,
} from "../types";

export abstract class DatabaseAdapter {
  protected connectionString: string;
  protected config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.connectionString = this.buildConnectionString(config);
  }

  // Connection Methods
  abstract testConnection(): Promise<{ success: boolean; error?: string }>;
  abstract disconnect(): Promise<void>;

  // Utility methods
  abstract buildConnectionString(config: ConnectionConfig): string;

  // Schema discovery
  abstract getDatabaseMetadata(): Promise<DatabaseMetaData>;
  abstract getSchema(): Promise<SchemaMetaData[]>;
  abstract getTables(schema: string): Promise<TableMetaData[]>;
  abstract getTableSchema(
    schema: string,
    tableName: string,
  ): Promise<TableMetaData>;

  // Data fetching
  abstract getTableData(
    schema: string,
    tableName: string,
    page?: number,
    pageSize?: number,
  ): Promise<{
    rows: any[];
    totalCount: number;
    columns: string[];
  }>;

  // Query execution
  abstract executeQuery(query: string): Promise<{
    rows: any[];
    rowCount: number;
    fields: string[];
  }>;
}
