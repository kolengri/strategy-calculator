import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { XIcon, GripVertical } from "lucide-react";
import type { Strategy } from "@/stores/strategy";
import { isOnlyOneElement } from "@/utils/type-guards/is-only-one-element";
import { getStrategyColor } from "@/utils/get-strategy-color";
import { cn } from "@/lib/utils";

type SortableTabProps = {
  strategy: Strategy;
  strategies: Strategy[];
  onRemove: (id: string) => void;
};

function SortableTab({ strategy, strategies, onRemove }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strategy.id });

  const strategyColor = getStrategyColor(strategy.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    "--strategy-color": strategyColor,
    borderLeftColor: strategyColor,
    borderLeftWidth: "3px",
  } as React.CSSProperties;

  return (
    <TabsTrigger
      ref={setNodeRef}
      style={style}
      value={strategy.id}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing border-l-solid",
        {
          "cursor-default": isOnlyOneElement(strategies),
        }
      )}
    >
      {!isOnlyOneElement(strategies) && (
        <span
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-50 transition-opacity mr-0.5"
        >
          <GripVertical className="size-3" />
        </span>
      )}
      <span className="text-sm">{strategy.name}</span>
      {!isOnlyOneElement(strategies) && (
        <Button
          className="size-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-destructive/10 hover:text-destructive"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(strategy.id);
          }}
        >
          <XIcon className="size-3" />
        </Button>
      )}
    </TabsTrigger>
  );
}

type SortableStrategyTabsProps = {
  strategies: Strategy[];
  onReorder: (strategies: Strategy[]) => void;
  onRemove: (id: string) => void;
};

export function SortableStrategyTabs({
  strategies,
  onReorder,
  onRemove,
}: SortableStrategyTabsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = strategies.findIndex((s) => s.id === active.id);
      const newIndex = strategies.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(strategies, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={strategies.map((s) => s.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="w-max flex gap-1">
          {strategies.map((strategy) => (
            <SortableTab
              key={strategy.id}
              strategy={strategy}
              strategies={strategies}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
