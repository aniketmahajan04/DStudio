import { HistoryItem } from "@/app/mock-data/mock-history-data";
import { ScrollArea } from "../ui/scroll-area";
import { QueryHistoryCard } from "./query-history-card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

function QueryHistoryList({ histories, onRun }) {
  return (
    <ScrollArea>
      <div className="flex justify-between items-center px-2 py-4 mb-4">
        <h3 className="uppercase text-muted-foreground">Recent Queries</h3>
        <Button variant="ghost" className={cn("")}>
          Clear All
        </Button>
      </div>
      <div className="w-72 flex flex-col">
        {histories.map((history: HistoryItem) => (
          <QueryHistoryCard key={history.id} history={history} onRun={onRun} />
        ))}
      </div>
    </ScrollArea>
  );
}

export { QueryHistoryList };
