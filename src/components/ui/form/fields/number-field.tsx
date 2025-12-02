import { useId } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form";

export type NumberFieldProps = {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
} & FieldWrapperComponentProps &
  Omit<React.ComponentProps<"input">, "prefix" | "suffix" | "type">;

export const NumberField = ({
  label,
  hint,
  required,
  loading,
  prefix,
  suffix,
  deleteOnUnmount = false,
  ...props
}: NumberFieldProps) => {
  const id = useId();
  const field = useFieldContext<number>();

  return (
    <FieldWrapper
      field={field}
      label={label}
      hint={hint}
      required={required}
      id={id}
      loading={loading}
      deleteOnUnmount={deleteOnUnmount}
    >
      {prefix}
      <Input
        id={id}
        type="number"
        value={field.state.value ?? null}
        required={required}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        {...props}
      />
      {suffix}
    </FieldWrapper>
  );
};
export default NumberField;
