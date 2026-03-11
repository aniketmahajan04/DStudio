"use client";

import { SavedConnection } from "@/lib/database/types";
import { useConnectionStore } from "@/store/useConnectionStore";
import { useState } from "react";
import { toastManager } from "../ui/toast";
import { connectToSavedConnection } from "@/app/api/actions/database-actions";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Database } from "lucide-react";

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
    } catch (error: any) {
      toastManager.add({
        title: "Error",
        type: "error",
        description: error.message,
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
    } catch (error: any) {
      toastManager.add({
        title: "Delete Failed",
        type: "error",
        description: error.message,
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
        "font-poppins mb-4 ml-4 mr-4 cursor-pointer transition-colors hover:bg-accent/50",
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
      </CardHeader>
    </Card>
  );
}

export { ConnectionHistoryCard };
