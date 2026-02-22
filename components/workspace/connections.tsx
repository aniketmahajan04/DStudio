"use client";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NewConnection } from "../core/new-connection";
import { useState } from "react";
import { useConnectionStore } from "@/store/useConnectionStore";
import { toastManager } from "../ui/toast";
import { cn } from "@/lib/utils";

function Connections() {
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    new Set(),
  );
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  const {
    dbMetadata,
    selectedTable,
    activeConnectionId,
    activeConnectionName,
  } = useConnectionStore();

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schemaName)) {
      newExpanded.delete(schemaName);
    } else {
      newExpanded.add(schemaName);
    }

    setExpandedSchemas(newExpanded);
  };

  const handleTableClick = (schema: string, tableName: string) => {
    useConnectionStore.setState({ selectedTable: `${schema}.${tableName}` });
  };

  const filteredSchemas = dbMetadata?.schemas
    .map((schema) => ({
      ...schema,
      tables: schema.tables.filter((table) =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((schema) => schema.tables.length > 0);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* No connection State */}
      {!activeConnectionId && (
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="text-center py-8 text-muted-foreground">
            <Database className="mx-auto mb-2 h-12 w-12 opacity-20" />
            <p>No active connection</p>
            <p className="text-xs mt-1">Connect to a database to get started</p>
          </div>
        </div>
      )}

      {/* Active Connection */}
      {activeConnectionId && (
        <>
          <div className="px-2 py-4 border-b">
            <Input
              name="My Production Database"
              type="text"
              placeholder="Filter tables...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 rounded-sm"
            />
          </div>

          {/* Database Tree */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <div className="space-y-1">
              {/* Active connection Header */}
              <div className="flex items-center justify-between gap-2 py-2 px-2 bg-accent/50 rounded-md mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Database className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-sm truncate">
                    {activeConnectionName || "Connected"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    useConnectionStore.getState().clearSession();
                    toastManager.add({
                      title: "Disconnected",
                      type: "info",
                      description: "You can reconnect anytime",
                    });
                  }}
                  className="shrink-0 text-xs"
                >
                  Disconnect
                </Button>
              </div>

              {/* Schemas */}
              {filteredSchemas?.map((schema) => (
                <div key={schema.name} className="ml-1">
                  {/* Schema Header */}
                  <button
                    onClick={() => toggleSchema(schema.name)}
                    className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded-md w-full text-left group"
                  >
                    {expandedSchemas.has(schema.name) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-medium">{schema.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {schema.tables.length}
                    </span>
                  </button>

                  {/* Tables */}
                  {expandedSchemas.has(schema.name) && (
                    <div className="ml-4 space-y-0.5 mt-1">
                      {schema.tables.map((table) => (
                        <button
                          key={table.name}
                          onClick={() =>
                            handleTableClick(schema.name, table.name)
                          }
                          className={cn(
                            "flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded-md w-full text-left group transition-colors",
                            selectedTable === `${schema.name}.${table.name}` &&
                              "bg-accent",
                          )}
                        >
                          <Table className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{table.name}</span>
                          {table.rowCount !== undefined && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {table.rowCount.toLocaleString()}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col px-2 gap-2 flex-end mt-auto py-4 border-t">
        <NewConnection
          triggerLabel={"New Connection"}
          isOpen={isNewConnectionOpen}
          onOpenChange={setIsNewConnectionOpen}
        />
        {activeConnectionId && (
          <Button
            className="py-4"
            variant="outline"
            onClick={() =>
              toastManager.add({
                title: "Refreshing...",
                type: "info",
                description: "Reloading database metadata",
              })
            }
          >
            <RefreshCw />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}

export { Connections };
