import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategyStore } from "@/stores/strategy";
import { PlusIcon, TrashIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { findNextName } from "@/utils/find-next-name";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function Home() {
  const { t } = useTranslation();
  const { strategies, addStrategy, removeStrategy } = useStrategyStore();

  return (
    <BaseLayout>
      <title>{t("app.title", { title: t("home.title") })}</title>
      <Tabs defaultValue={strategies.at(0)?.id ?? ""}>
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
                      <TrashIcon
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

          <Button
            variant="outline"
            onClick={() => {
              addStrategy({
                id: uuidv4(),
                name: findNextName(
                  strategies.map((strategy) => strategy.name),
                  t("home.newStrategy")
                ),
                createdAt: new Date(),
                type: "age-based",
                age: 30,
              });
            }}
          >
            <PlusIcon className="size-4" />
            {t("home.addStrategy")}
          </Button>
        </div>
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id}>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">{strategy.name}</h2>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </BaseLayout>
  );
}
