type Status = string;

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  uploaded: { label: "アップロード済", className: "bg-blue-100 text-blue-700" },
  parsing: { label: "パース中", className: "bg-yellow-100 text-yellow-700" },
  validating: { label: "バリデーション中", className: "bg-purple-100 text-purple-700" },
  importing: { label: "取り込み中", className: "bg-orange-100 text-orange-700" },
  completed: { label: "完了", className: "bg-green-100 text-green-700" },
  failed: { label: "失敗", className: "bg-red-100 text-red-700" },
  pending: { label: "待機中", className: "bg-gray-100 text-gray-700" },
  generating: { label: "生成中", className: "bg-yellow-100 text-yellow-700" },
};

export function JobStatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
