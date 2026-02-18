import { DatabaseMetaData, TableMetaData } from "@/lib/database/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedConnection {
  id: string;
  connectionName: string;
  type: "postgresql" | "mysql" | "sqlite";
  createdAt: Date;
}

interface ConnectionState {
  activeConnectionId: string | null;
  activeConnectionName: string | null;

  savedConnections: SavedConnection[];

  dbMetadata: DatabaseMetaData | null;

  // Data CACHE
  tables: Record<string, TableMetaData>;

  tableDataCache: Record<
    string,
    {
      rows: any[];
      totalCount: number;
      columns: string[];
      currentPage: number;
      pageSize: number;
      fetchedAt: number; // timestamp
    }
  >; // key: "schema.tableName"

  // UI STATE
  selectedTable: string | null;
  selectedSchema: string | null;
  isConnecting: boolean;
  isFetchingData: boolean;
  error: string | null;

  // ACTIONS
  setSavedConnections: (connections: SavedConnection[]) => void;

  setActiveConnection: (
    id: string,
    name: string,
    metadata: DatabaseMetaData,
    tableDetails: TableMetaData[],
  ) => void;

  setDatabaseData: (
    data: DatabaseMetaData,
    tableDetails: TableMetaData[],
  ) => void;

  setTableData: (
    tableKey: string,
    data: {
      rows: any[];
      totalCount: number;
      columns: string[];
      currentPage: number;
      pageSize: number;
    },
  ) => void;

  setSelectedTable: (tableKey: string | null) => void;

  setSelectedSchema: (schema: string | null) => void;

  updateTableMetaData: (tableKey: string, metadata: TableMetaData) => void;

  setIsConnecting: (isConnecting: boolean) => void;

  setIsFetching: (isFetching: boolean) => void;

  setIsFetchingData: (isFetching: boolean) => void;

  setError: (error: string) => void;

  clearSession: () => void;

  clearTableDataCache: () => void;

  getCachedTableData: (
    tableKey: string,
    maxAge?: number,
  ) => {
    rows: any[];
    totalCount: number;
    columns: string[];
    currentPage: number;
    pageSize: number;
  } | null;
}

const DEFAULT_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 Minutes

const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      activeConnectionId: null,
      activeConnectionName: null,
      savedConnections: [],
      dbMetadata: null,
      tables: {},
      tableDataCache: {},
      selectedTable: null,
      selectedSchema: null,
      isConnecting: false,
      isFetchingData: false,
      error: null,

      setSavedConnections: (connections) =>
        set({ savedConnections: connections }),

      setActiveConnection: (id, name, metadata, tableDetails) => {
        // Convert array to Record for qyick lookup
        const tableMap = tableDetails.reduce(
          (acc, table) => {
            const key = `${table.schema}.${table.name}`;
            acc[key] = table;
            return acc;
          },
          {} as Record<string, TableMetaData>,
        );

        set({
          activeConnectionId: id,
          activeConnectionName: name,
          dbMetadata: metadata,
          tables: tableMap,
          tableDataCache: {},
          selectedTable: null,
          selectedSchema: metadata.schemas[0]?.name || null,
          error: null,
        });
      },

      setDatabaseData: (data, tableDetails) => {
        const tableMap = tableDetails.reduce(
          (acc, table) => {
            const key = `${table.schema}.${table.name}`;
            acc[key] = table;
            return acc;
          },
          {} as Record<string, TableMetaData>,
        );

        set({
          dbMetadata: data,
          tables: tableMap,
          selectedSchema: data.schemas[0]?.name || null,
        });
      },

      setTableData: (tableKey, data) =>
        set((state) => ({
          tableDataCache: {
            ...state.tableDataCache,
            [tableKey]: {
              ...data,
              fetchedAt: Date.now(),
            },
          },
        })),

      setSelectedTable: (tableKey) => set({ selectedTable: tableKey }),

      setSelectedSchema: (schema) => set({ selectedSchema: schema }),

      updateTableMetaData: (tableKey, metadata) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableKey]: metadata,
          },
        })),

      setIsConnecting: (isConnecting) => set({ isConnecting }),

      setIsFetching: (isFetching) => set({ isFetchingData: isFetching }),

      setIsFetchingData: (isFetching) => set({ isFetchingData: isFetching }),

      setError: (error) => set({ error }),

      clearSession: () =>
        set({
          activeConnectionId: null,
          activeConnectionName: null,
          tables: {},
          dbMetadata: null,
          tableDataCache: {},
          selectedTable: null,
          selectedSchema: null,
          error: null,
        }),

      clearTableDataCache: () => set({ tableDataCache: {} }),

      getCachedTableData: (tableKey, maxAge = DEFAULT_CACHE_MAX_AGE) => {
        const cached = get().tableDataCache[tableKey];
        if (!cached) return null;

        const age = Date.now() - cached.fetchedAt;
        if (age > maxAge) {
          // cache expired
          return null;
        }
        return cached;
      },
    }),
    {
      name: "dstudio-session-storage", // Persists to localstorage
      partialize: (state) => ({
        activeConnectionId: state.activeConnectionId,
        activeConnectionName: state.activeConnectionName,
      }),
    },
  ),
);

export { useConnectionStore };
