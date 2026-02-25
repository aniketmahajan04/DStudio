"use client";

import { useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Key, Type } from "lucide-react";
import { useConnectionStore } from "@/store/useConnectionStore";

function SchemaVisualizerTab() {
  const { tables, dbMetadata, selectedSchema, setSelectedSchema } =
    useConnectionStore();

  useEffect(() => {
    if (dbMetadata && dbMetadata.schemas.length > 0 && !selectedSchema) {
      setSelectedSchema(dbMetadata.schemas[0].name);
    }
  }, [dbMetadata, selectedSchema, setSelectedSchema]);

  // Generate nodes and edges from database metadata
  const { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => {
    if (!selectedSchema || !tables) {
      return { node: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const edgeSet = new Set<string>(); // To avoid duplicate edges

    // Get tables for selected schema
    const schemaTables = Object.entries(tables).filter(([key]) =>
      key.startsWith(`${selectedSchema}.`),
    );

    // Calculate grid layout
    const cols = Math.ceil(Math.sqrt(schemaTables.length));
    const spacing = { x: 280, y: 250 };

    schemaTables.forEach(([tableKey, table], index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Create nodes
      nodes.push({
        id: tableKey,
        type: "default",
        position: {
          x: col * spacing.x + 50,
          y: row * spacing.y + 50,
        },
        data: {
          label: (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 min-w-[180px] max-w-[220px]">
              {/* Table name header */}
              <div className="text-ema font-medium mb-2 pb-2 border-b border-slate-700 truncate">
                {table.name}
              </div>

              {/* Columns */}
              <div className="space-y-1 text-xs">
                {table.columns.slice(0, 8).map((column) => (
                  <div
                    key={column.name}
                    className="flex items-center gap-2 text-slate-300"
                  >
                    {/* Icon */}
                    {column.isPrimaryKey ? (
                      <Key className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Type className="w-3 h-3 text-slate-500 shrink-0" />
                    )}

                    {/* Column name */}
                    <span className="truncate flex-1" title={column.name}>
                      {column.name}
                    </span>

                    {/* Badges */}
                    {column.isPrimaryKey && (
                      <span className="text-[10px] text-emerald-500 shrink-0">
                        PK
                      </span>
                    )}

                    {column.isForeignKey && (
                      <span className="text-[10px] text-orange-400 shrink-0">
                        FK
                      </span>
                    )}
                  </div>
                ))}

                {/* Show more indicator */}
                {table.columns.length > 0 && (
                  <div className="text-slate-500 text-[10px] pt-1">
                    +{table.columns.length - 0} more
                  </div>
                )}
              </div>
            </div>
          ),
        },
        style: { background: "transparent", border: "none", padding: 0 },
      });

      // Create edges for foreign keys
      table.foreignKey.forEach((fk) => {
        const targetKey = `${selectedSchema}.${fk.referencedTable}`;
        const edgeId = `${tableKey}-${targetKey}-${fk.columnName}`;

        // Only add edges if target table exists and edges doesn't exist yet
        if (tables[targetKey] && !edgeSet.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: tableKey,
            target: targetKey,
            type: "smoothstep",
            style: { stroke: "#10b981", strokeWidth: 2 },
            animated: false,
          });
          edgeSet.add(edgeId);
        }
      });
    });

    return { nodes, edges };
  }, [selectedSchema, tables]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generatedNodes || []);
  const [edges, setEdges, noEdgesChange] = useEdgesState(generatedEdges);

  // Update nodes/edges when data changes
  useEffect(() => {
    if (generatedNodes) setNodes(generatedNodes);
    if (generatedEdges) setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  if (!dbMetadata || dbMetadata.schemas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 bg-slate-950">
        <div className="text-center">
          <p className="text-lg">No schema available</p>
          <p className="text-sm mt-2">Connect to a database to view schemas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Schema Selector */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">Schema:</label>
          <select
            value={selectedSchema || ""}
            onChange={(e) => setSelectedSchema(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {dbMetadata.schemas.map((schema) => (
              <option key={schema.name} value={schema.name}>
                {schema.name} ({schema.tables.length} tables)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ReactFlow canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={noEdgesChange}
          fitView
          className="bg-slate-950"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#334155" gap={16} />
          <Controls className="bg-slate-800 border-slate-700" />
          <MiniMap
            className="bg-slate-900 border-slate-700"
            nodeColor="1e293b"
            maskColor="rgba(15, 23, 42, 0.8)"
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export { SchemaVisualizerTab };
