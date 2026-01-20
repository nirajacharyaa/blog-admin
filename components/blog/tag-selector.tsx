"use client";

import { CheckIcon, ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Tag } from "@/schema/blog";

interface TagSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: number) => void;
  onCreateTag: (name: string) => void;
  isCreating: boolean;
  className?: string;
}

export function TagSelector({
  selectedTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  isCreating,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = (tag: Tag) => {
    onAddTag(tag);
    setOpen(false);
    setInputValue("");
  };

  const handleCreate = () => {
    if (inputValue.trim()) {
      onCreateTag(inputValue.trim());
      setOpen(false);
      setInputValue("");
    }
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="gap-1 pr-1.5">
            {tag.name}
            <button
              type="button"
              onClick={() => onRemoveTag(tag.id)}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive group transition-colors"
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTags.length > 0
              ? "Add more tags..."
              : "Select or create tags..."}
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty className="py-2 px-2 text-sm">
                {inputValue.trim() ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-xs text-center">
                      No matching tags.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start h-8"
                      onClick={handleCreate}
                      disabled={isCreating}
                    >
                      <PlusIcon className="mr-2 size-3" />
                      Create "{inputValue}"
                    </Button>
                  </div>
                ) : (
                  "No tags found."
                )}
              </CommandEmpty>

              {filteredTags.length > 0 && (
                <CommandGroup heading="Available Tags">
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag)}
                    >
                      <span className="mr-2 flex items-center justify-center w-4">
                        {selectedTags.find((t) => t.id === tag.id) && (
                          <CheckIcon className="size-4" />
                        )}
                      </span>
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
