import Skeleton from "@/components/common/Skeleton";

/**
 * EventCardSkeleton - Loading skeleton for event cards
 * 
 * Mimics the layout of EventItem component to provide
 * a smooth loading experience.
 */
export default function EventCardSkeleton() {
  return (
    <div className="block w-full bg-white rounded-2xl shadow-soft overflow-hidden group h-full flex flex-col">
      {/* Image Placeholder */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        {/* Title - text-xl font-bold (по-голямо) */}
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-7 w-2/3 mb-3" />

        {/* City - text-sm (по-малко) */}
        <div className="mb-3">
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Date - text-sm с икона */}
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="ml-6 mt-1">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Location - text-sm с икона */}
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 rounded mt-0.5" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        {/* Price - text-sm font-semibold с padding */}
        <div className="mb-3">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        {/* Author - mt-auto за да изтласка останалото надолу */}
        <div className="pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

