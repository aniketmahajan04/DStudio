"use client";

import { fetchTableData } from "@/app/api/actions/database-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConnectionStore } from "@/store/useConnectionStore";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

function DataExplorerTab() {
  const {
    selectedTable,
    activeConnectionId,
    getCachedTableData,
    setTableData,
    isFetchingData,
    setIsFetchingData,
  } = useConnectionStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const parsedTable = selectedTable
    ? {
        schema: selectedTable.split(".")[0],
        table: selectedTable.split(".")[1],
      }
    : null;

  const cachedData = selectedTable ? getCachedTableData(selectedTable) : null;

  useEffect(() => {
    if (!parsedTable || !activeConnectionId) return;

    if (cachedData && cachedData.currentPage === currentPage) {
      return;
    }

    loadTableData();
  }, [selectedTable, currentPage, activeConnectionId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTable]);

  const loadTableData = async () => {
    if (!parsedTable || !activeConnectionId) return;

    setIsFetchingData(true);

    try {
      const result = await fetchTableData(
        activeConnectionId,
        parsedTable.schema,
        parsedTable.table,
        currentPage,
        pageSize,
      );

      if (result.success && result.data) {
        setTableData(selectedTable!, {
          ...result.data,
          currentPage,
          pageSize,
        });
      }
    } catch (error) {
      console.error("Failed to fetch table data:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleRefresh = () => {
    loadTableData();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (cachedData && currentPage * pageSize < cachedData.totalCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!activeConnectionId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No active connection</p>
          <p>Connect to a database to get started</p>
        </div>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg"> Select a table to view its data</p>
          <p className="text-sm mt-2">
            Choose a table from the connections panel
          </p>
        </div>
      </div>
    );
  }

  if (isFetchingData && !cachedData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading table data...</p>
        </div>
      </div>
    );
  }

  if (!cachedData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, cachedData.totalCount);
  const totalPages = Math.ceil(cachedData.totalCount / pageSize);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h2 className="text-lg font-semibold">{parsedTable?.table}</h2>
          <p className="text-sm text-muted-foreground">
            Showing {startRow}-{endRow} of{" "}
            {cachedData.totalCount.toLocaleString()} rows
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetchingData}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetchingData ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/*Table*/}
      <div className="flex-1 min-h-0 overflow-auto">
        <Table className="max-w-full">
          <TableHeader className="sticky top-0 z-10 border-b">
            <TableRow>
              <TableHead className="w-12 text-center font-semibold">
                #
              </TableHead>
              {cachedData.columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cachedData.rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={cachedData.columns.length + 1}
                  className="text-center py-8 text-muted-foreground"
                >
                  No rows found
                </TableCell>
              </TableRow>
            ) : (
              cachedData.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {startRow + rowIndex}
                  </TableCell>
                  {cachedData.columns.map((column) => (
                    <TableCell key={column} className="font-mono text-sm">
                      {row[column] === null ? (
                        <span className="text-muted-foreground italic">
                          NULL
                        </span>
                      ) : typeof row[column] === "boolean" ? (
                        <span
                          className={
                            row[column] ? "text-cyan-600" : "text-rose-600"
                          }
                        >
                          {row[column] ? "true" : "false"}
                        </span>
                      ) : typeof row[column] === "object" ? (
                        <span className="text-xs text-orange-600">
                          {JSON.stringify(row[column])}
                        </span>
                      ) : typeof row[column] === "number" ? (
                        <span className="text-blue-600">
                          {row[column].toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-foreground">
                          {String(row[column])}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isFetchingData}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-16 text-center border rounded px-2 py-1"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isFetchingData}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DataExplorerTab };
