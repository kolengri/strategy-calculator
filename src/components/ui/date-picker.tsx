"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type DayPickerProps = React.ComponentProps<typeof Calendar>;

export type DatePickerCustomProps = {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  dateFormat?: string;
  clearButton?: boolean;
};

// Base interface with common props
export type DatePickerBaseProps = Omit<
  DayPickerProps,
  "selected" | "onSelect" | "mode"
> &
  DatePickerCustomProps;

// Single mode interface
interface DatePickerSingleProps extends DatePickerBaseProps {
  mode?: "single";
  value?: Date;
  onChange?: (value: Date | undefined) => void;
}

// Multiple mode interface
interface DatePickerMultipleProps extends DatePickerBaseProps {
  mode: "multiple";
  value?: Date[];
  onChange?: (value: Date[] | undefined) => void;
}

// Range mode interface
interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: "range";
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
}

type PossibleValue = Date | Date[] | DateRange | undefined | null;

// Union type for all possible props
export type DatePickerProps =
  | DatePickerSingleProps
  | DatePickerMultipleProps
  | DatePickerRangeProps;

export const DatePicker = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  closeOnSelect = true,
  mode = "single",
  dateFormat = "PPP",
  clearButton = false,
  ...dayPickerProps
}: DatePickerProps) => {
  const [internalValue, setInternalValue] = React.useState<PossibleValue>(
    mode === "multiple" ? [] : undefined
  );
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  // Get appropriate placeholder based on mode
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    switch (mode) {
      case "multiple":
        return t("components.ui.date-picker.multiple.placeholder");
      case "range":
        return t("components.ui.date-picker.range.placeholder");
      case "single":
      default:
        return t("components.ui.date-picker.placeholder");
    }
  };

  const displayPlaceholder = getPlaceholder();

  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (selectedValue: PossibleValue) => {
    if (onChange) {
      (onChange as (value: PossibleValue) => void)(selectedValue);
    } else {
      setInternalValue(selectedValue);
    }

    // Close popover if closeOnSelect is true and a value was selected
    // For single mode only - range and multiple should stay open for multiple selections
    if (closeOnSelect && selectedValue && mode === "single") {
      setOpen(false);
    }
  };

  // Format display text based on mode
  const getDisplayText = () => {
    if (!currentValue) return displayPlaceholder;

    switch (mode) {
      case "single":
        return currentValue instanceof Date
          ? format(currentValue, dateFormat)
          : displayPlaceholder;
      case "multiple":
        if (Array.isArray(currentValue) && currentValue.length > 0) {
          return currentValue.length === 1
            ? format(currentValue[0] as Date, dateFormat)
            : t("components.ui.date-picker.multiple.selected", {
                count: currentValue.length,
              });
        }
        return displayPlaceholder;
      case "range":
        if (
          currentValue &&
          typeof currentValue === "object" &&
          "from" in currentValue
        ) {
          const rangeValue = currentValue as DateRange;
          if (rangeValue.from) {
            if (rangeValue.to) {
              return `${format(rangeValue.from, dateFormat)} - ${format(
                rangeValue.to,
                dateFormat
              )}`;
            }
            return `${format(rangeValue.from, dateFormat)} - ...`;
          }
        }
        return displayPlaceholder;
      default:
        return displayPlaceholder;
    }
  };

  const displayText = getDisplayText();

  // Helper function to check if value is empty based on mode
  const isEmpty = () => {
    if (!currentValue) return true;

    switch (mode) {
      case "multiple":
        return !Array.isArray(currentValue) || currentValue.length === 0;
      case "range":
        return (
          !currentValue ||
          typeof currentValue !== "object" ||
          !("from" in currentValue) ||
          !currentValue.from
        );
      case "single":
      default:
        return !currentValue;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={isEmpty()}
          disabled={disabled}
          className={cn(
            "cursor-pointer data-[empty=true]:text-muted-foreground justify-start text-left font-normal w-full",
            className
          )}
          title={displayText}
        >
          <CalendarIcon />
          <span className="text-ellipsis overflow-hidden">{displayText}</span>
          {clearButton && !isEmpty() && (
            <div className="ml-auto">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleValueChange(null);
                }}
              >
                <span role="button">
                  <XIcon />
                </span>
              </Button>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {/* Calendar component with dynamic typing based on mode */}
        <Calendar
          mode={mode}
          // @ts-expect-error - TypeScript can't infer the correct type for all modes
          selected={currentValue}
          onSelect={handleValueChange}
          {...dayPickerProps}
        />
      </PopoverContent>
    </Popover>
  );
};
