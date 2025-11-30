import type { Strategy } from "@/stores/strategy";
import { Form, useAppForm } from "../ui/form";
import { STRATEGY_TYPES, useStrategyStore } from "@/stores/strategy";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";

type StrategyFormProps = {
  defaultValues: Strategy;
};

export const StrategyForm = ({ defaultValues }: StrategyFormProps) => {
  const { t } = useTranslation();
  const { updateStrategy } = useStrategyStore();
  const form = useAppForm({
    defaultValues,
    onSubmit: (values) => {
      updateStrategy(values.value);
    },
  });

  const strategyType = useStore(form.store, (state) => state.values.type);
  const values = useStore(form.store, (state) => state.values);

  return (
    <Form form={form}>
      {JSON.stringify(values)}
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>

      <form.AppField name="type">
        {(field) => (
          <field.FancyRadioButton
            options={STRATEGY_TYPES.map((type) => ({
              label: t(`components.features.strategy-form.type.${type}`),
              value: type,
            }))}
          />
        )}
      </form.AppField>

      <form.AppField name="currentAge">
        {(field) => <field.NumberField label="Current Age" />}
      </form.AppField>

      {strategyType === "age-based" && (
        <form.AppField name="goalAge">
          {(field) => <field.NumberField label="Goal Age" deleteOnUnmount />}
        </form.AppField>
      )}

      {strategyType === "goal-based" && (
        <form.AppField name="goal">
          {(field) => <field.NumberField label="Goal" deleteOnUnmount />}
        </form.AppField>
      )}

      <form.SubmitButton>
        {t("components.features.strategy-form.submit-button.save")}
      </form.SubmitButton>
    </Form>
  );
};
