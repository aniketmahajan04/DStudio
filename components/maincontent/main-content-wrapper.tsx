"use client";
import { useMainContentStore } from "@/store/useMainContentStore";
import { DataExplorerTab } from "./tabs/data-explorer-tab";
import { SchemaVisualizerTab } from "./tabs/schema-visualizer-tab";
import { QueryBuilderTab } from "./tabs/query-builder-tab";
import { DdlTab } from "./tabs/ddl-tab";

function MainContentWrapper() {
  const activeMainContentArea = useMainContentStore(
    (state) => state.activeMainContentArea,
  );

  return (
    <div className="flex-1 h-full min-h-0">
      {activeMainContentArea === "Data Explorer" && <DataExplorerTab />}

      {activeMainContentArea === "Schema Visualizer" && <SchemaVisualizerTab />}

      {activeMainContentArea === "Query Builder" && <QueryBuilderTab />}

      {activeMainContentArea === "DDL" && <DdlTab />}
    </div>
  );
}

export { MainContentWrapper };
