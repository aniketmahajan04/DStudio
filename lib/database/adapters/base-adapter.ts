import { ConnectionConfig } from "../types";

export abstract class DatabaseAdapter {
  protected connectionString: string;
  protected config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.connectionString = this.buildConnectionString(config);
  }

  // Connection Methods
  abstract testConnection(): Promise<{ success: boolean; error?: string }>;
  abstract diconnect(): Promise<void>;

  // Utility methods
  protected abstract buildConnectionString(config: ConnectionConfig): string;
}
