"use client";

import Image from "next/image";
import { Database, Plus } from "lucide-react";
import PostgresLogo from "@/app/public/postgre.svg";
import SqliteLogo from "@/app/public/sqlite.svg";
import MysqlLogo from "@/app/public/mysql.svg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Form } from "../ui/form";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { useState } from "react";
import {
  saveConnectionAndFetchMetadata,
  testConnectionToDatabase,
} from "@/app/api/actions/database-actions";
import { toastManager } from "../ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DatabaseType } from "@/lib/database/types";
import { useConnectionStore } from "@/store/useConnectionStore";

function NewConnection({
  triggerLabel,
  isOpen,
  onOpenChange,
}: {
  triggerLabel: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedDbType, setSelectedDbType] =
    useState<DatabaseType>("postgresql");
  const [connectionMode, setConnectionMode] = useState<"fields" | "uri">("uri");
  const [connectionName, setConnectionName] = useState("");
  const [port, setPort] = useState<number | undefined>(undefined);
  const [host, setHost] = useState("");
  const [databaseUsername, setDatabaseUsername] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const [databasePassword, setDatabasePassword] = useState("");
  // Connection string
  const [connectionString, setConnectionString] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [ssl, setSSL] = useState(false);

  const { setActiveConnection } = useConnectionStore();

  const getConnectionConfig = () => {
    return connectionMode === "uri"
      ? {
          type: selectedDbType,
          connectionString,
        }
      : {
          type: selectedDbType,
          port,
          host,
          database: databaseName,
          username: databaseUsername,
          password: databasePassword,
          ssl,
        };
  };
  const handleTestConnection = () => {
    const connectionConfig = getConnectionConfig();
    toastManager.promise(
      testConnectionToDatabase(connectionConfig).then((result) => {
        console.log("RESULT:", result);

        if (!result.success) {
          throw new Error(result.error || "Connection failed.");
        }

        return "Connection successful!";
      }),
      {
        loading: {
          title: "Testing connection",
          description: "Please wait while we are connecting to you database.",
        },
        success: (message: string) => ({
          title: "Connection Successful 🎉",
          description: message,
        }),
        error: (error: Error) => ({
          title: "Connection Failed ❌",
          description: error.message || "Something went wrong",
        }),
      },
    );
  };

  const handleConnect = async () => {
    if (!connectionName.trim()) {
      toastManager.add({
        title: "Validation Error",
        type: "error",
        description: "Please enter a connection name",
      });
      return;
    }

    const connectionConfig = getConnectionConfig();
    setIsConnecting(true);

    try {
      const result = await saveConnectionAndFetchMetadata(
        connectionName,
        connectionConfig,
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to save connection.");
      }

      const { connectionId, metadata, tableDetails } = result.data;

      // Update the store with connection data
      setActiveConnection(connectionId, connectionName, metadata, tableDetails);

      toastManager.add({
        title: "Connection successfully! 🎉",
        type: "success",
        description: `Connected to ${connectionName}`,
      });

      onOpenChange(false);

      resetForm();
    } catch (error: any) {
      toastManager.add({
        title: "Connection Failed",
        type: "error",
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const resetForm = () => {
    setConnectionName("");
    setHost("");
    setPort(undefined);
    setDatabaseName("");
    setDatabasePassword("");
    setConnectionString("");
    setSSL(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: "default" }))}>
        <Plus /> {triggerLabel}
      </DialogTrigger>
      <DialogContent
        className={
          "font-poppins rounded-node rounded-t-xl px-0 sm:max-w-max md:rounded-2xl"
        }
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 text-left border-b">
          <DialogTitle className="flex gap-4 items-center">
            <Database /> New Database Connection
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base px-10">
            Connect to your database.
          </DialogDescription>
        </DialogHeader>

        {/* main */}
        <div className="px-6 pt-4 overflow-y-auto max-h-[50vh]">
          <Form>
            <Field className="gap-4">
              <FieldLabel className="tracking-wider">
                Connection Name
              </FieldLabel>
              <Input
                onChange={(e) => setConnectionName(e.target.value)}
                value={connectionName}
                name="connectionName"
                type="text"
                placeholder="Enter connection name"
                required
                className="py-2"
              />
              <FieldError>Please enter connection name.</FieldError>
            </Field>

            {/* Database Buttons */}
            <Field className="gap-4">
              <FieldLabel className="tracking-wider">
                Select Database Type
              </FieldLabel>
              <div className="flex items-center gap-20">
                <Button
                  onClick={() => setSelectedDbType("postgresql")}
                  variant="outline"
                  className="px-4 py-6"
                  type="button"
                >
                  <Image
                    src={PostgresLogo}
                    alt="PostgreSQL"
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  PostgreSQL
                </Button>
                <Button
                  onClick={() => setSelectedDbType("mysql")}
                  variant="outline"
                  className="px-4 py-6"
                  disabled
                  type="button"
                >
                  <Image
                    src={MysqlLogo}
                    alt="PostgreSQL"
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  MySql
                </Button>
                <Button
                  onClick={() => setSelectedDbType("sqlite")}
                  variant="outline"
                  className="px-4 py-6"
                  disabled
                  type="button"
                >
                  <Image
                    src={SqliteLogo}
                    alt="PostgreSQL"
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  SQLite
                </Button>
              </div>
            </Field>
            {selectedDbType !== "sqlite" && (
              <>
                <Tabs
                  value={connectionMode}
                  onValueChange={(v) =>
                    setConnectionMode(v as "fields" | "uri")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="uri">Connection String</TabsTrigger>
                    <TabsTrigger value="fields">Individual Fields</TabsTrigger>
                  </TabsList>

                  {/* Connection String Tab */}
                  <TabsContent value="uri" className="space-y-4">
                    <Field className="gap-4">
                      <FieldLabel className="tracking-wider">
                        Connection String (URI)
                      </FieldLabel>
                      <Input
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                        name="connectionString"
                        type="text"
                        placeholder="postgresql://username:password@host:port/database?sslmode=require"
                        className="py-2 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste your full connection string from your database
                        provider (Neon, Supabase, Railway, etc.)
                      </p>
                    </Field>
                  </TabsContent>

                  <TabsContent value="fields" className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Field className="gap-4">
                        <FieldLabel className="tracking-wider">Host</FieldLabel>
                        <Input
                          name="host"
                          type="text"
                          value={host}
                          placeholder="Host"
                          className="py-2"
                          onChange={(e) => setHost(e.target.value)}
                        />
                      </Field>

                      <Field className="gap-4">
                        <FieldLabel>Port</FieldLabel>
                        <Input
                          name="port"
                          type="number"
                          value={port || ""}
                          placeholder="Port"
                          className="py-2"
                          onChange={(e) =>
                            setPort(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </Field>
                    </div>

                    <Field className="gap-4">
                      <FieldLabel className="tracking-wider">
                        Username
                      </FieldLabel>
                      <Input
                        name="username"
                        type="text"
                        value={databaseUsername}
                        placeholder="Username"
                        className="py-2"
                        onChange={(e) => setDatabaseUsername(e.target.value)}
                      />
                    </Field>

                    <Field className="gap-4">
                      <FieldLabel className="tracking-wider">
                        Database Name
                      </FieldLabel>
                      <Input
                        name="database name"
                        type="text"
                        value={databaseName}
                        placeholder="Database name"
                        className="py-2"
                        onChange={(e) => setDatabaseName(e.target.value)}
                      />
                    </Field>

                    <Field className="gap-4">
                      <FieldLabel className="tracking-wider">
                        Password
                      </FieldLabel>
                      <Input
                        name="Password"
                        type="text"
                        value={databasePassword}
                        placeholder="Password"
                        className="py-2"
                        onChange={(e) => setDatabasePassword(e.target.value)}
                      />
                    </Field>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </Form>
        </div>
        <DialogFooter className="flex">
          <Button
            variant="outline"
            className="py-4"
            onClick={handleTestConnection}
            disabled={isConnecting}
            type="button"
          >
            Test Connection
          </Button>
          <Button
            className="py-4"
            onClick={handleConnect}
            disabled={isConnecting}
            type="button"
          >
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { NewConnection };
