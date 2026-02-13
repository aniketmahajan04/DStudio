"use client";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { NewConnection } from "../core/new-connection";
import { useState } from "react";

function Connections() {
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col h-full justify-between">
        <div className="px-2 py-4 border-b">
          <Input
            name="My Production Database"
            type="text"
            placeholder="Enter connection name"
            required
            className="py-2 rounded-sm"
          />
        </div>
        <div>Connections</div>
        <div className="flex flex-col px-2 gap-2 flex-end mt-auto py-4 border-t">
          <NewConnection
            triggerLabel={"New Connection"}
            isOpen={isNewConnectionOpen}
            onOpenChange={setIsNewConnectionOpen}
          />
          <Button className="py-4">
            <RefreshCw />
            Refresh
          </Button>
        </div>
      </div>
    </>
  );
}

export { Connections };
