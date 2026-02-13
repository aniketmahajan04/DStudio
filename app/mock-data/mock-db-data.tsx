interface TreeNode {
  name: string;
  type: "database" | "folder" | "table" | "view" | "function" | "schema";
  children?: TreeNode[];
  rowCount?: number;
  isPublic?: boolean;
}

const mockData: TreeNode[] = [
  {
    name: "production_db",
    type: "database",
    children: [
      {
        name: "Schemas",
        type: "folder",
        children: [
          {
            name: "public",
            type: "schema",
            isPublic: true,
            children: [
              {
                name: "Tables",
                type: "folder",
                children: [
                  { name: "users", type: "table", rowCount: 1250 },
                  { name: "orders", type: "table", rowCount: 3420 },
                  { name: "products", type: "table", rowCount: 856 },
                  { name: "customers", type: "table", rowCount: 2100 },
                  { name: "employees", type: "table", rowCount: 45 },
                  { name: "categories", type: "table", rowCount: 24 },
                  { name: "reviews", type: "table", rowCount: 5230 },
                ],
              },
              {
                name: "Views",
                type: "folder",
                children: [
                  { name: "active_users", type: "view" },
                  { name: "order_summary", type: "view" },
                  { name: "monthly_revenue", type: "view" },
                ],
              },
              {
                name: "Functions",
                type: "folder",
                children: [
                  { name: "calculate_total", type: "function" },
                  { name: "get_user_stats", type: "function" },
                ],
              },
            ],
          },
          {
            name: "analytics",
            type: "schema",
            children: [
              {
                name: "Tables",
                type: "folder",
                children: [
                  { name: "events", type: "table", rowCount: 15420 },
                  { name: "metrics", type: "table", rowCount: 8900 },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "development_db",
    type: "database",
    children: [
      {
        name: "Schemas",
        type: "folder",
        children: [
          {
            name: "public",
            type: "schema",
            isPublic: true,
            children: [
              {
                name: "Tables",
                type: "folder",
                children: [
                  { name: "test_users", type: "table", rowCount: 50 },
                  { name: "test_data", type: "table", rowCount: 120 },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
