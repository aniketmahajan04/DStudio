export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}
export const mockSavedQueries: SavedQuery[] = [
  {
    id: "1",
    name: "Get Active Users",
    query: "SELECT * FROM users WHERE active = true;",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Monthly Sales Report",
    query:
      "SELECT DATE_TRUNC('month', created_at) as month, SUM(total) FROM orders GROUP BY month;",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    name: "Top Products",
    query:
      "SELECT p.name, COUNT(o.id) as orders FROM products p JOIN orders o ON p.id = o.product_id GROUP BY p.name ORDER BY orders DESC LIMIT 10;",
    createdAt: "2024-01-10",
  },
];
