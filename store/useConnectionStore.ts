import { DatabaseMetaData, TableMetaData } from "@/lib/database/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConnectionState {
  activeConnectionId: string | null;
  activeConnectionName: string | null;
  dbMetadata: DatabaseMetaData | null;

  // Data CACHE
  tables: Record<string, TableMetaData>;

  // UI STATE
  selectedTable: string | null;
  isConnecting: boolean;
  error: string | null;

  // ACTIONS
  setSession: (id: string, name: string) => void;
  setDatabaseData: (
    data: DatabaseMetaData,
    tableDetails: TableMetaData[],
  ) => void;
  updateTablePosition: (tableName: string, x: number, y: number) => void;
  clearSession: () => void;
}

const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      activeConnectionId: null,
      activeConnectionName: null,
      dbMetadata: null,
      tables: {},
      selectedTable: null,
      isConnecting: false,
      error: null,

      setSession: (id, name) =>
        set({
          activeConnectionId: id,
          activeConnectionName: name,
          tables: {},
          dbMetadata: null,
        }),

      setDatabaseData: (data, tableDetails) => {
        // Convert array to Record for the visualizer
        const tableMap = tableDetails.reduce(
          (acc, table) => {
            acc[table.name] = table;
            return acc;
          },
          {} as Record<string, TableMetaData>,
        );

        set({ dbMetadata: data, tables: tableMap });
      },

      updateTablePosition: (tableName, x, y) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableName]: {
              ...state.tables[tableName],
              ui: { ...state.tables[tableName].uniqueConstraints, x, y },
            },
          },
        })),

      clearSession: () =>
        set({
          activeConnectionId: null,
          activeConnectionName: null,
          tables: {},
          dbMetadata: null,
        }),
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
