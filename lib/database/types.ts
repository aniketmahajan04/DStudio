type DatabaseType = "postgresql" | "mysql" | "sqlite";

interface ColumnMetaData {
  name: string;
  type: string; // SQL data types (e.g., "varchar", "integer")
  nativeType: string; // Database-specific typ
  nullable: boolean;
  defaultValue: string | null;
  maxLenght?: number; // For string types
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

export type {
  DatabaseType,
  ColumnMetaData,
  ForeignKeyMetaData,
  IndexedMetaData,
  TableMetaData,
  SchemaMetaData,
  DatabaseMetaData,
  ConnectionConfig,
};
