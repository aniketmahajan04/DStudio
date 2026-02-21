"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NewConnection } from "../core/new-connection";
import {useEffect, useState} from "react";
import {useConnectionStore} from "@/store/useConnectionStore";
import {toastManager} from "@/components/ui/toast";

function Connections() {
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  const {
    dbMetadata,
      selectedTable,
      activeConnectionId,
      activeConnectionName,
      savedConnections,
      setSavedConnections,
      setActiveConnection,
      setIsConnecting
  } = useConnectionStore();

  useEffect(() => {
    loadSavedConnections();
  }, [])

  const loadSavedConnections = async () => {
    setIsLoadingConnections(true);

    try {
      const result = await getUserConnections();
      if(result.success && result.data) {
        setSavedConnections(result.data);
      }
    } catch(error) {
      console.error("Failed to load connections:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  }

  const handleConnectToSaved = async (connectionId: string) => {
    setIsConnecting(true);

    try {
      const result = await connectToSavedConnection(connectionId);

      if(!result.success || !result.data) {
        throw new Error(result.error || "Failed to connect");
      }

      const { connectionName, metadata, tableDetails } = result.data;

      setActiveConnection(connectionId, connectionName, metadata, tableDetails);

      toastManager.add({
        title: "Connected!",
        description: `Connected to ${connectionName}`
      });
    } catch(error: any) {
      toastManager.add({
        title: "Connection Failed",
        description: error.message || "Failed to connect"
      });
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDeleteConnection = async (connectionId: string, connectionName: string) => {
    if(!confirm(`Are you sure you want to delete ${ connectionName }?`)) {
      return;
    }

    try{
      const result = await deleteConnection(connectionId);
      if(!result.success) {
        throw new Error(result.error || "Failed to delete");
      }

      toastManager.add({
        title: "Deleted",
        description: `Connection "${connectionName}" deleted`
      });

      // Reload connections
      loadSavedConnections();

      // Clear session if this was the active connection
      if(connectionId === activeConnectionId) {
        useConnectionStore.getState().clearSession();
      }
    } catch (error: any) {
      toastManager.add({
        title: "Delete Failed",
        description: error.message,
      })
    }
  }

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas);
    if(newExpanded.has(schemaName)) {
      newExpanded.delete((schemaName))
    } else {
      newExpanded.add(schemaName);
    }

    setExpandedSchemas(newExpanded);
  }

  const handleTableClick = (schema: string, tableName: string) => {
    useConnectionStore.setState({ selectedTable: `${schema}.${tableName}` });
  }

  const filteredSchemas = dbMetadata?.schemas.map((schema) => ({
    ...schema,
    tables: schema.tables.filter((table) => table.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }))
      .filter((schema) => schema.tables.length > 0);

  return (
      <div className="flex flex-col h-full justify-between">
        <div className="px-2 py-4 border-b">
          <Input
            name="My Production Database"
            type="text"
            placeholder="Enter connection name"
            required
            className="py-2 rounded-sm"
          />
        </div>
        <div>Connections</div>
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
