import postgres from "postgres";
import {
  ColumnMetaData,
  ConnectionConfig,
  DatabaseMetaData,
  ForeignKeyMetaData,
  IndexedMetaData,
  SchemaMetaData,
  TableMetaData,
} from "../types";
import { DatabaseAdapter } from "./base-adapter";

export class PostgreSQLAdapter extends DatabaseAdapter {
  constructor(config: ConnectionConfig) {
    super(config);
  }

  buildConnectionString(config: ConnectionConfig): string {
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

      for (const table of tables) {
        const metaData = await this.getTableSchema(schema, table.name);
        tableMetaData.push(metaData);
      }

      return tableMetaData;
    } finally {
      await sql.end();
    }
  }

  async getTableSchema(
    schema: string,
    tableName: string,
  ): Promise<TableMetaData> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

    try {
      const columnsResult = await sql`
        SELECT 
          c.column_name,
          c.data_type,
          c.udt_name as native_type,
          c.is_nullable,
          c.column_default,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          c.ordinal_position,
          pdg.description as comment,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
          CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
          CASE WHEN u.column_name IS NOT NULL THEN true ELSE false END as is_unique,
          CASE WHEN c.column_default LIKE 'nextval%' THEN true ELSE false END as is_auto_increment
        FROM information_schema.columns c
        LEFT JOIN pg_catalog.pg_statio_all_tables st
          ON c.table_schema = st.schemaname
          AND c.table_name = st.relname
        LEFT JOIN pg_catalog.pg_description pgd
          ON pgd.objoid = st.relid
          AND pgd.objoid = c.ordinal_position
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = ${schema}
            AND tc.table_name = ${tableName}
          ) pk ON c.column_name = pk.column_name
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
                ON tc.constraint_name = ku.constraint_name
                AND tc.table_schema = ku.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = ${schema}
                AND tc.table_name = ${tableName}
        ) fk ON c.column_name = fk.column_name
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
                ON tc.constraint_name = ku.constraint_name
                AND tc.table_schema = ku.table_schema
            WHERE tc.constraint_type = 'UNIQUE'
                AND tc.table_schema = ${schema}
                AND tc.table_name = ${tableName}
        ) u ON c.column_name = u.column_name
          WHERE c.table_schema = ${schema}
          AND c.table_name = ${tableName}
          ORDER BY c.ordinal_position 
      `;

      const columns: ColumnMetaData[] = columnsResult.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nativeType: col.native_type,
        nullable: col.is_nullable === "YES",
        defaultValue: col.column_default,
        maxLenght: col.character_maximum_length
          ? Number(col.character_maximum_length)
          : undefined,
        precision: col.numeric_precision
          ? Number(col.numeric_precision)
          : undefined,
        scale: col.numeric_scale ? Number(col.numeric_scale) : undefined,
        isPrimaryKey: col.is_primary_key,
        isForeignKey: col.is_foreign_key,
        isUnique: col.is_unique,
        isAutoIncrement: col.is_auto_increment,
        comment: col.comment || undefined,
        position: Number(col.ordinal_position),
      }));

      const pkResult = await sql`
          SELECT ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = ${schema}
            AND tc.table_name = ${tableName}
          ORDER BY ku.ordinal_position
      `;

      const primaryKey = pkResult.map((row) => row.column_name);

      const fkResult = await sql`
          SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column,
            rc.update_rule as on_update,
            rc.delete_rule as on_delete
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          JOIN information_schema.referential_constraints rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = ${schema}
            AND tc.table_name = ${tableName}
      `;

      const foreignKey: ForeignKeyMetaData[] = fkResult.map((row) => ({
        constraintName: row.constraint_name,
        columnName: row.column_name,
        referencedTable: row.referenced_table,
        referencedColumn: row.referenced_column,
        onUpdate: row.on_update,
        onDelete: row.on_delete,
      }));

      const uniqueResult = await sql`
        SELECT
          tc.constraint_name,
          array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_schema = ${schema}
          AND tc.table_name = ${tableName}
        GROUP BY tc.constraint_name
      `;

      const uniqueConstraints = uniqueResult.map((row) => ({
        name: row.constraint_name,
        columns: row.columns,
      }));

      const indexResult = await sql`
        SELECT
          i.relname as index_name,
          array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) as columns,
          ix.indisunique as is_unique,
          ix.indisprimary as is_primary,
          am.amname as type
        FROM pg_index ix
        JOIN pg_class t ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_am am ON i.relam = am.oid
        JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
        WHERE n.nspname = ${schema}
          AND t.relname = ${tableName}
        GROUP BY i.relname, ix.indisunique, ix.indisprimary, am.amname
      `;

      const indexes: IndexedMetaData[] = indexResult.map((row) => ({
        name: row.index_name,
        columns: row.columns,
        isUnique: row.isUnique,
        isPrimary: row.is_primary,
        type: row.type,
      }));

      const checkResult = await sql`
        SELECT
          con.conname as constraint_name,
          pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_class t ON t.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE con.contype = 'c'
          AND n.nspname = ${schema}
          AND t.relname = ${tableName}
      `;

      const checkConstraints = checkResult.map((row) => ({
        name: row.constraint_name,
        definition: [row.definition],
      }));

      const statsResult = await sql`
         SELECT
          COALESCE(s.n_live_tup, 0) as row_count,
          pg_total_relation_size(quote_ident(${schema}) || '.' || quote_ident(${tableName})) as size
        FROM pg_stat_user_tables s
        WHERE s.schemaname = ${schema}
          AND s.relname = ${tableName}
      `;

      const rowCount = statsResult[0]?.row_count
        ? Number(statsResult[0].row_count)
        : undefined;

      const size = statsResult[0]?.size
        ? Number(statsResult[0].size)
        : undefined;

      const commentResult = await sql`
        SELECT obj_description((quote_ident(${schema}) || '.' || quote_ident(${tableName}))::regclass) as comment
      `;

      const comment = commentResult[0]?.comment || undefined;

      const typeResult = await sql`
        SELECT table_type
        FROM information_schema.tables
        WHERE table_schema = ${schema}
          AND table_name = ${tableName}
      `;

      let tableType: "table" | "view" | "materialized_view" = "table";

      if (typeResult[0]?.table_type === "VIEW") {
        tableType = "view";
      }

      return {
        name: tableName,
        schema,
        type: tableType,
        columns,
        primaryKey,
        foreignKey,
        uniqueConstraints,
        indexes,
        checkConstraints,
        rowCount,
        size,
        comment,
      };
    } finally {
      await sql.end();
    }
  }

  async getTableData(
    schema: string,
    tableName: string,
    page?: number,
    pageSize?: number,
  ): Promise<{ rows: any[]; totalCount: number; columns: string[] }> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

    try {
      const currentPage = page ?? 1;
      const currentPageSize = pageSize ?? 50;
      const offset = (currentPage - 1) * currentPageSize;

      const countResult = await sql`
        SELECT COUNT(*) as count FROM ${sql(schema)}.${sql(tableName)}
      `;

      const totalCount = Number(countResult[0].count);

      const rows = await sql`
        SELECT * FROM ${sql(schema)}.${sql(tableName)} 
        LIMIT ${currentPageSize} OFFSET ${offset}
        `;

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        rows,
        totalCount,
        columns,
      };
    } finally {
      await sql.end();
    }
  }

  async executeQuery(
    query: string,
  ): Promise<{ rows: any[]; rowCount: number; fields: string[] }> {
    const sql = postgres(this.connectionString, {
      ssl: this.config.ssl ? "require" : undefined,
    });

    try {
      const result = await sql.unsafe(query);

      return {
        rows: result,
        rowCount: result.length,
        fields: result.length > 0 ? Object.keys(result[0]) : [],
      };
    } finally {
      await sql.end();
    }
  }
}
