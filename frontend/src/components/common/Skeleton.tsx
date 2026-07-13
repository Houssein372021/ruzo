export function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[3/4] bg-[#080808]/8" />
          <div className="mt-4 h-3 w-3/4 bg-[#080808]/8" />
          <div className="mt-2 h-3 w-1/3 bg-[#080808]/8" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse border border-[#080808]/10 bg-[#FFFFFF]" />
      ))}
    </div>
  );
}
