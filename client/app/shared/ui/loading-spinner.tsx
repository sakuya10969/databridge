import { Skeleton } from "~/components/ui/skeleton";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights = { sm: "h-4", md: "h-8", lg: "h-12" };
  return (
    <div className="space-y-2">
      <Skeleton className={`w-full ${heights[size]} rounded-md`} />
      <Skeleton className={`w-3/4 ${heights[size]} rounded-md`} />
    </div>
  );
}
