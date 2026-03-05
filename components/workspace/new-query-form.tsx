"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Form } from "../ui/form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { toastManager } from "../ui/toast";
import { useConnectionStore } from "@/store/useConnectionStore";
import { saveQuery } from "@/app/api/actions/database-actions";

function NewQueryForm({
  triggerLabel,
  isOpen,
  openChange,
  onQuerySaved,
}: {
  triggerLabel: string;
  isOpen: boolean;
  openChange: (open: boolean) => void;
  onQuerySaved?: () => void;
}) {
  const [queryName, setQueryName] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { dbMetadata } = useConnectionStore();
  const dbType = dbMetadata?.type || "postgresql";

  const handleSaveQuery = async () => {
    if (!queryName.trim()) {
      toastManager.add({
        title: "Validation Error",
        type: "error",
        description: "Please enter a query name",
      });
      return;
    }

    if (!sqlQuery.trim()) {
      toastManager.add({
        title: "Validation Error",
        type: "error",
        description: "Please enter a SQL query",
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveQuery(queryName, sqlQuery, dbType);

      if (result.success) {
        toastManager.add({
          title: "Query Saved",
          type: "success",
          description: `${queryName} has been saved`,
        });

        // Reset form
        setQueryName("");
        setSqlQuery("");

        openChange(false);

        if (onQuerySaved) {
          onQuerySaved();
        }
      } else {
        toastManager.add({
          title: "Save Failed",
          type: "error",
          description: result.error || "Failed to save query",
        });
      }
    } catch (error: any) {
      toastManager.add({
        title: "Error",
        type: "error",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={openChange}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "default" }), "w-full")}
      >
        <Plus /> {triggerLabel}
      </DialogTrigger>
      <DialogContent className="font-poppins rounded-t-xl px-0 sm:max-w-max md:rounded-2xl">
        <DialogHeader className="px-6 pt-6 text-left border-b">
          <DialogTitle className="flex items-start gap-4">
            New Query
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Save your queries for future use.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4 max-h-[60vh] overflow-y-auto">
          <Form>
            <Field className="gap-4 mb-4">
              <FieldLabel className="tracking-wider">Query Name</FieldLabel>
              <Input
                onChange={(e) => setQueryName(e.target.value)}
                value={queryName}
                name="queryName"
                type="text"
                placeholder="e.g., Get Active Users"
                required
                className="py-2"
              />
              <FieldError>Please enter query name.</FieldError>
            </Field>

            <Field className="gap-4">
              <FieldLabel className="tracking-wider">SQL Query</FieldLabel>
              <Textarea
                name="sqlQuery"
                placeholder="SELECT * FROM users WHERE active = true"
                className="min-h-[200ox] font-mono text-sm"
              />
              <FieldError>Please enter your SQL query.</FieldError>
            </Field>
          </Form>
        </div>

        <DialogFooter className="flex">
          <Button
            variant="outline"
            onClick={() => openChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveQuery}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Query"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { NewQueryForm };
