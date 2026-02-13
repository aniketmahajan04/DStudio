interface HistoryItem {
  id: string;
  query: string;
  executedAt: string;
  duration: string;
  status: "success" | "error";
}
const mockHistory: HistoryItem[] = [
  {
    id: "1",
    query: "SELECT * FROM users LIMIT 100;",
    executedAt: "2024-01-21 10:30:15",
    duration: "125ms",
    status: "success",
  },
  {
    id: "2",
    query: "UPDATE products SET price = price * 1.1 WHERE category_id = 5;",
    executedAt: "2024-01-21 10:25:42",
    duration: "342ms",
    status: "success",
  },
  {
    id: "3",
    query: "SELECT * FROM nonexistent_table;",
    executedAt: "2024-01-21 10:20:08",
    duration: "45ms",
    status: "error",
  },
];

export type { HistoryItem };

export { mockHistory };
