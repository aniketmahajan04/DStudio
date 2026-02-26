"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Column {
  name: string;
  type: string;
  selected: boolean;
}
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
  return (
    <div className="flex-1 flex flex-col bg-secondary overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}

export { QueryBuilderTab };
