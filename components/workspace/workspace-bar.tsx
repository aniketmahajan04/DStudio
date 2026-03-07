"use client";
import { SavedQueryList } from "./saved-query-list";
import { QueryHistoryList } from "./query-history-list";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ConnectionWrapper } from "./connection-wrapper";

function WorkspaceBar() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  return (
    <div className="w-76 flex flex-col border-r border-border bg-background shrink-0 min-h-[90vh]">
      {activeWorkspace === "connections" && <ConnectionWrapper />}

      {activeWorkspace === "saved" && (
        <SavedQueryList
          onQuerySelect={(query) => {
            console.log("selected:", query.sqlQuery);
          }}
        />
      )}

      {activeWorkspace === "history" && <QueryHistoryList />}
    </div>
  );
}

export { WorkspaceBar };
