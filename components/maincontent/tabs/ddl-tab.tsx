"use client";

import { useState } from "react";
import { useConnectionStore } from "@/store/useConnectionStore";
import { Play, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { toastManager } from "@/components/ui/toast";
import { executeQuery } from "@/app/api/actions/database-actions";
import { error } from "better-auth/api";

function DdlTab() {
  const { activeConnectionId } = useConnectionStore();
  const [sqlQuery, setSqlQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const handleExecuteQuery = async () => {
    if (!activeConnectionId) {
      toastManager.add({
        title: "No Connection",
        type: "error",
        description: "Please connect to a database first",
      });
      return;
    }

    if (!sqlQuery.trim()) {
      toastManager.add({
        title: "Empty query",
        type: "error",
        description: "Please enter a SQL query",
      });
      return;
    }

    setIsExecuting(true);

    try {
      const result = await executeQuery(activeConnectionId, sqlQuery);

      if (result.success && result.data) {
        setQueryResult(result.data);
        toastManager.add({
          title: "Query Executed",
          type: "success",
          description: `Complete in ${result.data.executionTime}ms`,
        });
      } else {
        setQueryResult({ error: result.error });
        toastManager.add({
          title: "Query Failed",
          type: "error",
          description: result.error || "Failed to execute query",
        });
      }
    } catch (error: any) {
      setQueryResult({ error: error.message });
      toastManager.add({
        title: "Error",
        type: "error",
        description: error.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClear = () => {
    setSqlQuery("");
    setQueryResult(null);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Add keyboard shortcut Ctrl+Enter to execute
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecuteQuery();
    });
  };

  if (!activeConnectionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <p className="text-lg mb-2">No Active Connection</p>
          <p className="text-sm">Connect to a database to execute queries</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Results */}
        <div className="flex-1 flex flex-col border-r overflow-hidden">
          {/* Results */}
          <div className="border-b px-4 py-3 bg-accent/20">
            <h3 className="text-sm font-medium">Results</h3>
          </div>

          {/* Results Content */}
          <div className="flex-1 overflow-auto p-4">
            {queryResult ? (
              queryResult.error ? (
                // Error Display
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-destructive">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive mb-1">
                        Query Error
                      </h4>
                      <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                        {queryResult.error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : queryResult.rows && queryResult.rows.length > 0 ? (
                // Table Results
                <div>
                  <div className="mb-4 text-sm text-muted-foreground">
                    {queryResult.rowCount} rows * {queryResult.executionTime}ms
                  </div>
                  <div className="border rounded-lg overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-accent sticky top-0">
                        <tr>
                          {queryResult.fields.map((field: string) => (
                            <th
                              key={field}
                              className="px-4 py-2 text-left font-medium border-b"
                            >
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-accent/50">
                            {queryResult.fields.map((field: string) => (
                              <td key={field} className="px-4 py-4">
                                {row[field] === null ? (
                                  <span className="text-muted-foreground italic">
                                    NULL
                                  </span>
                                ) : typeof row[field] === "boolean" ? (
                                  <span
                                    className={
                                      row[field]
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {row[field] ? "true" : "false"}
                                  </span>
                                ) : (
                                  String(row[field])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Success but no rows
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-primary">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-primary mb-1">
                        Query Successful
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Query executed successfully •{" "}
                        {queryResult.executionTime}ms
                      </p>
                      {queryResult.rowCount !== undefined && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Affected rows: {queryResult.rowCount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              // No result yet
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg mb-2">No Results Yet</p>
                  <p className="text-sm">
                    Write and executed a query to see results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - SQL Editor */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="border-b px-4 py-3 flex items-center justify-between bg-accent/20">
            <h3 className="text-sm font-medium">SQL Editor</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={handleExecuteQuery}
                disabled={isExecuting}
                className="flex items-center gap-2 px-2 py-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {isExecuting ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value || "")}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* Editor Footer */}
          <div className="border-t px-4 py-2 bg-accent/20">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>💡 Tip: Press Ctrl+Enter to execute</span>
              <span className="ml-auto">{sqlQuery.length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DdlTab };
