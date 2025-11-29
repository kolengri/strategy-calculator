"use client";

import { useId, useState, useEffect } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { useFieldContext } from "../form";
import { Button, type ButtonProps } from "../../button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

export type FancyCheckboxProps<T extends string> = {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  options: SelectOption<T>[];
  placeholder?: string;
  creatable?: boolean;
  onCreateOption?: (value: string) => SelectOption<T>;
  createOptionPlaceholder?: string;
} & FieldWrapperComponentProps &
  Omit<ButtonProps, "children" | "variant" | "onClick" | "type">;

export const FancyCheckbox = <T extends string>({
  label,
  required,
  loading,
  prefix,
  suffix,
  size = "sm",
  options = [],
  creatable = false,
  onCreateOption,
  createOptionPlaceholder = "Enter new option...",
  ...props
}: FancyCheckboxProps<T>) => {
  const id = useId();
  const field = useFieldContext<string[]>();
  const { value: values = [] } = field.state;
  const [newOptionValue, setNewOptionValue] = useState("");
  const [localOptions, setLocalOptions] = useState<SelectOption<T>[]>(options);

  useEffect(() => {
    if (!onCreateOption) {
      setLocalOptions((prev) => {
        const existingValues = new Set(prev.map((opt) => opt.value));
        const newOptionsFromProps = options.filter(
          (opt) => !existingValues.has(opt.value)
        );
        if (newOptionsFromProps.length > 0) {
          return [...prev, ...newOptionsFromProps];
        }
        return prev;
      });
    } else {
      setLocalOptions(options);
    }
  }, [options, onCreateOption]);

  const handleChange = (value: string) => {
    if (values.includes(value)) {
      field.handleChange(values.filter((v) => v !== value));
    } else {
      field.handleChange([...values, value]);
    }
  };

  const handleCreateOption = () => {
    if (!newOptionValue.trim()) return;

    const trimmedValue = newOptionValue.trim();

    if (onCreateOption) {
      const newOption = onCreateOption(trimmedValue);
      handleChange(newOption.value);
    } else {
      const newOption = {
        label: trimmedValue,
        value: trimmedValue as T,
      } as SelectOption<T>;
      setLocalOptions((prev) => {
        if (prev.some((opt) => opt.value === newOption.value)) {
          return prev;
        }
        return [...prev, newOption];
      });
      handleChange(newOption.value);
    }
    setNewOptionValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateOption();
    }
  };

  const allOptions = onCreateOption ? options : localOptions;

  return (
    <FieldWrapper
      field={field}
      label={label}
      required={required}
      id={id}
      loading={loading}
    >
      {prefix}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {allOptions.map((option) => (
            <Button
              key={option.value}
              {...props}
              type="button"
              size={size}
              onClick={() => handleChange(option.value)}
              variant={values?.includes(option.value) ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {creatable && (
          <div className="flex gap-2">
            <Input
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={createOptionPlaceholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCreateOption}
              disabled={!newOptionValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {suffix}
    </FieldWrapper>
  );
};
export default FancyCheckbox;
