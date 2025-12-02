import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useStrategyStore, type Strategy } from "@/stores/strategy";
import {
  strategiesToJSON,
  parseStrategiesJSON,
  downloadFile,
} from "@/utils/export-csv";
import { Download, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export function StrategyImportExport() {
  const { t } = useTranslation();
  const { strategies, addStrategy } = useStrategyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = strategiesToJSON(strategies);
    const filename = `strategies-${
      new Date().toISOString().split("T")[0]
    }.json`;
    downloadFile(json, filename, "application/json;charset=utf-8;");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseStrategiesJSON(content);

      if (parsed && parsed.strategies.length > 0) {
        parsed.strategies.forEach((strategyData) => {
          const newStrategy: Strategy = {
            ...strategyData,
            id: uuidv4(),
            createdAt: new Date(),
          } as Strategy;
          addStrategy(newStrategy);
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleImportClick}
        title={t("components.features.import-export.import")}
      >
        <Upload className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleExport}
        title={t("components.features.import-export.export")}
      >
        <Download className="size-4" />
      </Button>
    </div>
  );
}
