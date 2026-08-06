export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-bg-card border border-border-custom">
      <div className="aspect-square bg-bg-secondary animate-pulse"></div>
      <div className="flex-1 p-4 space-y-3">
        <div className="h-4 bg-bg-secondary rounded animate-pulse w-3/4"></div>
        <div className="h-3 bg-bg-secondary rounded animate-pulse w-1/3"></div>
        <div className="h-5 bg-bg-secondary rounded animate-pulse w-1/2"></div>
        <div className="h-10 bg-bg-secondary rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}
