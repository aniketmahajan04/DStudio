"use client";
import { TableMetaData, TablePosition } from "@/lib/database/types";
import { useConnectionStore } from "@/store/useConnectionStore";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { JSX, useEffect, useRef, useState } from "react";

function SchemaVisualizerTab() {
  const { tables, dbMetadata, selectedSchema, setSelectedSchema } =
    useConnectionStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const [tablePositions, setTablePosition] = useState<
    Record<string, TablePosition>
  >({});
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [tableDragOffset, setTableDragOffset] = useState({ x: 0, y: 0 });

  // Initialize with first schema
  useEffect(() => {
    if (dbMetadata && dbMetadata.schemas.length > 0 && !selectedSchema) {
      setSelectedSchema(dbMetadata.schemas[0].name);
    }
  }, [dbMetadata, selectedSchema, setSelectedSchema]);

  // Auto-layout tables when schema changes
  useEffect(() => {
    if (!selectedSchema || !dbMetadata) return;

    const schema = dbMetadata.schemas.find((s) => s.name === selectedSchema);

    if (!schema) return;

    // Simple grid layout
    const positions: Record<string, TablePosition> = {};
    const cols = Math.ceil(Math.sqrt(schema.tables.length));
    const spacing = { x: 250, y: 200 };

    schema.tables.forEach((table, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const key = `${selectedSchema}.${table.name}`;

      positions[key] = {
        x: col * spacing.x + 50,
        y: row * spacing.y + 50,
      };
    });

    setTablePosition(positions);
  }, [selectedSchema, dbMetadata]);

  const toggleTableExpand = (tableKey: string) => {
    setExpandedTables((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tableKey)) {
        newSet.delete(tableKey);
      } else {
        newSet.add(tableKey);
      }
      return newSet;
    });
  };

  // Pan/Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === canvasRef.current) {
      // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingTable) {
      setTablePosition((prev) => ({
        ...prev,
        [draggingTable]: {
          x: e.clientX - tableDragOffset.x,
          y: e.clientY - tableDragOffset.y,
        },
      }));
      return;
    }

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientX - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingTable(null);
  };

  const renderTable = (tableKey: string, table: TableMetaData) => {
    const position = tablePositions[tableKey];
    if (!position) return null;

    // Separate columns by type
    // const pkColumns = table.columns.filter((col) => col.isPrimaryKey);
    // const fkColumns = table.columns.filter(
    //   (col) => col.isForeignKey && !col.isPrimaryKey,
    // );

    // const regularColumns = table.columns.filter(
    //   (col) => !col.isPrimaryKey && !col.isForeignKey,
    // );

    // const maxVisibleColumns = 8;
    // const allColumns = [...pkColumns, ...fkColumns, ...regularColumns];
    // const visibleColumns = allColumns.slice(0, maxVisibleColumns);
    // const hiddenCount = allColumns.length - maxVisibleColumns;

    const isExpanaded = expandedTables.has(tableKey);
    const visibleColumns = isExpanaded
      ? table.columns
      : table.columns.slice(0, 5);
    const hiddenCount = table.columns.length - 5;

    return (
      <div
        key={tableKey}
        onMouseDown={(e) => {
          e.stopPropagation();
          const pos = tablePositions[tableKey];

          setDraggingTable(tableKey);
          setTableDragOffset({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
          });
        }}
        className="absolute bg-card border backdrop-blur-sm border-border rounded-sm shadow-lg overflow-hidden hover:scale-105"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          minWidth: "280px",
          // maxWidth: "220px",
        }}
      >
        {/* Table Header */}
        <div className="bg-primary/10 border-b  border-border px-3 py-1.5">
          <h3 className="font-bold text-sm text-foreground truncate">
            {table.name}
          </h3>
          {table.rowCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {table.rowCount.toLocaleString()} rows
            </p>
          )}
        </div>

        {/* Columns */}
        <div className="p-2 text-xs max-h-64 overflow-y-auto">
          {visibleColumns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-2 py-1 px-2 hover:bg-accent rounded transition-colors"
            >
              {/* {col.isPrimaryKey && ( */}
              {/*   <span className="text-yellow-500 font-mono text-base">🔑</span> */}
              {/* )} */}
              {/**/}
              {/* {col.isForeignKey && !col.isPrimaryKey && ( */}
              {/*   <span className="text-orange-500 font-mono text-base">🔗</span> */}
              {/* )} */}
              {/**/}
              {/* {!col.isPrimaryKey && !col.isForeignKey && ( */}
              {/*   <span className="text-muted-foreground font-mono text-base"> */}
              {/*     . */}
              {/*   </span> */}
              {/* )} */}
              {/* <span */}
              {/*   className={`flex-1 truncate ${ */}
              {/*     col.isPrimaryKey */}
              {/*       ? "font-semibold text-foreground" */}
              {/*       : "text-foreground" */}
              {/*   }`} */}
              {/* > */}
              {/*   {col.name} */}
              {/* </span> */}
              {/* <span className="text-muted-foreground text-xs shrink-0"> */}
              {/*   {col.type} */}
              {/* </span> */}

              {/* Icon */}
              {col.isPrimaryKey ? (
                <svg
                  className="w-3 h-3 text-emerald-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              ) : (
                <span className="w-3 h-3 shrink-0 text-slate-500 text-center leading-3">
                  T
                </span>
              )}

              {/* Column name */}
              <span className="truncate flex-1" title={col.name}>
                {col.name}
              </span>

              {/* FK badge */}
              {col.isForeignKey && (
                <span className="text-[10px] text-orange-400 shrink-0">FK</span>
              )}

              {/* PK badge */}
              {col.isPrimaryKey && (
                <span className="text-[10px] text-emerald-400 shrink-0">
                  {" "}
                  PK
                </span>
              )}
            </div>
          ))}

          {/* {hiddenCount > 0 && ( */}
          {/*   <div className="text-muted-foreground text-xs py-1 px-2 italic"> */}
          {/*     +{hiddenCount} more... */}
          {/*   </div> */}
          {/* )} */}

          {/* Expanded/Columns button */}
          {table.columns.length > 5 && (
            <button className="w-full px-2 py-1 bg-slate-700/30 hover:bg-slate-700/50 border-t border-slate-600/50 text-slate-400 text-[10px] flex items-center justify-center gap-1 transition-colors">
              {isExpanaded ? (
                <>
                  <ChevronUp className="w-3 h-3 " />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show {hiddenCount} More
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRelationShips = () => {
    if (!selectedSchema) return null;

    const paths: JSX.Element[] = [];

    Object.entries(tables).forEach(([tableKey, table]) => {
      if (!tableKey.startsWith(selectedSchema)) return;

      table.foreignKey.forEach((fk, index) => {
        const fromPos = tablePositions[tableKey];
        const toKey = `${selectedSchema}.${fk.referencedTable}`;
        const toPos = tablePositions[toKey];

        if (!fromPos || !toPos) return;

        // Calculate connection points
        const fromX = fromPos.x + 180; // Right edge
        const fromY = fromPos.y + 25; // Approximate middle
        const toX = toPos.x; // left edge
        const toY = toPos.y + 25;

        // Create Path
        const midX = (fromX + toX) / 2;

        paths.push(
          <g key={`${tableKey}-${fk.constraintName} ${index}`}>
            {/* Conneciton line */}
            <path
              d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
              className="hover:opacity-100 transition-opacity"
            />

            {/* end dot */}
            <circle
              cx={toX}
              cy={toY}
              r="3"
              fill="hsl(var(--mute-foreground))"
              opacity="0.7"
            />

            {/* start dot */}
            <circle
              cx={fromX}
              cy={fromY}
              r="3"
              fill="hsl(var(--mute-foreground))"
              opacity="0.7"
            />
          </g>,
        );
      });
    });

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {/* <defs> */}
        {/*   <marker */}
        {/*     id="arrowhead" */}
        {/*     markerWidth="10" */}
        {/*     markerHeight="10" */}
        {/*     refX="9" */}
        {/*     refY="3" */}
        {/*     orient="auto" */}
        {/*   > */}
        {/*     <polygon */}
        {/*       points="0 0, 10 3, 0 6" */}
        {/*       fill="hsl(var(--mute-foreground))" */}
        {/*     /> */}
        {/*   </marker> */}
        {/* </defs> */}
        {paths}
      </svg>
    );
  };

  if (!dbMetadata || dbMetadata.schemas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No schema available</p>
          <p className="text-sm mt-2">Connect to a database to view schemas</p>
        </div>
      </div>
    );
  }

  const currentSchema = dbMetadata.schemas.find(
    (s) => s.name === selectedSchema,
  );
  const currentTables = currentSchema
    ? Object.entries(tables).filter(([key]) => key.startsWith(selectedSchema))
    : [];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Controls */}
      <div className="px-4 py-3 border-b bg-card shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">
              Schema:
            </label>
            <select
              value={selectedSchema || ""}
              onChange={(e) => setSelectedSchema(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {dbMetadata.schemas.map((schema) => (
                <option key="schema.name">
                  {schema.name} ({schema.tables.length} tables)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(1)}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Reset View
            </button>
            <span className="text-xs text-muted-foreground">
              Zoom: {(scale * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {renderRelationShips()}
          <div style={{ position: "relative", zIndex: 1 }}>
            {currentTables.map(([key, table]) => renderTable(key, table))}
          </div>
        </div>

        {/* Instructions */}
        {/* <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg"> */}
        {/*   <p>🖱️ Drag to pan • 🖱️ Scroll to zoom</p> */}
        {/* </div> */}

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-md overflow-hidden ">
          <button
            onClick={() => setScale((s) => Math.min(3, s * 1.2))}
            className="px-3 py-2 text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            +
          </button>
          <div className="h-px bg-slate-600/50" />
            <button
              onClick={() => setScale((s) => Math.max(0.1, s / 1.2))}
              className="px-3 py-2 text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              -
            </button>
            <div className="h-px bg-slate-600/50" />
              <button
                onClick={() => {
                  setScale(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="px-2 py-2 text-slate-300 hover:bg-slate-700/50 transition-colors"
                title="Reset view"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Minimap preview (bottom-right) */}
            <div className="absolute bottom-4 right-4 w-48 h-32 bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-md overflow-hidden">
              <div className="w-full h-full relative">
                {/* Miniature view of tables */}
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `scale(${0.15})`,
                    transformOrigin: "top left",
                  }}
                >
                  {currentTables.map(([key]) => {
                    const pos = tablePositions[key];
                    if (!pos) return null;
                    return (
                      <div
                        key={key}
                        className="absolute bg-emerald-500/40 border border-emerald-400/30 rounded"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          width: "180px",
                          height: "100px",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
}

      {/* Legend */}
      <div className="px-4 py-2 border-t bg-card text-xs text-muted-foreground">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">🔑</span>
            <span>Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500">🔗</span>
            <span>Foreign Key</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">.</span>
            <span>Regular Column</span>
          </div>
          <div className="flex items-center gap-2">
            <span>---</span>
            <span>Relationship</span>
          </div>
        </div>
      </div>
    </div>
}

export { SchemaVisualizerTab };
