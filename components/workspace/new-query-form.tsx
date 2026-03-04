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

function NewQueryForm({
  triggerLabel,
  isOpen,
  openChange,
}: {
  triggerLabel: string;
  isOpen: boolean;
  openChange: (open: boolean) => void;
}) {
  const [queryName, setQueryName] = useState("");
  return (
    <Dialog open={isOpen} onOpenChange={openChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: "default" }))}>
        <Plus /> {triggerLabel}
      </DialogTrigger>
      <DialogContent className="font-poppins rounded-t-xl px-0 sm:max-w-max md:rounded-2xl">
        <DialogHeader className="px-6 pt-6 text-left border-b">
          <DialogTitle className="flex gap-4 items-center">
            New Query
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base px-10">
            Save your queries for future use.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4 max-h-[50vh]">
          <Form>
            <Field className="gap-4">
              <FieldLabel className="tracking-wider">Query Name</FieldLabel>
              <Input
                onChange={(e) => setQueryName(e.target.value)}
                value={queryName}
                name="queryName"
                type="text"
                placeholder="Enter Query Name"
                required
                className="py-2"
              />
              <FieldError>Please enter query name.</FieldError>
            </Field>

            <Field className="gap-4">
              <FieldLabel className="tracking-wider">Query</FieldLabel>
            </Field>
          </Form>
        </div>
        <DialogFooter className="flex">
          <Button
            variant="outline"
            onClick={handleSaveQuery}
            disabled={isSaving}
            type="button"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { NewQueryForm };
