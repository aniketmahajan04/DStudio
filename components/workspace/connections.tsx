"use client";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  RefreshCw,
  Columns,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NewConnection } from "../core/new-connection";
import { useEffect, useState } from "react";
import { useConnectionStore } from "@/store/useConnectionStore";
import { toastManager } from "../ui/toast";
import { cn } from "@/lib/utils";

function Connections() {
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    new Set(),
  );
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {
    dbMetadata,
    tables,
    selectedTable,
    activeConnectionId,
    activeConnectionName,
    setActiveConnection,
    setIsConnecting,
  } = useConnectionStore();

  useEffect(() => {
    const reconnect = async () => {
      if (activeConnectionId && !dbMetadata) {
        setIsReconnecting(true);
        setIsConnecting(true);

        try {
          const result = await connectToSavedConnection(activeConnectionId);

          if (result.success && result.data) {
            const { connectionName, metadata, tableDetails } = result.data;

            setActiveConnection(
              activeConnectionId,
              connectionName,
              metadata,
              tableDetails,
            );
          } else {
            useConnectionStore.getState().clearSession();
            toastManager.add({
              title: "Reconnction Failed",
              type: "error",
              description: result.error || "Failed to reconnect",
            });
          }
        } catch (error: any) {
          useConnectionStore.getState().clearSession();
          toastManager.add({
            title: "Reconnection Failed",
            type: "error",
            description: error.message,
          });
        } finally {
          setIsReconnecting(false);
          setIsConnecting(false);
        }
      }
    };

    reconnect();
  }, [activeConnectionId, dbMetadata, setActiveConnection, setIsConnecting]);

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schemaName)) {
      newExpanded.delete(schemaName);
    } else {
      newExpanded.add(schemaName);
    }

    setExpandedSchemas(newExpanded);
  };

  const toggleTables = (tableName: string) => {
    const newExpandedTable = new Set(expandedTables);
    if (newExpandedTable.has(tableName)) {
      newExpandedTable.delete(tableName);
    } else {
      newExpandedTable.add(tableName);
    }

    setExpandedTables(newExpandedTable);
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
      {/* Reconnecting State */}
      {isReconnecting && (
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="text-center py-8 text-muted-foreground text-sm">
            <RefreshCw className="mx-auto mb-2 h-12 w-12 animate-spin" />
            <p>Reconnecting...</p>
            <p className="text-xs mt-1">Restoring your connection</p>
          </div>
        </div>
      )}
      {/* No connection State */}
      {!activeConnectionId && !isReconnecting && (
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="text-center py-8 text-muted-foreground">
            <Database className="mx-auto mb-2 h-12 w-12 opacity-20" />
            <p>No active connection</p>
            <p className="text-xs mt-1">Connect to a database to get started</p>
          </div>
        </div>
      )}

      {/* Active Connection */}
      {activeConnectionId && !isReconnecting && dbMetadata && (
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
                <div key={schema.name} className="ml-1 pr-2">
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
                    <div className="ml-4 space-y-0.5 mt-1 pr-2">
                      {/* {schema.tables.map((table) => (
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
                      ))} */}
                      {schema.tables.map((table) => {
                        const tableKey = `${schema.name}.${table.name}`;
                        const tableMetadata = tables[tableKey];
                        const isExpanded = expandedTables.has(tableKey);

                        return (
                          <div key={table.name}>
                            {/* Table Row */}
                            <div className="flex items-center gap-1">
                              {/* Expand/collapse Icon */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTables(tableKey);
                                }}
                                className="p-0.5 hover:bg-accent rounded"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                )}
                              </button>

                              {/* Table Button */}
                              <button
                                onClick={() =>
                                  handleTableClick(schema.name, table.name)
                                }
                                className={cn(
                                  "flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded-md flex-1 text-left group transition-colors",
                                  selectedTable == tableKey && "bg-accent",
                                )}
                              >
                                <Table className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm truncate">
                                  {table.name}
                                </span>
                                {table.rowCount !== undefined && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {table.rowCount.toLocaleString()}
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Columns (Expanded) */}
                            {isExpanded && tableMetadata && (
                              <div className="ml-8 mt-1 space-y-0.5">
                                {tableMetadata.columns.map((column) => (
                                  <div
                                    key={column.name}
                                    className="flex items-center gap-2 py-1 px-2 hover:bg-accent/50 rounded text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <Columns className="h-3 w-3 text-muted-foreground shrink-0" />
                                      <span className="text-foreground truncate">
                                        {column.name}
                                      </span>
                                    </div>
                                    {/* <span className="text-muted-foreground ml-auto">
                                      {column.type}
                                    </span> */}

                                    <div className="flex items-center gap-2 shrink-0">
                                      {column.isPrimaryKey && (
                                        <span className="text-yellow-500 text-xs">
                                          PK
                                        </span>
                                      )}
                                      {column.isForeignKey && (
                                        <span className="text-blue-500 text-xs">
                                          FK
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
        {activeConnectionId && !isReconnecting && (
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
