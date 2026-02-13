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
import { testConnectionToDatabase } from "@/app/api/actions/database-actions";
import { toastManager } from "../ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type DatabaseType = "POSTGRES" | "MYSQL" | "SQLITE";

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
    useState<DatabaseType>("POSTGRES");
  const [connectionMode, setConnectionMode] = useState<"fields" | "uri">("uri");
  const [connectionName, setConnectionName] = useState("");
  const [port, setPort] = useState<number | undefined>(undefined);
  const [host, setHost] = useState("");
  const [databaseUsername, setDatabaseUsername] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const [databasePassword, setDatabasePassword] = useState("");
  // Connection string
  const [connectionString, setConnectionString] = useState("");

  const handleTestConnection = () => {
    const connectionConfig =
      connectionMode === "uri"
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
          };
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
                name="My Production Database"
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
                  onClick={() => setSelectedDbType("POSTGRES")}
                  variant="outline"
                  className="px-4 py-6"
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
                  onClick={() => setSelectedDbType("MYSQL")}
                  variant="outline"
                  className="px-4 py-6"
                  disabled
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
                  onClick={() => setSelectedDbType("SQLITE")}
                  variant="outline"
                  className="px-4 py-6"
                  disabled
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
            {selectedDbType !== "SQLITE" && (
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
          <Button className="py-4" onClick={handleTestConnection}>
            Test Connection
          </Button>
          <Button className="py-4">Connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { NewConnection };
