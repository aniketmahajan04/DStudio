"use client";
import { TableMetaData, TablePosition } from "@/lib/database/types";
import { useConnectionStore } from "@/store/useConnectionStore";
import React, { JSX, useEffect, useRef, useState } from "react";

function SchemaVisualizerTab() {
  const { tables, dbMetadata, selectedSchema, setSelectedSchema } =
    useConnectionStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  const [tablePositions, setTablePosition] = useState<
    Record<string, TablePosition>
  >({});
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
    const position: Record<string, TablePosition> = {};
    const cols = Math.ceil(Math.sqrt(schema.tables.length));
    const spacing = { x: 280, y: 220 };

    schema.tables.forEach((table, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const key = `${selectedSchema}.${table.name}`;

      position[key] = {
        x: col * spacing.x + 50,
        y: col * spacing.y + 50,
      };
    });

    setTablePosition(position);
  }, [selectedSchema, dbMetadata]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientX - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientX - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderTable = (tableKey: string, table: TableMetaData) => {
    const position = tablePositions[tableKey];
    if (!position) return null;

    // Separate columns by type
    const pkColumns = table.columns.filter((col) => col.isPrimaryKey);
    const fkColumns = table.columns.filter(
      (col) => col.isForeignKey && !col.isPrimaryKey,
    );

    const regularColumns = table.columns.filter(
      (col) => !col.isPrimaryKey && !col.isForeignKey,
    );

    const maxVisibleColumns = 8;
    const allColumns = [...pkColumns, ...fkColumns, ...regularColumns];
    const visibleColumns = allColumns.slice(0, maxVisibleColumns);
    const hiddenCount = allColumns.length - maxVisibleColumns;

    return (
      <div
        key={tableKey}
        className="absolute bg-card border-2 border-border rounded-lg
         shadow-xl overflow-hidden transition-transform hover:scale-105 hover:shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          minWidth: "220px",
          maxWidth: "220px",
        }}
      >
        {/* Table Header */}
        <div className="bg-primary/10 border-b-2  border-border px-3 py-2">
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
              {col.isPrimaryKey && (
                <span className="text-yellow-500 font-mono text-base">🔑</span>
              )}

              {col.isForeignKey && !col.isPrimaryKey && (
                <span className="text-orange-500 font-mono text-base">🔗</span>
              )}

              {!col.isPrimaryKey && !col.isForeignKey && (
                <span className="text-muted-foreground font-mono text-base">
                  .
                </span>
              )}
              <span
                className={`flex-1 truncate ${
                  col.isPrimaryKey
                    ? "font-semibold text-foreground"
                    : "text-foreground"
                }`}
              >
                {col.name}
              </span>
              <span className="text-muted-foreground text-xs shrink-0">
                {col.type}
              </span>
            </div>
          ))}

          {hiddenCount > 0 && (
            <div className="text-muted-foreground text-xs py-1 px-2 italic">
              +{hiddenCount} more...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRelationShips = () => {
    if (!selectedSchema) return null;

    const lines: JSX.Element[] = [];

    Object.entries(tables).forEach(([tableKey, table]) => {
      if (!tableKey.startsWith(selectedSchema)) return;

      table.foreignKey.forEach((fk, index) => {
        const fromPos = tablePositions[tableKey];
        const toKey = `${selectedSchema}.${fk.referencedTable}`;
        const toPos = tablePositions[toKey];

        if (!fromPos || !toPos) return;

        // Calculate connection points
        const fromX = fromPos.x + 220; // Right edge
        const fromY = fromPos.y + 40; // Approximate middle
        const toX = toPos.x; // left edge
        const toY = toPos.y + 40;

        // Control points for curved line
        const midX = (fromX + toX) / 2;

        lines.push(
          <g key={`${tableKey}-${fk.constraintName}`}>
            <path
              d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.5"
              className="hover:opacity-100 transition-opacity"
            />

            <circle
              cx={toX}
              cy={toY}
              r="4"
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
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="hsl(var(--mute-foreground))"
            />
          </marker>
        </defs>
        {lines}
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
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg">
          <p>🖱️ Drag to pan • 🖱️ Scroll to zoom</p>
        </div>
      </div>

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
  );
}

export { SchemaVisualizerTab };
