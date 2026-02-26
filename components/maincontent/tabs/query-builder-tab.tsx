"use client";
import { ChevronDown, Plus, Trash } from "lucide-react";
import { useState } from "react";

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

const mockTables = ["users", "orders", "products", "categories", "reviews"];

const mockColumns: { [key: string]: Column[] } = {
  users: [
    { name: "id", type: "integer", selected: false },
    { name: "name", type: "varchar", selected: false },
    { name: "email", type: "varchar", selected: false },
    { name: "created_at", type: "timestamp", selected: false },
    { name: "active", type: "boolean", selected: false },
  ],
  orders: [
    { name: "id", type: "integer", selected: false },
    { name: "user_id", type: "integer", selected: false },
    { name: "total", type: "numeric", selected: false },
    { name: "status", type: "varchar", selected: false },
    { name: "created_at", type: "timestamp", selected: false },
  ],
  products: [
    { name: "id", type: "integer", selected: false },
    { name: "name", type: "varchar", selected: false },
    { name: "price", type: "numeric", selected: false },
    { name: "category_id", type: "integer", selected: false },
  ],
};

function QueryBuilderTab() {
  const [selectedTable, setSelectedTable] = useState("users");
  const [columns, setColumns] = useState<Column[]>(mockColumns.users);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [joinClauses, setJoinClauses] = useState<JoinClause[]>([]);

  const toggleColumn = (index: number) => {
    const newColumn = [...columns];
    newColumn[index].selected = !columns[index].selected;
    setColumns(newColumn);
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

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - query configuration*/}
        <div className="w-96 flex flex-col overflow-hidden border-r">
          {/* Table selection */}
          <div className="border-b px-4 py-2 flex items-center gap-4">
            <label className="text-xs tracking-wider text-muted-foreground uppercase">
              Select Table:
            </label>
            <div className="relative">
              <select
                // value={selectedTable}
                // onChange={(e) => handleTableChange(e.target.value)}
                className="w-full border border-slate-400 
              rounded-lg px-3 py-2 text-sm text-slate-300 appearance-none 
              cursor-pointer hover:border-slate-600 transition-colors"
              >
                {mockTables.map((table) => (
                  <option key={table}>{table}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
                  className="flex items-center gap-3 p-2 rounded-sm hover:bg-secondary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={column.selected}
                    onChange={() => toggleColumn(index)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                  />

                  <span className="text-sm text-muted-foreground">
                    {column.name}
                  </span>
                  <span className="text-sm text-muted-foreground/60 ml-auto">
                    {column.type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Where conditions */}
          <div className="border-b overflow-auto p-4 flex-1 bg-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-muted-foreground tracking-wider uppercase">
                Where conditions
              </label>
              <button className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs transition-colors">
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="">
              {whereConditions.map((condition) => (
                <div
                  key={condition.id}
                  className="bg-slate-800 border border-slate-800 rounded-lg p-3"
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
                      className="flex-1 bg-slate-800 border border-s-slate-700 rounded px-2  py-1.5 text-xs text-slate-500"
                    >
                      {columns.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeWhereCondition(condition.id)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
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
                    className="w-full  bg-slate-800 border border-slate-500 rounded px-2 py-1.5 text-xs text-slate-300 mb-2"
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
                      className="w-full bgslate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 mb-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { QueryBuilderTab };
