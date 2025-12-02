import { useMemo } from "react";
import type { Strategy } from "@/stores/strategy";
import { Form, useAppForm } from "../ui/form";
import { STRATEGY_TYPES, useStrategyStore } from "@/stores/strategy";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FUNDS } from "@/db/funds";
import { useCurrencyStore } from "@/stores/currency";
import { formatCurrency } from "@/utils/currencies";
import { calculateGoalBasedMonthlyContribution } from "@/utils/calculate-capital-growth";

type StrategyFormProps = {
  defaultValues: Strategy;
};

export const StrategyForm = ({ defaultValues }: StrategyFormProps) => {
  const { t } = useTranslation();
  const { updateStrategy } = useStrategyStore();
  const { currency } = useCurrencyStore();
  const form = useAppForm({
    defaultValues,
    onSubmit: (values) => {
      const submittedStrategy = values.value;

      if (submittedStrategy.type === "goal-based") {
        const selectedFund = FUNDS.find(
          (fund) => fund.id === submittedStrategy.selectedFund
        );

        if (selectedFund) {
          const calculatedContribution = calculateGoalBasedMonthlyContribution(
            submittedStrategy.goal,
            submittedStrategy.initialAmount,
            submittedStrategy.currentAge,
            selectedFund.yearlyReturn,
            submittedStrategy.taxRate / 100,
            submittedStrategy.inflationRate
          );

          updateStrategy({
            ...submittedStrategy,
            monthlyContribution: calculatedContribution,
          });
          return;
        }
      }

      updateStrategy(submittedStrategy);
    },
  });

  const formValues = useStore(form.store, (state) => state.values);
  const isGoalBased = formValues.type === "goal-based";
  const selectedFund = useMemo(
    () => FUNDS.find((fund) => fund.id === formValues.selectedFund),
    [formValues.selectedFund]
  );
  const calculatedGoalContribution = useMemo(() => {
    if (
      !isGoalBased ||
      !selectedFund ||
      !formValues.goal ||
      formValues.goal <= 0 ||
      !formValues.currentAge ||
      formValues.currentAge <= 0
    ) {
      return 0;
    }

    return calculateGoalBasedMonthlyContribution(
      formValues.goal,
      formValues.initialAmount ?? 0,
      formValues.currentAge,
      selectedFund.yearlyReturn,
      (formValues.taxRate ?? 0) / 100,
      formValues.inflationRate ?? 0
    );
  }, [
    formValues.currentAge,
    formValues.goal,
    formValues.inflationRate,
    formValues.initialAmount,
    formValues.taxRate,
    isGoalBased,
    selectedFund,
  ]);
  const hasGoalContribution = calculatedGoalContribution > 0;

  return (
    <Form form={form}>
      <div className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
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

            <div className="grid grid-cols-2 gap-3">
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

              {!isGoalBased && (
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
                    />
                  )}
                </form.AppField>
              )}

              {isGoalBased && (
                <form.AppField name="goal">
                  {(field) => (
                    <field.NumberField
                      label={t("components.features.strategy-form.fields.goal")}
                      required
                      min={0}
                      step={1000}
                      placeholder="0"
                    />
                  )}
                </form.AppField>
              )}
            </div>

            {isGoalBased && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {t(
                    "components.features.strategy-form.goalBasedSummary.title"
                  )}
                </p>
                <p className="text-2xl font-semibold">
                  {hasGoalContribution
                    ? formatCurrency(calculatedGoalContribution, currency)
                    : t(
                        "components.features.strategy-form.goalBasedSummary.placeholder"
                      )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "components.features.strategy-form.goalBasedSummary.description"
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Details Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              {t("components.features.strategy-form.sections.financial")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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

              {!isGoalBased && (
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
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
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
              <form.AppField name="taxRate">
                {(field) => (
                  <field.NumberField
                    label={t(
                      "components.features.strategy-form.fields.taxRate"
                    )}
                    required
                    min={0}
                    max={100}
                  />
                )}
              </form.AppField>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <form.SubmitButton className="min-w-[140px] shadow-lg hover:shadow-xl">
            {t("components.features.strategy-form.submit-button.save")}
          </form.SubmitButton>
        </div>
      </div>
    </Form>
  );
};
