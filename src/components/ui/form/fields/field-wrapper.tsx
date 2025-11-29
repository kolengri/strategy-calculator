import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type AnyFieldApi } from "@tanstack/react-form";
import { isEmptyArray } from "is-what";
import { useEffect } from "react";

type FieldWrapperProps = {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  loading?: boolean;
  id: string;
  deleteOnUnmount?: boolean;
  field: AnyFieldApi;
  className?: string;
  horizontal?: boolean;
  labelAfter?: boolean;
};

export type FieldWrapperComponentProps = Omit<
  FieldWrapperProps,
  "id" | "children" | "field"
>;

export const FieldWrapper = ({
  children,
  label,
  required,
  id,
  field,
  className,
  labelAfter = false,
  horizontal = false,
  deleteOnUnmount = false,
}: FieldWrapperProps) => {
  const { state, form } = field;
  const hasError =
    (state.meta.isBlurred || form.state.isSubmitted || form.state.isPristine) &&
    !isEmptyArray(state.meta.errors);

  const errors = hasError ? state.meta.errors.map((e) => e.message) : null;

  const labelElement = label && (
    <Label htmlFor={id} className="text-xs font-light flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
  );

  useEffect(() => {
    return () => {
      if (deleteOnUnmount) {
        field.setValue(undefined);
      }
    };
  }, [deleteOnUnmount, field]);

  return (
    <div className={cn("space-y-1", className)}>
      <div
        className={cn("flex flex-col gap-1", {
          "flex items-center gap-1 flex-row": horizontal,
        })}
      >
        {labelAfter ? null : labelElement}
        <div
          className={cn("relative", {
            "flex flex-col items-center": horizontal,
          })}
        >
          {children}
        </div>
        {labelAfter ? labelElement : null}
      </div>
      {errors?.map((e) => (
        <p key={e} className="text-red-500 text-xs">
          {e}
        </p>
      ))}
    </div>
  );
};
