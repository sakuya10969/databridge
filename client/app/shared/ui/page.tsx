import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}

export function BackLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to}>
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {children}
      </Button>
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
        {description ? <p className="max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; hint?: ReactNode }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm" className="gap-2">
          <div className="px-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {item.value}
            </p>
            {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function InfoList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; mono?: boolean }>;
}) {
  return (
    <dl className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-muted px-4 py-4"
        >
          <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className={cn("mt-2 text-sm font-medium text-foreground", item.mono && "font-mono text-xs")}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={disablePrev}>
        前へ
      </Button>
      <span className="min-w-28 text-center tabular-nums">
        {page} / {totalPages} ページ
      </span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={disableNext}>
        次へ
      </Button>
    </div>
  );
}
