"use client";

import { getUserConnections } from "@/app/api/actions/database-actions";
import { SavedConnection } from "@/lib/database/types";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { ConnectionHistoryCard } from "./connection-history-card";

function ConnectionHistoryList({
  onConnectionSelect,
}: {
  onConnectionSelect?: (connectionId: string) => void;
}) {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const result = await getUserConnections();
      if (result.success && result.data) {
        setConnections(result.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error && error.message;
      console.error("Failed to load connections:", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (connectionId: string) => {
    setSelectedId(connectionId);
    if (onConnectionSelect) {
      onConnectionSelect(connectionId);
    }
  };

  const handleRefresh = () => {
    loadConnections();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b">
        <h3 className="text-xs uppercase text-muted-foreground tracking-wider">
          Saved Connections
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {/* Connections List */}
      <ScrollArea className="flex-1">
        <div className="w-72 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <p className="text-sm mb-2">No saved connections</p>
              <p className="text-xs">Create a connection to see it here</p>
            </div>
          ) : (
            connections.map((connection) => (
              <ConnectionHistoryCard
                key={connection.id}
                connection={connection}
                selected={selectedId === connection.id}
                onSelect={() => handleSelect(connection.id)}
                onRefresh={loadConnections}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export { ConnectionHistoryList };
