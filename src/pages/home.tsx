import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategyStore } from "@/stores/strategy";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StrategyForm } from "@/components/features/strategy-form";
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
      <Tabs
        defaultValue={activeStrategyId}
        onValueChange={setActiveStrategyId}
        value={activeStrategyId}
      >
        <div className="flex flex-row gap-4 w-full">
          <TabsList className="flex-1 min-w-0">
            <ScrollArea className="w-full">
              <div className="w-max">
                {strategies.map((strategy) => (
                  <TabsTrigger key={strategy.id} value={strategy.id}>
                    {strategy.name}
                    <Button
                      className="size-6"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeStrategy(strategy.id);
                      }}
                    >
                      <XIcon
                        className="size-4"
                        onClick={() => {
                          removeStrategy(strategy.id);
                        }}
                      />
                    </Button>
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>

          <Button variant="outline" onClick={newBlankStrategy}>
            <PlusIcon className="size-4" />
            {t("home.addStrategy")}
          </Button>
        </div>
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id}>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">{strategy.name}</h2>
              <StrategyForm defaultValues={strategy} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </BaseLayout>
  );
}
