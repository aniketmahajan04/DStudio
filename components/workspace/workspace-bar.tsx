"use client";
import { mockSavedQueries } from "@/app/mock-data/mock-save-query";
import { SavedQueryList } from "./saved-query-list";
import { QueryHistoryList } from "./query-history-list";
import { mockHistory } from "@/app/mock-data/mock-history-data";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ConnectionWrapper } from "./connection-wrapper";

function WorkspaceBar() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  return (
    <div className="w-76 flex flex-col border-r border-border bg-background shrink-0 min-h-[90vh]">
      {activeWorkspace === "connections" && <ConnectionWrapper />}

      {activeWorkspace === "saved" && (
        <SavedQueryList
          queries={mockSavedQueries}
          selectedId={undefined}
          onSelect={undefined}
          onRun={undefined}
        />
      )}

      {activeWorkspace === "history" && (
        <QueryHistoryList histories={mockHistory} onRun={undefined} />
      )}
    </div>
  );
}

export { WorkspaceBar };
