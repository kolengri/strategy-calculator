import { useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import type { LifeEvent } from "@/stores/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, useAppForm } from "@/components/ui/form";
import { Hint } from "@/components/ui/hint";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { PlusIcon, Trash2Icon, CalendarIcon } from "lucide-react";

type LifeEventsEditorProps = {
  events: LifeEvent[];
  onChange: (events: LifeEvent[]) => void;
  currentAge: number;
  goalAge: number;
};

export const LifeEventsEditor = ({
  events,
  onChange,
  currentAge,
  goalAge,
}: LifeEventsEditorProps) => {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const [isAdding, setIsAdding] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: "",
      age: currentAge + 5,
      amount: 0,
    },
    onSubmit: (values) => {
      const { name, age, amount } = values.value;

      if (!name || !amount || !age) {
        return;
      }

      const event: LifeEvent = {
        id: uuidv4(),
        name,
        age,
        amount,
      };

      onChange([...events, event]);
      setIsAdding(false);
      form.reset();
    },
  });

  const handleRemoveEvent = (id: string) => {
    onChange(events.filter((e) => e.id !== id));
  };

  const handleCancel = () => {
    setIsAdding(false);
    form.reset();
  };

  const sortedEvents = [...events].sort((a, b) => a.age - b.age);
  const totalWithdrawals = events.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {t("components.features.life-events.title")}
            <Hint
              hint={t("components.features.life-events.description")}
              iconClassName="size-4 text-muted-foreground"
            />
          </span>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <PlusIcon className="size-4" />
              {t("components.features.life-events.addEvent")}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {events.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {t("components.features.life-events.totalWithdrawals")}
            </p>
            <p className="text-lg font-semibold text-amber-600">
              {formatCurrency(totalWithdrawals)}
            </p>
          </div>
        )}

        {/* Event list */}
        {sortedEvents.length > 0 && (
          <div className="space-y-2">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <CalendarIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("components.features.life-events.atAge", {
                      age: event.age,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600 text-sm">
                    -{formatCurrency(event.amount)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveEvent(event.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && !isAdding && (
          <div className="text-center py-6 text-muted-foreground">
            <CalendarIcon className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {t("components.features.life-events.empty")}
            </p>
          </div>
        )}

        {/* Add new event form */}
        {isAdding && (
          <Form form={form}>
            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label={t("components.features.life-events.fields.name")}
                        placeholder={t(
                          "components.features.life-events.namePlaceholder"
                        )}
                        required
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="age">
                  {(field) => (
                    <field.NumberField
                      label={t("components.features.life-events.fields.age")}
                      min={currentAge}
                      max={goalAge}
                      required
                    />
                  )}
                </form.AppField>

                <form.AppField name="amount">
                  {(field) => (
                    <field.NumberField
                      label={t("components.features.life-events.fields.amount")}
                      min={0}
                      step={10000}
                      placeholder="1000000"
                      required
                    />
                  )}
                </form.AppField>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  {t("components.features.life-events.cancel")}
                </Button>
                <form.SubmitButton size="sm">
                  {t("components.features.life-events.add")}
                </form.SubmitButton>
              </div>
            </div>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
