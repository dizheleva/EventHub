import { Skeleton } from "@/components/common/Skeleton";

/**
 * EventCardSkeleton - Loading skeleton for event cards
 * 
 * Mimics the layout of EventItem component to provide
 * a smooth loading experience.
 */
export function EventCardSkeleton() {
  return (
    <div className="relative w-full h-full min-w-0 p-8 bg-white rounded-xl shadow-md flex flex-col">
      {/* Image Placeholder */}
      <Skeleton className="w-full h-48 mb-4 rounded-lg" />
      
      {/* Title Line */}
      <Skeleton className="h-6 w-3/4 mb-4" />
      
      {/* City/Date Lines */}
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      
      {/* Price Line */}
      <Skeleton className="h-5 w-1/3 mb-4" />
      
      {/* Button Placeholder */}
      <Skeleton className="h-10 w-full mt-auto rounded-lg" />
    </div>
  );
}

