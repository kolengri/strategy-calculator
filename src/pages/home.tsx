import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategyStore, type Strategy } from "@/stores/strategy";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StrategyForm } from "@/components/features/strategy-form";
import { CapitalGrowthTable } from "@/components/features/capital-growth-table";
import { StrategiesGrowthChart } from "@/components/features/strategies-growth-chart";
import { DelayCostInfo } from "@/components/features/delay-cost-info";
import { StrategySummary } from "@/components/features/strategy-summary";
import { useEffect, useState } from "react";
import { isOnlyOneElement } from "@/utils/type-guards/is-only-one-element";

export function Home() {
  const { t } = useTranslation();
  const { strategies, removeStrategy, newBlankStrategy } = useStrategyStore();
  const [activeStrategyId, setActiveStrategyId] = useState<string | undefined>(
    strategies.at(0)?.id
  );

  useEffect(() => {
    setActiveStrategyId(strategies.at(-1)?.id);
  }, [strategies]);

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
              <div className="w-max flex gap-1">
                {strategies.map((strategy) => (
                  <TabsTrigger
                    key={strategy.id}
                    value={strategy.id}
                    className="group relative"
                  >
                    <span className="pr-1 text-sm">{strategy.name}</span>
                    {!isOnlyOneElement(strategies) && (
                      <Button
                        className="size-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-destructive/10 hover:text-destructive"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStrategy(strategy.id);
                        }}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            onClick={newBlankStrategy}
            className="shrink-0"
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
              <StrategyForm defaultValues={strategy} />
              <StrategySummary strategy={strategy} />
              <DelayCostInfo strategy={strategy} />
              <CapitalGrowthTable strategy={strategy} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </BaseLayout>
  );
}
