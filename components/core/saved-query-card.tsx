"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  EllipsisVertical,
  FileText,
  Hamburger,
  HamburgerIcon,
} from "lucide-react";
import { SavedQuery } from "@/app/mock-data/mock-save-query";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

function SavedQueryCard({
  query,
  selected,
  onSelect,
  onRun,
}: {
  query: SavedQuery;
  selected: boolean;
  onSelect: () => void;
  onRun: () => void;
}) {
  return (
    <Card key={query.id} className={cn("font-poppins ml-4 mb-4")}>
      <CardHeader className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 " />
          <CardTitle className="tracking-tighter text-md truncate">
            {query.name}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          className="h-4 w-4 hover:border-border rounded-sm"
        >
          <EllipsisVertical className={cn("text-muted-foreground")} />
        </Button>
      </CardHeader>
      <CardContent className="py-0">
        <p className="truncate text-xs text-muted-foreground tracking-wide">
          {query.query}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pb-2">
        <span className="text-muted-foreground/50 text-sm ">
          {query.createdAt}
        </span>
        <Button
          className="rounded-sm"
          onClick={(e) => {
            e.stopPropagation();
            // run query
          }}
        >
          Run
        </Button>
      </CardFooter>
    </Card>
  );
}

export { SavedQueryCard };
