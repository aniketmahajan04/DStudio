"use client";
import { SavedQueryCard } from "../core/saved-query-card";
import { ScrollArea } from "../ui/scroll-area";
import { NewQueryForm } from "./new-query-form";
import { useEffect, useState } from "react";
import { DatabaseType } from "@/lib/database/types";
import { getSavedQueries } from "@/app/api/actions/database-actions";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface SavedQuery {
  id: string;
  name: string;
  sqlQuery: string;
  dbType: DatabaseType;
  createdAt: Date;
  updatedAt: Date;
}

function SavedQueryList({
  onQuerySelect,
}: {
  onQuerySelect: (query: SavedQuery) => void;
}) {
  const [isNewQueryFormOpen, setIsNewQueryFormOpen] = useState(false);
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setIsLoading(true);
    try {
      const result = await getSavedQueries();
      if (result.success && result.data) {
        setQueries(result.data);
      }
    } catch (error: any) {
      console.error("Failed to load queries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (queryId: string) => {
    setSelectedId(queryId);
    const query = queries.find((q) => q.id === queryId);
    if (query && onQuerySelect) {
      onQuerySelect(query);
    }
  };

  const handleQuerySaved = () => {
    loadQueries();
  };
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-4 border-b">
        <NewQueryForm
          triggerLabel="New Query"
          isOpen={isNewQueryFormOpen}
          openChange={setIsNewQueryFormOpen}
          onQuerySaved={handleQuerySaved}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="w-72 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <p className="text-sm mb-2">No saved queries yet</p>
              <p className="text-xs">Click "New Query" to save one</p>
            </div>
          ) : (
            queries.map((query) => {
              <SavedQueryCard
                key={query.id}
                query={query}
                selected={selectedId === query.id}
                onSelect={() => handleSelect(query.id)}
                onRefresh={loadQueries}
              />;
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer with Refresh */}
      <div className="px-2 py-2 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={loadQueries}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}

export { SavedQueryList };
export type { SavedQuery };
