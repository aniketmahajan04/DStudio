import { HistoryItem } from "@/app/mock-data/mock-history-data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

function QueryHistoryCard({
  history,
  onRun,
}: {
  history: HistoryItem;
  onRun: () => void;
}) {
  return (
    <Card key={history.id} className={cn("font-poppins mb-4 ml-4")}>
      <CardHeader className={cn("flex justify-between items-center py-4")}>
        <div
          className={`px-2 py-1 text-xs flex items-center rounded-sm border border-border ${
            history.status === "success" ? " text-emerald-400" : " text-red-400"
          } `}
        >
          {history.status === "success" ? (
            <>
              <Check size={18} />
              <CardTitle>{history.status}</CardTitle>
            </>
          ) : (
            <>
              <X size={18} />
              <CardTitle>{history.status}</CardTitle>
            </>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {history.duration}
        </span>
      </CardHeader>

      <CardContent>
        <p className="truncate text-muted-foreground tracking-tight">
          {history.query}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center pb-2">
        <span className="text-muted-foreground/50 text-sm">
          {history.executedAt}
        </span>
        <Button variant="ghost" className="rounded-sm" onClick={onRun}>
          Re-run
        </Button>
      </CardFooter>
    </Card>
  );
}

export { QueryHistoryCard };
