"use client";
import { ScrollArea } from "../ui/scroll-area";
import { QueryHistoryCard } from "./query-history-card";
import { Button } from "../ui/button";
import { useEffect, useState, useCallback } from "react";
import { useConnectionStore } from "@/store/useConnectionStore";
import { RefreshCw } from "lucide-react";
import { getQueryHistory } from "@/app/api/actions/database-actions";

export interface QueryHistory {
  id: string;
  sqlQuery: string;
  status: "SUCCESS" | "FAILED";
  executedTime: number;
  errorMessage: string | null;
  createdAt: Date;
}
function QueryHistoryList() {
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const { activeConnectionId, lastQueryTime } = useConnectionStore();
  const [isLoading, setIsLoading] = useState(false);

  const loadQueryHistory = useCallback(async () => {
    if (!activeConnectionId) return;

    setIsLoading(true);
    try {
      const result = await getQueryHistory(activeConnectionId, 30);
      if (result.success && result.data) {
        setQueryHistory(result.data);
      } else if (!result.success) {
        console.error("Failed to load query history:", result.error);
      }
    } catch (error: unknown) {
      console.log(
        "Failed to load query history",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeConnectionId]);

  useEffect(() => {
    if (activeConnectionId) {
      loadQueryHistory();
    }
  }, [activeConnectionId, lastQueryTime, loadQueryHistory]);

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all query history?")) return;
  };

  if (!activeConnectionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground py-8 px-4">
          <p className="text-sm">No active connection</p>
          <p className="text-xs mt-2">
            Connect to a database to see query history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden ">
      <div className="flex justify-between items-center px-4 py-4 border-bshrink-0">
        <h3 className="text-sx uppercase text-muted-foreground tracking-wider">
          Recent queries
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-xs"
        >
          Clear All
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : queryHistory.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <p className="text-sm mb-2">No query history yet</p>
              <p className="text-xs">Execute queries to see history</p>
            </div>
          ) : (
            queryHistory.map((history: QueryHistory) => (
              <QueryHistoryCard key={history.id} history={history} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export { QueryHistoryList };
