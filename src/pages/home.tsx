import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";
import {
  TableTriggerLikeButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useStrategyStore } from "@/stores/strategy";
import { PlusIcon, TrashIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";

export function Home() {
  const { t } = useTranslation();
  const { strategies, addStrategy, removeStrategy } = useStrategyStore();

  return (
    <BaseLayout>
      <title>{t("app.title", { title: t("home.title") })}</title>
      <div className="flex justify-center items-center gap-8 mb-8">
        <Tabs defaultValue={strategies.at(0)?.id ?? ""}>
          <TabsList>
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
            <TableTriggerLikeButton
              variant="outline"
              onClick={() => {
                addStrategy({
                  id: uuidv4(),
                  name: t("home.newStrategy") + " " + (strategies.length + 1),
                  createdAt: new Date(),
                  type: "age-based",
                  age: 30,
                });
              }}
            >
              <PlusIcon className="size-4" />
              {t("home.addStrategy")}
            </TableTriggerLikeButton>
          </TabsList>
          {strategies.map((strategy) => (
            <TabsContent key={strategy.id} value={strategy.id}>
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold">{strategy.name}</h2>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </BaseLayout>
  );
}
