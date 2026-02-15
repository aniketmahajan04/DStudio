"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Maximize } from "lucide-react";

function MainContentBar() {
  const [activeTab, setActiveTab] = useState("Data Explorer");

  const tabs = [
    { name: "Data Explorer" },
    { name: "Schema Visualizer" },
    { name: "Query Builder" },
    { name: "DDL" },
  ];
  return (
    <div className="flex px-8 py-2 justify-between items-center border-b">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <div key={tab.name} className="relative">
            <button
              onClick={() => setActiveTab(tab.name)}
              className={`px-2 py-1 focus:outline-none ${
                activeTab === tab.name
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {tab.name}
            </button>
            {activeTab === tab.name && (
              <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-foreground transition-all duration-300 ease-in-out w-full" />
            )}
          </div>
        ))}
      </div>
      <Button variant="ghost" className="gap-2">
        <Maximize className="h-4 w-4" /> Full Screen
      </Button>
    </div>
  );
}

export { MainContentBar };
