import { useId } from "react";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { useFieldContext } from "../form";
import { Textarea } from "../../textarea";

export type TextareaFieldProps = {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
} & FieldWrapperComponentProps &
  Omit<React.ComponentProps<"textarea">, "prefix" | "suffix">;

export const TextareaField = ({
  label,
  required,
  loading,
  prefix,
  suffix,
  ...props
}: TextareaFieldProps) => {
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
      <Textarea
        id={id}
        required={required}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value ?? ""}
        {...props}
      />
      {suffix}
    </FieldWrapper>
  );
};

export default TextareaField;
