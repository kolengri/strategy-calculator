import type { Strategy } from "@/stores/strategy";
import { Form, useAppForm } from "../ui/form";
import { STRATEGY_TYPES, useStrategyStore } from "@/stores/strategy";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FUNDS } from "@/db/funds";

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

  return (
    <Form form={form}>
      <div className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("components.features.strategy-form.sections.basic")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label={t("components.features.strategy-form.fields.name")}
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="type">
              {(field) => (
                <field.FancyRadioButton
                  label={t("components.features.strategy-form.fields.type")}
                  options={STRATEGY_TYPES.map((type) => ({
                    label: t(`components.features.strategy-form.type.${type}`),
                    value: type,
                  }))}
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="currentAge">
              {(field) => (
                <field.NumberField
                  label={t(
                    "components.features.strategy-form.fields.currentAge"
                  )}
                  required
                  min={0}
                  max={120}
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Financial Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("components.features.strategy-form.sections.financial")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="initialAmount">
              {(field) => (
                <field.NumberField
                  label={t(
                    "components.features.strategy-form.fields.initialAmount"
                  )}
                  required
                  min={0}
                  step={1000}
                  placeholder="0"
                />
              )}
            </form.AppField>

            <form.AppField name="monthlyContribution">
              {(field) => (
                <field.NumberField
                  label={t(
                    "components.features.strategy-form.fields.monthlyContribution"
                  )}
                  required
                  min={0}
                  step={100}
                  placeholder="0"
                />
              )}
            </form.AppField>

            <form.AppField name="selectedFund">
              {(field) => (
                <field.SelectField
                  label={t(
                    "components.features.strategy-form.fields.selectedFund"
                  )}
                  options={FUNDS.map((fund) => ({
                    label: `${fund.name} (${(fund.yearlyReturn * 100).toFixed(
                      1
                    )}% годовых)`,
                    value: fund.id,
                  }))}
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="inflationRate">
              {(field) => (
                <field.NumberField
                  label={t(
                    "components.features.strategy-form.fields.inflationRate"
                  )}
                  required
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="3.0"
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        {/* Goal Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("components.features.strategy-form.sections.goal")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategyType === "age-based" && (
              <form.AppField name="goalAge">
                {(field) => (
                  <field.NumberField
                    label={t(
                      "components.features.strategy-form.fields.goalAge"
                    )}
                    required
                    min={0}
                    max={120}
                    placeholder="65"
                    deleteOnUnmount
                  />
                )}
              </form.AppField>
            )}

            {strategyType === "goal-based" && (
              <form.AppField name="goal">
                {(field) => (
                  <field.NumberField
                    label={t("components.features.strategy-form.fields.goal")}
                    required
                    min={0}
                    step={1000}
                    placeholder="0"
                    deleteOnUnmount
                  />
                )}
              </form.AppField>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <form.SubmitButton>
            {t("components.features.strategy-form.submit-button.save")}
          </form.SubmitButton>
        </div>
      </div>
    </Form>
  );
};
