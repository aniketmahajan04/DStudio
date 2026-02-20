type DatabaseType = "postgresql" | "mysql" | "sqlite";

interface ColumnMetaData {
  name: string;
  type: string; // SQL data types (e.g., "varchar", "integer")
  nativeType: string; // Database-specific typ
  nullable: boolean;
  defaultValue: string | null;
  maxLength?: number; // For string types
  precision?: number; // For numeric type
  scale?: number; // For numeric types
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  comment?: string; // Column comment/description
  position: number; // Ordinal position in table
}

interface ForeignKeyMetaData {
  constraintName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  onUpdate: string;
  onDelete: string;
}

interface IndexedMetaData {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  type: string;
}

interface CheckConstraintMetaData {
  name: string;
  definition: string[];
}

interface UniqueConstraintMetaData {
  name: string;
  columns: string[];
}

interface TableMetaData {
  name: string;
  schema: string;
  type: "table" | "view" | "materialized_view";
  columns: ColumnMetaData[];
  primaryKey: string[];
  foreignKey: ForeignKeyMetaData[];
  uniqueConstraints: UniqueConstraintMetaData[];
  indexes: IndexedMetaData[];
  checkConstraints?: CheckConstraintMetaData[];
  rowCount?: number;
  size?: number;
  comment?: string;
}

interface SchemaMetaData {
  name: string;
  tables: { name: string; type: string; rowCount?: number }[];
}

interface DatabaseMetaData {
  type: DatabaseType;
  version: string;
  schemas: SchemaMetaData[];
}

interface ConnectionConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  ssl?: boolean;
}

interface TableDataResponse {
  rows: any[];
  totalCount: number;
  column: string[];
}

interface QueryResult {
  rows: any[];
  rowCount: number;
  fields: string[];
  executionTime?: number;
}

interface ConnectionSession {
  id: string;
  name: string;
  config: ConnectionConfig;
  connectedAt: Date;
  lastActivity?: Date;
}

interface TableDataCacheEntry {
  rows: any[];
  totalCount: number;
  columns: string[];
  currentPage: number;
  pageSize: number;
  fetchedAt: Date;
}

interface TablePosition {
  x: number;
  y: number;
}

interface TableMetaDataWithUI extends TableMetaData {
  ui?: TablePosition;
}

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ConnectionTestResult {
  success: boolean;
  error?: string;
  latency?: number;
  serverVersion?: string;
}

interface MetadataFetchProgress {
  stage:
    | "connecting"
    | "fetching_schemas"
    | "fetching_tables"
    | "fetching_details"
    | "complete";
  progress: string;
  completeTables?: number;
  totalTables?: number;
}

export type {
  DatabaseType,
  ColumnMetaData,
  ForeignKeyMetaData,
  IndexedMetaData,
  CheckConstraintMetaData,
  UniqueConstraintMetaData,
  TableMetaData,
  SchemaMetaData,
  DatabaseMetaData,
  ConnectionConfig,
  TableDataResponse,
  QueryResult,
  ConnectionSession,
  TableDataCacheEntry,
  TablePosition,
  TableMetaDataWithUI,
  ActionResponse,
  ConnectionTestResult,
  MetadataFetchProgress,
};
