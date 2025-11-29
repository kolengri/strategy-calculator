"use client";

import { useId, useState, useMemo } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { useFieldContext } from "../form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxOption<T extends string> = {
  label: string;
  value: T;
};

export type ComboboxFieldProps<T extends string> = {
  options?: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
} & FieldWrapperComponentProps;

export const ComboboxField = <T extends string>({
  label,
  required,
  loading,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
}: ComboboxFieldProps<T>) => {
  const id = useId();
  const field = useFieldContext<string>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.value.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === field.state.value),
    [options, field.state.value]
  );

  return (
    <FieldWrapper
      field={field}
      label={label}
      required={required}
      id={id}
      loading={loading}
    >
      <Popover
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <div className="flex flex-col">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      field.handleChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      field.state.value === option.value &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.state.value === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
};

export default ComboboxField;
