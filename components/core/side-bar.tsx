"use client";
import { Database, History, Save, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function SideBar() {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  return (
    <aside
      className="
        w-16
        border-r
        bg-background
        flex
        flex-col
        items-center
        justify-between
        py-4
        shrink-0"
    >
      {/* Icons */}
      <TooltipProvider delay={10}>
        <div className="flex flex-col gap-4">
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant={activeWorkspace ? "default" : "ghost"}
                className={cn("py-4 rounded-lg")}
                onClick={() => setActiveWorkspace("connections")}
              >
                <Database strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Database</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant={activeWorkspace ? "default" : "ghost"}
                className={cn("py-4 rounded-lg")}
                onClick={() => setActiveWorkspace("saved")}
              >
                <Save strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Save</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant={activeWorkspace ? "default" : "ghost"}
                className={cn("py-4")}
                onClick={() => setActiveWorkspace("history")}
              >
                <History strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>History</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Profile && Setting */}
        <div className="pb-10">
          <div className="flex items-center px-2 py-4 max-w-full">
            <span className="bg-border h-px flex-1" />
          </div>

          <Tooltip>
            <TooltipTrigger>
              <Button className={cn("py-4")}>
                <Settings strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </aside>
  );
}
