import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HintProps = {
  children?: React.ReactNode;
  hint: string;
  className?: string;
  iconClassName?: string;
  asChild?: boolean;
};

export const Hint = ({
  children,
  hint,
  className,
  iconClassName,
  asChild,
}: HintProps) => {
  const hasChildren = children !== null && children !== undefined;

  return (
    <Tooltip>
      <TooltipTrigger
        asChild={asChild}
        type="button"
        tabIndex={-1}
        className={cn("flex items-center gap-1 cursor-help", className)}
      >
        {asChild ? (
          children
        ) : (
          <>
            {hasChildren && children}
            <HelpCircle
              className={cn(
                "size-3 text-muted-foreground/50 flex-shrink-0",
                iconClassName
              )}
            />
          </>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
};

