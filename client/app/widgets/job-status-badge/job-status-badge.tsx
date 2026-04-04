import { Badge } from "~/components/ui/badge";

type Status = string;

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  uploaded:   { label: "アップロード済",   variant: "outline" },
  parsing:    { label: "パース中",         variant: "warning" },
  validating: { label: "バリデーション中", variant: "warning" },
  importing:  { label: "取り込み中",       variant: "secondary" },
  completed:  { label: "完了",             variant: "success" },
  failed:     { label: "失敗",             variant: "destructive" },
  pending:    { label: "待機中",           variant: "outline" },
  generating: { label: "生成中",           variant: "warning" },
};

export function JobStatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "outline" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
