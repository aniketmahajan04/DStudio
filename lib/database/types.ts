type DatabaseType = 'postgresql' | 'mysql' | 'sqlite';

interface ColumnMetaData {
  name: string;
  type: string;
  nativeType: string;
  nullable: boolean;
  defaultValue: string | null;
  maxLenght?: number;
  preciosion?: number;
  scale?: number;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isAutoIncreament: boolean;
  comment?: string;
  position: number;
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

interface TableMetaData {
  name: string;
  schema: string;
  type: "table" | "view" | "materialized_view";
  columns: ColumnMetaData[];
  primaryKey: string[];
  foreignKey: ForeignKeyMetaData[];
  uniqueConstraints: { name: string; columns: string[] }[];
  indexes: IndexedMetaData[];
  checkConstraints?: { name: string; definition: string[] }[];
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
