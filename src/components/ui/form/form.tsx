"use client";

import {
  createFormHookContexts,
  createFormHook,
  type AnyFormApi,
} from "@tanstack/react-form";

import { lazy } from "react";

const TextareaField = lazy(() => import("./fields/textarea-field"));
const TextField = lazy(() => import("./fields/text-field"));
const DatePickerField = lazy(() => import("./fields/datepicker-field"));
const NumberField = lazy(() => import("./fields/number-field"));
const SelectField = lazy(() => import("./fields/select-field"));
const ComboboxField = lazy(() => import("./fields/combobox-field"));
const FancyCheckbox = lazy(() => import("./fields/fancy-checkbox"));
const SwitchField = lazy(() => import("./fields/switch-field"));
const SubmitButton = lazy(() => import("./components/submit-button"));

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const fieldComponents = {
  DatePickerField,
  NumberField,
  TextareaField,
  TextField,
  SelectField,
  ComboboxField,
  FancyCheckbox,
  SwitchField,
} as const;

const formComponents = {
  SubmitButton,
} as const;

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents,
  formComponents,
});

export type AppFieldComponent = ReturnType<typeof useAppForm>["AppField"];
export type AppFormComponent = ReturnType<typeof useAppForm>;
export type AppFieldNames = keyof typeof fieldComponents;

type FormProps<Form extends AnyFormApi> = {
  children: React.ReactNode;
  form: Form;
} & Omit<React.ComponentProps<"form">, "onSubmit">;

export const Form = <F extends AnyFormApi>({
  children,
  form: formApi,
  ...props
}: FormProps<F>) => {
  const AppForm = (
    formApi as unknown as AnyFormApi & {
      AppForm: React.ComponentType<{ children: React.ReactNode }>;
    }
  ).AppForm;

  return (
    <form
      id={formApi.formId}
      onSubmit={(e) => {
        e.preventDefault();
        formApi.handleSubmit(e);
      }}
      {...props}
    >
      <AppForm>{children}</AppForm>
    </form>
  );
};
