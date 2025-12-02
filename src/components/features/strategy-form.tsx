import { useMemo, useEffect, type RefObject } from "react";
import type { Strategy } from "@/stores/strategy";
import { Form, useAppForm } from "../ui/form";
import { STRATEGY_TYPES, useStrategyStore } from "@/stores/strategy";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FUNDS, getFundById } from "@/db/funds";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { calculateGoalBasedMonthlyContribution } from "@/utils/calculate-capital-growth";
import { AGE_LIMITS } from "@/utils/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

type StrategyFormProps = {
  defaultValues: Strategy;
  formRef?: RefObject<HTMLFormElement | null>;
};

export const StrategyForm = ({ defaultValues, formRef }: StrategyFormProps) => {
  const { t } = useTranslation();
  const { updateStrategy } = useStrategyStore();
  const formatCurrency = useFormatCurrency();
  const form = useAppForm({
    defaultValues,
    onSubmit: (values) => {
      const submittedStrategy = values.value;

      if (submittedStrategy.type === "goal-based") {
        const selectedFund = getFundById(submittedStrategy.selectedFund);

        if (selectedFund) {
          const calculatedContribution = calculateGoalBasedMonthlyContribution(
            submittedStrategy.goal,
            submittedStrategy.initialAmount,
            submittedStrategy.currentAge,
            submittedStrategy.goalAge,
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
    () => getFundById(formValues.selectedFund),
    [formValues.selectedFund]
  );
  const calculatedGoalContribution = useMemo(() => {
    if (!isGoalBased || !selectedFund || formValues.type !== "goal-based") {
      return 0;
    }

    const goal = formValues.goal;
    const goalAge = formValues.goalAge;
    if (
      !goal ||
      goal <= 0 ||
      !formValues.currentAge ||
      formValues.currentAge <= 0 ||
      !goalAge ||
      goalAge <= formValues.currentAge
    ) {
      return 0;
    }

    return calculateGoalBasedMonthlyContribution(
      goal,
      formValues.initialAmount ?? 0,
      formValues.currentAge,
      goalAge,
      selectedFund.yearlyReturn,
      (formValues.taxRate ?? 0) / 100,
      formValues.inflationRate ?? 0
    );
  }, [formValues, isGoalBased, selectedFund]);
  const hasGoalContribution = calculatedGoalContribution > 0;

  return (
    <Form form={form} formRef={formRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("components.features.strategy-form.sections.basic")}</span>
            <form.SubmitButton size="sm">
              {t("components.features.strategy-form.submit-button.save")}
            </form.SubmitButton>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* First row: Name + Type toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  size="xs"
                />
              )}
            </form.AppField>
          </div>

          {/* Second row: Ages + Goal (if goal-based) */}
          <div className={`grid gap-3 ${isGoalBased ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
            <form.AppField name="currentAge">
              {(field) => (
                <field.NumberField
                  label={t("components.features.strategy-form.fields.currentAge")}
                  required
                  min={AGE_LIMITS.MIN}
                  max={AGE_LIMITS.MAX}
                />
              )}
            </form.AppField>

            <form.AppField name="goalAge">
              {(field) => (
                <field.NumberField
                  label={t("components.features.strategy-form.fields.goalAge")}
                  required
                  min={AGE_LIMITS.MIN}
                  max={AGE_LIMITS.MAX}
                  placeholder="65"
                />
              )}
            </form.AppField>

            <form.AppField name="initialAmount">
              {(field) => (
                <field.NumberField
                  label={t("components.features.strategy-form.fields.initialAmount")}
                  required
                  min={0}
                  step={1000}
                  placeholder="0"
                />
              )}
            </form.AppField>

            {isGoalBased ? (
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
            ) : (
              <form.AppField name="monthlyContribution">
                {(field) => (
                  <field.NumberField
                    label={t("components.features.strategy-form.fields.monthlyContribution")}
                    required
                    min={0}
                    step={100}
                    placeholder="0"
                  />
                )}
              </form.AppField>
            )}
          </div>

          {/* Third row: Financial parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <form.AppField name="selectedFund">
              {(field) => (
                <field.SelectField
                  label={t("components.features.strategy-form.fields.selectedFund")}
                  options={FUNDS.map((fund) => ({
                    label: `${fund.name} (${(fund.yearlyReturn * 100).toFixed(0)}%)`,
                    value: fund.id,
                  }))}
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="inflationRate">
              {(field) => (
                <field.NumberField
                  label={t("components.features.strategy-form.fields.inflationRate")}
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
                  label={t("components.features.strategy-form.fields.taxRate")}
                  required
                  min={0}
                  max={100}
                />
              )}
            </form.AppField>

            {/* Goal-based summary or empty space */}
            {isGoalBased && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 flex flex-col justify-center">
                <p className="text-xs text-muted-foreground">
                  {t("components.features.strategy-form.goalBasedSummary.title")}
                </p>
                <p className="text-lg font-semibold text-primary">
                  {hasGoalContribution
                    ? formatCurrency(calculatedGoalContribution)
                    : "—"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Form>
  );
};
