import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-[rgba(38,101,253,0.08)] p-4">
        <Inbox className="h-8 w-8 text-primary" />
      </div>
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
