"use client";
import {
  ChevronDown,
  Code,
  Play,
  Plus,
  Trash,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useConnectionStore } from "@/store/useConnectionStore";
import { toastManager } from "@/components/ui/toast";
import { executeQuery } from "@/app/api/actions/database-actions";

interface Column {
  name: string;
  type: string;
  selected: boolean;
}

interface WhereCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface JoinClause {
  id: string;
  type: string;
  table: string;
  leftColumn: string;
  rightColumn: string;
}

const operators = [
  "=",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "LIKE",
  "IN",
  "IS NULL",
  "IS NOT NULL",
];

const joinTypes = ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"];

// const mockTables = ["users", "orders", "products", "categories", "reviews"];

// const mockColumns: { [key: string]: Column[] } = {
//   users: [
//     { name: "id", type: "integer", selected: false },
//     { name: "name", type: "varchar", selected: false },
//     { name: "email", type: "varchar", selected: false },
//     { name: "created_at", type: "timestamp", selected: false },
//     { name: "active", type: "boolean", selected: false },
//   ],
//   orders: [
//     { name: "id", type: "integer", selected: false },
//     { name: "user_id", type: "integer", selected: false },
//     { name: "total", type: "numeric", selected: false },
//     { name: "status", type: "varchar", selected: false },
//     { name: "created_at", type: "timestamp", selected: false },
//   ],
//   products: [
//     { name: "id", type: "integer", selected: false },
//     { name: "name", type: "varchar", selected: false },
//     { name: "price", type: "numeric", selected: false },
//     { name: "category_id", type: "integer", selected: false },
//   ],
// };

function QueryBuilderTab() {
  const {
    dbMetadata,
    tables,
    activeConnectionId,
    selectedSchema,
    setLastQueryTime,
  } = useConnectionStore();

  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [joinClauses, setJoinClauses] = useState<JoinClause[]>([]);
  const [orderBy, setOrderBy] = useState("");
  const [limit, setLimit] = useState("100");
  const [showSqlPreview, setShowSqlPreview] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  // const availableTables =
  //   dbMetadata?.schemas
  //     .find((s) => s.name === selectedSchema)
  //     ?.tables.map((t) => t.name) || [];

  const availableTables = useMemo(() => {
    const schema = dbMetadata?.schemas.find((s) => s.name === selectedSchema);

    return schema?.tables.map((t) => t.name) ?? [];
  }, [dbMetadata, selectedSchema]);

  useEffect(() => {
    if (availableTables.length > 0 && !selectedTable) {
      setSelectedTable(availableTables[0]);
    }
  }, [availableTables, selectedTable]);

  useEffect(() => {
    if (selectedTable && selectedSchema) {
      const tableKey = `${selectedSchema}.${selectedTable}`;
      const tableMetadata = tables[tableKey];

      if (tableMetadata) {
        const cols: Column[] = tableMetadata.columns.map((col) => ({
          name: col.name,
          type: col.type,
          selected: false,
        }));
        setColumns(cols);
      }
    }
  }, [selectedTable, selectedSchema, tables]);

  const handleTableChange = (table: string) => {
    setSelectedTable(table);
    // setColumns(mockColumns[table] || []);
    setWhereConditions([]);
    setJoinClauses([]);
    setOrderBy("");
  };

  const toggleColumn = (index: number) => {
    const newColumn = [...columns];
    newColumn[index].selected = !columns[index].selected;
    setColumns(newColumn);
  };

  const addWhereCondition = () => {
    setWhereConditions([
      ...whereConditions,
      {
        id: Date.now().toString(),
        column: columns[0]?.name || "",
        operator: "=",
        value: "",
      },
    ]);
  };

  const removeWhereCondition = (id: string) => {
    setWhereConditions(whereConditions.filter((c) => c.id !== id));
  };

  const updateWhereCondition = (
    id: string,
    field: keyof WhereCondition,
    value: string,
  ) => {
    setWhereConditions(
      whereConditions.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const addJoinClause = () => {
    setJoinClauses([
      ...joinClauses,
      {
        id: Date.now().toString(),
        type: "INNER JOIN",
        table: availableTables[1] || availableTables[0],
        leftColumn: columns[0]?.name || "",
        rightColumn: "id",
      },
    ]);
  };

  const removeJoinClause = (id: string) => {
    setJoinClauses(joinClauses.filter((j) => j.id !== id));
  };

  const updateJoinClause = (
    id: string,
    field: keyof JoinClause,
    value: string,
  ) => {
    setJoinClauses(
      joinClauses.map((j) => (j.id === id ? { ...j, [field]: value } : j)),
    );
  };

  const generateSQL = () => {
    const selectedCols = columns.filter((c) => c.selected).map((c) => c.name);
    const selectClause =
      selectedCols.length > 0 ? selectedCols.join(", ") : "*";

    let sql = `SELECT ${selectClause}\nFROM ${selectedSchema}.${selectedTable}`;

    if (joinClauses.length > 0) {
      joinClauses.forEach((join) => {
        sql += `\n${join.type} ${selectedSchema}.${join.table} ON ${selectedTable}.${join.leftColumn} = ${join.table}.${join.rightColumn}`;
      });
    }

    if (whereConditions.length > 0) {
      const conditions = whereConditions
        .map((c) => {
          if (c.operator === "IS NULL" || c.operator === "IS NOT NULL") {
            return `${c.column} ${c.operator}`;
          }
          return `${c.column} ${c.operator} '${c.value}'`;
        })
        .join(" AND ");
      sql += `\nWHERE ${conditions}`;
    }

    if (orderBy) {
      sql += `\nORDER BY ${orderBy}`;
    }

    if (limit) {
      sql += `\nLIMIT ${limit}`;
    }

    return sql + ";";
  };

  const handleRunQuery = async () => {
    if (!activeConnectionId) {
      toastManager.add({
        title: "No Connection",
        type: "error",
        description: "Please connect to a database first",
      });
      return;
    }

    setIsExecuting(true);
    setQueryResult(null);

    try {
      const sql = generateSQL();
      const result = await executeQuery(activeConnectionId, sql);

      if (result.success && result.data) {
        setQueryResult(result.data);
        setLastQueryTime(result.data.executionTime);
        toastManager.add({
          title: "Query Executed",
          type: "success",
          description: `${result.data.rowCount} rows returned in ${result.data.executionTime}ms`,
        });
      } else {
        toastManager.add({
          title: "Query Failed",
          type: "error",
          description: result.error || "Failed to execute query",
        });
      }
    } catch (error: any) {
      toastManager.add({
        title: "Error",
        type: "error",
        description: error.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!activeConnectionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg mg-2">No Active Connecition</p>
          <p className="text-sm">Connect to a database to use Query Builder</p>
        </div>
      </div>
    );
  }

  if (availableTables.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg mg-2">No Active Connecition</p>
          <p className="text-sm">Connect to a database to use Query Builder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex flex-col bg-background overflow-hidden">
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left panel - query configuration*/}
        <div className="w-96 flex flex-col overflow-hidden border-r min-h-0">
          {/* Table selection */}
          <div className="border-b px-4 py-2 flex items-center gap-4">
            <label className="text-xs tracking-wider text-muted-foreground uppercase shrink-0">
              Select Table:
            </label>
            <div className="relative flex-1">
              <select
                value={selectedTable}
                onChange={(e) => handleTableChange(e.target.value)}
                className="w-full bg-background border rounded-md px-3 py-2 text-sm appearance-none 
              cursor-pointer hover:border-primary transition-colors"
              >
                {availableTables.map((table) => (
                  <option key={table}>{table}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Column section */}
          <div className="border-b p-4 overflow-auto">
            <label className="block  text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Select columns
            </label>
            <div className="space-y-2">
              {columns.map((column, index) => (
                <label
                  key={column.name}
                  className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={column.selected}
                    onChange={() => toggleColumn(index)}
                    className="rounded"
                  />

                  <span className="text-sm">{column.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {column.type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Where conditions */}
          <div className="border-b p-4 flex flex-col max-h-52 flex-1">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <label className="text-xs text-muted-foreground tracking-wider uppercase">
                Where conditions
              </label>
              <button
                onClick={addWhereCondition}
                className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 h-0 pr-1 custom-scrollbar">
              {whereConditions.map((condition) => (
                <div
                  key={condition.id}
                  className="bg-accent/50 border rounded-lg p-3"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <select
                      value={condition.column}
                      onChange={(e) =>
                        updateWhereCondition(
                          condition.id,
                          "column",
                          e.target.value,
                        )
                      }
                      className="flex-1 bg-background border rounded px-2  py-1.5 text-xs"
                    >
                      {columns.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeWhereCondition(condition.id)}
                      className="p-1.5 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <select
                    value={condition.operator}
                    onChange={(e) =>
                      updateWhereCondition(
                        condition.id,
                        "operator",
                        e.target.value,
                      )
                    }
                    className="w-full  bg-background border rounded px-2 py-1.5 text-xs mb-2"
                  >
                    {operators.map((operator) => (
                      <option key={operator} value={operator}>
                        {operator}
                      </option>
                    ))}
                  </select>
                  {!["IS NULL", "IS NOT NULL"].includes(condition.operator) && (
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) =>
                        updateWhereCondition(
                          condition.id,
                          "value",
                          e.target.value,
                        )
                      }
                      placeholder="value"
                      className="w-full bg-background border rounded px-2 py-4 text-xs"
                    />
                  )}
                </div>
              ))}
              {whereConditions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No condition added
                </p>
              )}
            </div>
          </div>

          {/* JOIN Clouses */}
          <div className="border-b p-4 flex flex-col max-h-52 flex-1">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Joins
              </label>
              <button
                onClick={addJoinClause}
                className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 h-0  pr-1 custom-scrollbar">
              {joinClauses.map((join) => (
                <div
                  key={join.id}
                  className="bg-accent/50 border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <select
                      value={join.type}
                      onChange={(e) =>
                        updateJoinClause(join.id, "type", e.target.value)
                      }
                      className="flex-1 bg-background border rounded px-2 py-1.5 text-xs "
                    >
                      {joinTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeJoinClause(join.id)}
                      className="ml-2 p-1.5 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <select
                    value={join.table}
                    onChange={(e) =>
                      updateJoinClause(join.id, "table", e.target.value)
                    }
                    className="w-full bg-background border rounded px-2 py-1.5 text-xs mb-2"
                  >
                    {availableTables.map((table) => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="text"
                      value={join.leftColumn}
                      onChange={(e) =>
                        updateJoinClause(join.id, "leftColumn", e.target.value)
                      }
                      placeholder="Left column"
                      className="flex-1 bg-background border rounded px-2 py-1.5 min-w-0"
                    />
                    <span className="self-center text-muted-foreground">=</span>
                    <input
                      type="text"
                      value={join.rightColumn}
                      onChange={(e) =>
                        updateJoinClause(join.id, "rightColumn", e.target.value)
                      }
                      placeholder="Right column"
                      className="flex-1 bg-background border rounded px-2 py-1.5 min-w-0"
                    />
                  </div>
                </div>
              ))}
              {joinClauses.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No joins added
                </p>
              )}
            </div>
          </div>

          {/* Order & limit */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Order By
                </label>
                <input
                  type="text"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  placeholder="column ASC"
                  className="w-full bg-background border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  limit
                </label>

                <input
                  type="text"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="100"
                  className="w-full bg-background border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Toolbar */}
          <div className="border-b p-4 flex items-center justify-between ">
            <button
              onClick={() => setShowSqlPreview(!showSqlPreview)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showSqlPreview
                  ? "bg-primary/20 text-primary"
                  : "bg-accent hover:bg-accent/80"
              }`}
            >
              <Code className="w-4 h-4" />
              SQL Preview
            </button>
            <button
              onClick={handleRunQuery}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? "Running..." : "Run Query"}
            </button>
          </div>

          {/* SQL Preview */}
          {showSqlPreview && (
            <div className="border-b bg-accent/20 max-h-60 overflow-auto">
              <div className="p-4">
                <pre className="font-mono text-sm text-primary whitespace-pre-wrap">
                  {generateSQL()}
                </pre>
              </div>
            </div>
          )}

          {/* Result Area */}
          <div className="flex-1 overflow-auto">
            {queryResult ? (
              <div className="p-4">
                <div className="mb-4 text-sm text-muted-foreground">
                  {queryResult.rowCount} rows • {queryResult.executionTime}ms
                </div>
                <div className="border rounded-lg overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-accent text-center">
                      <tr>
                        {queryResult.fields.map((field: string) => (
                          <th key={field} className="py-2">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row: any, i: number) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-accent/50 text-center"
                        >
                          {queryResult.fields.map((field: string) => (
                            <td key={field} className="px-4 py-2">
                              {row[field] === null ? (
                                <span className="text-muted-foreground italic">
                                  NULL
                                </span>
                              ) : (
                                String(row[field])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                {isExecuting ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Executing operation
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col text-center">
                    <Code className="w-14 h-14 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-lg mb-2 text-muted-foreground">
                      Build and Execute Query
                    </p>

                    <p className="text-s text-muted-foreground/70 mb-2">
                      Configure your query using the options on the left, then
                      click Run Query
                    </p>
                    <p className="text-md text-primary">
                      NOTE :- Please avoid using for using this tab for 'SELECT
                      * QUERY'
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { QueryBuilderTab };
