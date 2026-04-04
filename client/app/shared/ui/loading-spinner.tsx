import { Loader2 } from "lucide-react";

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-500`} />
    </div>
  );
}
