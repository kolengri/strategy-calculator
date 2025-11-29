"use client";

import { useId } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

export type OptionsArrayFieldProps = FieldWrapperComponentProps;

type OptionsArrayFieldComponentProps = {
  field: {
    state: {
      value: string[] | null | undefined;
    };
    handleChange: (value: string[]) => void;
  };
} & OptionsArrayFieldProps;

const OptionsArrayFieldComponent = ({
  field,
  label,
  required,
  loading,
}: OptionsArrayFieldComponentProps) => {
  const id = useId();

  const options = field.state.value || [];

  const handleAddOption = () => {
    field.handleChange([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    field.handleChange(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    field.handleChange(newOptions);
  };

  return (
    <FieldWrapper
      field={field as never}
      label={label}
      required={required}
      id={id}
      loading={loading}
    >
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder="Option value"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveOption(index)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddOption}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>
    </FieldWrapper>
  );
};

export const OptionsArrayField = OptionsArrayFieldComponent;
export default OptionsArrayField;
