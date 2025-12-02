import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useStrategyStore, type LifeEvent } from "@/stores/strategy";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StrategyForm } from "@/components/features/strategy-form";
import { CapitalGrowthTable } from "@/components/features/capital-growth-table";
import { StrategiesGrowthChart } from "@/components/features/strategies-growth-chart";
import { DelayCostInfo } from "@/components/features/delay-cost-info";
import { StrategySummary } from "@/components/features/strategy-summary";
import { WhatIfScenarios } from "@/components/features/what-if-scenarios";
import { SortableStrategyTabs } from "@/components/features/sortable-strategy-tabs";
import { LifeEventsEditor } from "@/components/features/life-events-editor";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useEffect, useState, useRef, useCallback } from "react";

export function Home() {
  const { t } = useTranslation();
  const {
    strategies,
    removeStrategy,
    newBlankStrategy,
    reorderStrategies,
    updateStrategy,
  } = useStrategyStore();
  const [activeStrategyId, setActiveStrategyId] = useState<string | undefined>(
    strategies.at(0)?.id
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setActiveStrategyId(strategies.at(-1)?.id);
  }, [strategies]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      // Trigger form submission
      formRef.current?.requestSubmit();
    },
    onNew: () => {
      newBlankStrategy();
    },
  });

  const handleLifeEventsChange = useCallback(
    (strategyId: string, events: LifeEvent[]) => {
      const strategy = strategies.find((s) => s.id === strategyId);
      if (strategy) {
        updateStrategy({ ...strategy, lifeEvents: events });
      }
    },
    [strategies, updateStrategy]
  );

  return (
    <BaseLayout>
      <title>{t("app.title", { title: t("home.title") })}</title>
      <div className="mb-5">
        <StrategiesGrowthChart />
      </div>
      <Tabs
        defaultValue={activeStrategyId}
        onValueChange={setActiveStrategyId}
        value={activeStrategyId}
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
          <TabsList className="flex-1 min-w-0">
            <ScrollArea className="w-full">
              <SortableStrategyTabs
                strategies={strategies}
                onReorder={reorderStrategies}
                onRemove={removeStrategy}
              />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            onClick={newBlankStrategy}
            className="shrink-0"
            title={t("home.shortcuts.new")}
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">{t("home.addStrategy")}</span>
          </Button>
        </div>
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-5">
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {strategy.name}
              </h2>
              <StrategyForm defaultValues={strategy} formRef={formRef} />
              <LifeEventsEditor
                events={strategy.lifeEvents ?? []}
                onChange={(events) => handleLifeEventsChange(strategy.id, events)}
                currentAge={strategy.currentAge}
                goalAge={strategy.goalAge}
              />
              <StrategySummary strategy={strategy} />
              <WhatIfScenarios strategy={strategy} />
              <DelayCostInfo strategy={strategy} />
              <CapitalGrowthTable strategy={strategy} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </BaseLayout>
  );
}
