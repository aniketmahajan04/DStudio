"use client";

import { SavedConnection } from "@/lib/database/types";
import { useConnectionStore } from "@/store/useConnectionStore";
import { useState } from "react";
import { toastManager } from "../ui/toast";
import {
  connectToSavedConnection,
  deleteConnection,
} from "@/app/api/actions/database-actions";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Database, EllipsisVertical, Power, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/menu";
import { Button } from "../ui/button";

function ConnectionHistoryCard({
  connection,
  selected,
  onSelect,
  onRefresh,
}: {
  connection: SavedConnection;
  selected: boolean;
  onSelect: () => void;
  onRefresh: () => void;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { activeConnectionId, setActiveConnection } = useConnectionStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDbIcon = (type: string) => {
    const dbColors = {
      postgresql: "text-blue-500",
      mysql: "text-orange-500",
      sqlite: "text-green-500",
    };

    return dbColors[type as keyof typeof dbColors] || "text-gray-500";
  };

  const getDbLabel = (type: string) => {
    const labels = {
      postgresql: "PostgreSQL",
      mysql: "MySQL",
      sqlite: "SQLite",
    };

    return labels[type as keyof typeof labels] || type;
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);

    try {
      const result = await connectToSavedConnection(connection.id);

      if (result.success && result.data) {
        setActiveConnection(
          connection.id,
          connection.connectionName,
          result.data.metadata,
          result.data.tableDetails,
        );

        toastManager.add({
          title: "Connected",
          type: "success",
          description: `Connected to ${connection.connectionName}`,
        });
      } else {
        toastManager.add({
          title: "Connection Failed",
          type: "error",
          description: result.error || "Failed to connect",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to connect ";
      toastManager.add({
        title: "Error",
        type: "error",
        description: message,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${connection.connectionName}"?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteConnection(connection.id);

      if (result.success) {
        toastManager.add({
          title: "Connection Deleted",
          type: "success",
          description: `"${connection.connectionName}" has been deleted`,
        });
        onRefresh();
      } else {
        throw new Error(result.error || "Failed to delete connection");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete connection";
      toastManager.add({
        title: "Delete Failed",
        type: "error",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isActive = activeConnectionId === connection.id;

  return (
    <Card
      onClick={onSelect}
      className={cn(
        "font-poppins m-4 cursor-pointer transition-colors hover:bg-accent/50",
        selected && "bg-accent border-primary",
        isActive && "border-muted-foreground",
      )}
    >
      <CardHeader className="flex flex-row justify-between items-start pt-3 pb-2 px-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Database
            className={cn("w-4 h-4 shrink-0", getDbIcon(connection.type))}
          />
          <CardTitle className="tracking-tight text-sm truncate">
            {connection.connectionName}
          </CardTitle>
        </div>

        {isActive && (
          <div className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-sm">
            Active
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting || isActive}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {getDbLabel(connection.type)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pb-3 px-4">
        <span className="text-muted-foreground/60 text-xs">
          {formatDate(connection.createdAt)}
        </span>
        {!isActive && (
          <Button
            size="sm"
            variant="default"
            onClick={handleConnect}
            disabled={isConnecting}
            className="rounded-sm h-7 text-xs px-3"
          >
            <Power className="w-3 h-3 mr-1.5" />
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export { ConnectionHistoryCard };
