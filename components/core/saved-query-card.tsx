"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { EllipsisVertical, FileText, Trash2, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { SavedQuery } from "../workspace/saved-query-list";
import { useConnectionStore } from "@/store/useConnectionStore";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/menu";
import { toastManager } from "../ui/toast";
import { deleteSavedQuery } from "@/app/api/actions/database-actions";

function SavedQueryCard({
  query,
  selected,
  onSelect,
  onRefresh,
}: {
  query: SavedQuery;
  selected: boolean;
  onSelect: () => void;
  onRefresh: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${query.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteSavedQuery(query.id);
      if (result.success) {
        toastManager.add({
          title: "Query Deleted",
          type: "error",
          description: `"${query.name}" has been deletd`,
        });
        onRefresh();
      } else {
        throw new Error(result.error || "Failed to delete query");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toastManager.add({
        title: "Delete Failed",
        type: "error",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(query.sqlQuery);
    toastManager.add({
      title: "Copied",
      type: "success",
      description: "Query copied to clipboard",
    });
  };

  return (
    <Card
      key={query.id}
      className={cn(
        "font-poppins ml-4 mb-4 cursor-pointer transition-colors hover:bg-accent/50",
        selected && "bg-accent border-primary",
      )}
      onClick={onSelect}
    >
      <CardHeader className="flex justify-between items-center pt-3 pb-2 px-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 shrink-0 text-primary" />
          <CardTitle className="tracking-tighter text-sm truncate">
            {query.name}
          </CardTitle>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-4 hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleCopyQuery}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Query
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="py-0">
        <p className="truncate text-xs text-muted-foreground tracking-wide">
          {query.sqlQuery}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between pb-2">
        <span className="text-muted-foreground/50 text-sm ">
          {formatDate(query.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}

export { SavedQueryCard };
