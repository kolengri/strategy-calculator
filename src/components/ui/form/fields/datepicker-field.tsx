import { useId } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { DatePicker, type DatePickerProps } from "@/components/ui/date-picker";
import { useFieldContext } from "../form";
import type { DateRange } from "react-day-picker";

// Single mode field
export type DatePickerFieldProps = FieldWrapperComponentProps &
  Omit<DatePickerProps, "onChange" | "value" | "select">;

export const DatePickerField = ({
  label,
  required,
  loading,
  mode,
  ...props
}: DatePickerFieldProps) => {
  const id = useId();

  // Use unified field context - TypeScript will handle the types appropriately
  const field = useFieldContext<Date | Date[] | DateRange>();

  const handleChange = (value: Date | Date[] | DateRange | undefined) => {
    field.handleChange(value as Date | Date[] | DateRange);
  };

  return (
    <FieldWrapper
      field={field}
      label={label}
      required={required}
      id={id}
      loading={loading}
    >
      <DatePicker
        id={id}
        mode={mode as never}
        value={field.state.value as never}
        onChange={handleChange as never}
        clearButton
        onDayBlur={() => {
          field.handleBlur();
        }}
        {...props}
      />
    </FieldWrapper>
  );
};

export default DatePickerField;
