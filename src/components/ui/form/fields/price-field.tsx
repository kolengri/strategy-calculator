"use client";
import { NumberFieldProps, NumberField } from "./number-field";
import { productTypeEnum } from "@/db/schema";
import { DataTable } from "@/components/feature/data-table";
import { useFieldContext } from "../form";
import { formatCurrency } from "@/utils/format/currency";
import { useTranslations } from "next-intl";
import { Label } from "../../label";
import { useRentalPrices } from "@/hooks/use-rental-prices";

export type PriceFieldProps = NumberFieldProps & {
  type?: (typeof productTypeEnum.enumValues)[number];
};

export const PriceField = (props: PriceFieldProps) => {
  const { type, ...numberFieldProps } = props;
  const t = useTranslations("components.ui.form.fields.price-field");
  const field = useFieldContext<number>();
  const rentalPrices = useRentalPrices(field.state.value ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <NumberField {...numberFieldProps} />

      {["rent", "both"].includes(type ?? "") && (
        <div className="space-y-2">
          <Label>{t("rental-prices")}</Label>
          <DataTable
            data={rentalPrices.data ?? []}
            columns={[
              { header: t("days"), accessorKey: "days" },
              {
                header: t("percentage"),
                accessorKey: "percentage",
                cell: ({ row }) => `${row.original.percentage}%`,
              },
              {
                header: t("price"),
                accessorKey: "price",
                cell: ({ row }) => formatCurrency(row.original.price),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default PriceField;
