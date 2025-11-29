import { Switch } from "@/components/ui/switch";
import { useId } from "react";
import { useFieldContext } from "../form";
import { FieldWrapper } from "./field-wrapper";
import { FieldWrapperComponentProps } from "./field-wrapper";

export type SwitchFieldProps = {} & FieldWrapperComponentProps;

const SwitchField = ({
  label,
  required,
  loading,
  horizontal = true,
  labelAfter = true,
}: FieldWrapperComponentProps) => {
  const id = useId();
  const field = useFieldContext<boolean>();

  return (
    <FieldWrapper
      field={field}
      label={label}
      required={required}
      id={id}
      loading={loading}
      horizontal={horizontal}
      labelAfter={labelAfter}
    >
      <Switch
        id={id}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
    </FieldWrapper>
  );
};

export default SwitchField;
