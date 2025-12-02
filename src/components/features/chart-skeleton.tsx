import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full flex flex-col gap-4 p-4">
      {/* Title skeleton */}
      <Skeleton className="h-6 w-48" />
      
      {/* Chart area skeleton */}
      <div className="flex-1 flex items-end gap-2 px-8 pb-8">
        {/* Y-axis */}
        <div className="flex flex-col justify-between h-full py-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Chart bars/lines representation */}
        <div className="flex-1 flex items-end gap-1 h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${20 + Math.random() * 70}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-12">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
      </div>
      
      {/* Legend skeleton */}
      <div className="flex justify-center gap-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

