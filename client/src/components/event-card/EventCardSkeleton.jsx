import Skeleton from "../common/Skeleton";

/**
 * EventCardSkeleton - Loading skeleton for event cards
 * 
 * Mimics the layout of EventCard component to provide
 * a smooth loading experience.
 */
export default function EventCardSkeleton() {
  return (
    <div className="block w-full bg-white rounded-2xl shadow-soft overflow-hidden group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-7 w-2/3 mb-3" />

        {/* City skeleton */}
        <div className="mb-3">
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Date skeleton with icon */}
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="ml-6 mt-1">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Location skeleton with icon */}
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 rounded mt-0.5" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price skeleton */}
        <div className="mb-3">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        {/* Author skeleton */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

