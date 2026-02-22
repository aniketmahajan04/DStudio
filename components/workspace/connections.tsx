"use client";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NewConnection } from "../core/new-connection";
import { useState } from "react";
import { useConnectionStore } from "@/store/useConnectionStore";

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
              placeholder="Enter connection name"
              required
              className="py-2 rounded-sm"
            />
          </div>
          <div></div>
        </>
      )}
      <div className="flex flex-col px-2 gap-2 flex-end mt-auto py-4 border-t">
        <NewConnection
          triggerLabel={"New Connection"}
          isOpen={isNewConnectionOpen}
          onOpenChange={setIsNewConnectionOpen}
        />
        <Button className="py-4">
          <RefreshCw />
          Refresh
        </Button>
      </div>
    </div>
  );
}

export { Connections };
