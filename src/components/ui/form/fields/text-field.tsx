import { useId } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form";

export type TextFieldProps = {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
} & FieldWrapperComponentProps &
  Omit<React.ComponentProps<"input">, "prefix" | "suffix">;

export const TextField = ({
  label,
  required,
  loading,
  prefix,
  suffix,
  ...props
}: TextFieldProps) => {
  const id = useId();
  const field = useFieldContext<string>();

  return (
    <FieldWrapper
      field={field}
      label={label}
      required={required}
      id={id}
      loading={loading}
    >
      {prefix}
      <Input
        id={id}
        value={field.state.value ?? ""}
        required={required}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      {suffix}
    </FieldWrapper>
  );
};
export default TextField;
