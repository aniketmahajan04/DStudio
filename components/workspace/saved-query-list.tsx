import { SavedQuery } from "@/app/mock-data/mock-save-query";
import { SavedQueryCard } from "../core/saved-query-card";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function SavedQueryList({ queries, selectedId, onSelect, onRun }) {
  return (
    <ScrollArea>
      <div className="gap-2 px-2 py-4 border-b mb-4">
        <Button className={cn("w-full rounded-md")}>
          <Plus /> New Query
        </Button>
      </div>
      <div className="w-72 flex flex-col">
        {queries.map((query: SavedQuery) => (
          <SavedQueryCard
            key={query.id}
            query={query}
            selected={selectedId === query.id}
            onSelect={() => onSelect(query.id)}
            onRun={() => onRun(query.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export { SavedQueryList };
