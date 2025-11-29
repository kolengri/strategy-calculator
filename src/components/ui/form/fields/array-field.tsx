import { type AnyFieldApi, type AnyFormApi } from "@tanstack/react-form";
import { type ArrayKeys } from "@/types/ArrayKeys";
import { type AnyReactFormExtendedApi } from "@/types/form/AnyReactFormExtendedApi";
import { FieldWrapper, type FieldWrapperComponentProps } from "./field-wrapper";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type ArrayFieldProps<
  T extends AnyFormApi,
  Keys extends ArrayKeys<T["state"]["values"]>
> = {
  form: T;
  name: Keys;
  children: (field: AnyFieldApi, index: number) => React.ReactNode;
  className?: string;
  readonly?: boolean;
} & FieldWrapperComponentProps;

export const ArrayField = <
  T extends AnyFormApi,
  Keys extends ArrayKeys<T["state"]["values"]>
>(
  props: ArrayFieldProps<T, Keys>
) => {
  const {
    form: anyForm,
    name,
    children,
    label,
    readonly = false,
    required,
    loading,
  } = props;
  const id = useId();

  // Need to cast to AnyReactFormExtendedApi because the type of form is not known
  const form = anyForm as unknown as AnyReactFormExtendedApi;
  const { t } = useTranslation();

  return (
    <form.Field name={name as string} mode="array">
      {(field) => {
        return (
          <FieldWrapper
            field={field}
            label={label}
            required={required}
            id={id}
            loading={loading}
          >
            <div className="flex flex-col">
              {field.state.value.map((_: never, index: number) => (
                <div key={index}>
                  {!readonly && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => field.removeValue(index)}
                      >
                        {t("components.ui.form.fields.array-field.remove")}
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">{children(field, index)}</div>
                  <hr className="w-full my-6" />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => field.pushValue({})}
                disabled={readonly}
              >
                {t("components.ui.form.fields.array-field.add")}
              </Button>
            </div>
          </FieldWrapper>
        );
      }}
    </form.Field>
  );
};
