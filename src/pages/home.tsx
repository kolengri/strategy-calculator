import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategyStore } from "@/stores/strategy";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StrategyForm } from "@/components/features/strategy-form";
import { CapitalGrowthTable } from "@/components/features/capital-growth-table";
import { StrategiesGrowthChart } from "@/components/features/strategies-growth-chart";
import { useEffect, useState } from "react";

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
      <div className="mb-8">
        <StrategiesGrowthChart />
      </div>
      <Tabs
        defaultValue={activeStrategyId}
        onValueChange={setActiveStrategyId}
        value={activeStrategyId}
      >
        <div className="flex flex-col sm:flex-row gap-4 w-full items-center">
          <TabsList className="flex-1 min-w-0 bg-muted/30 backdrop-blur-sm border border-border/50 shadow-lg">
            <ScrollArea className="w-full">
              <div className="w-max flex gap-2">
                {strategies.map((strategy) => (
                  <TabsTrigger
                    key={strategy.id}
                    value={strategy.id}
                    className="group relative transition-all duration-300"
                  >
                    <span className="pr-1 font-medium">{strategy.name}</span>
                    <Button
                      className="size-5 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1 hover:bg-destructive/10 hover:text-destructive"
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStrategy(strategy.id);
                      }}
                    >
                      <XIcon className="size-3" />
                    </Button>
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>

          <Button
            variant="outline"
            onClick={newBlankStrategy}
            className="shrink-0 font-semibold"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">{t("home.addStrategy")}</span>
            <span className="sm:hidden">
              {t("home.addStrategy").split(" ")[0]}
            </span>
          </Button>
        </div>
        {strategies.map((strategy) => (
          <TabsContent
            key={strategy.id}
            value={strategy.id}
            className="mt-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
          >
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 animate-pulse" />
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {strategy.name}
                </h2>
              </div>
              <StrategyForm defaultValues={strategy} />
              <CapitalGrowthTable strategy={strategy} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </BaseLayout>
  );
}
