"use server";

import { DatabaseAdapterFactory } from "@/lib/database/adapter-factory";
import { ConnectionConfig } from "@/lib/database/types";

async function testConnectionToDatabase(config: ConnectionConfig) {
  try {
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, error: "Unauthorized" };
    // }
    const adapter = DatabaseAdapterFactory.createAdapter(config);
    const testResult = await adapter.testConnection();

    if (!testResult.success) {
      return { success: false, error: testResult.error };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export { testConnectionToDatabase };
