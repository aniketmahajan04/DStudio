"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { QueryHistory } from "./query-history-list";
import { toastManager } from "../ui/toast";

function QueryHistoryCard({ history }: { history: QueryHistory }) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(history.sqlQuery);
    toastManager.add({
      title: "Copied",
      type: "success",
      description: "Query copied to clipboard",
    });
  };

  return (
    <Card key={history.id} className={cn("font-poppins mb-4 ml-4 mr-4")}>
      <CardHeader
        className={cn("flex flex-row justify-between items-center py-4 px-4")}
      >
        <div
          className={`px-2 py-1 text-xs flex items-center rounded-sm border border-border ${
            history.status === "SUCCESS" ? " text-emerald-400" : " text-red-400"
          } `}
        >
          {history.status === "SUCCESS" ? (
            <>
              <Check size={18} />
              <CardTitle>{history.status}</CardTitle>
            </>
          ) : (
            <>
              <X size={18} />
              <CardTitle>{history.status}</CardTitle>
            </>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {history.executedTime}ms
        </span>
      </CardHeader>

      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-2 font-mono">
          {history.sqlQuery}
        </p>
        {history.errorMessage && (
          <p className="text-xs text-red-400 mt-2 line-clamp-1">
            Error: {history.errorMessage}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pb-2">
        <span className="text-muted-foreground/50 text-sm">
          {formatDate(history.createdAt)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyQuery}
          className="h-7 px-2 text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
      </CardFooter>
    </Card>
  );
}

export { QueryHistoryCard };
