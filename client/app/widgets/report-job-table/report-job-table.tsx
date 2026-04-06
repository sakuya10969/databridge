import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/shared/ui/data-table";
import { JobStatusBadge } from "~/widgets/job-status-badge/job-status-badge";
import type { ReportJob } from "~/entities/report-job/types";
import { formatDate } from "~/shared/utils/format-date";

const columns: ColumnDef<ReportJob, unknown>[] = [
  {
    accessorKey: "id",
    header: "ジョブID",
    cell: ({ row }) => (
      <Link
        to={`/report-jobs/${row.original.id}`}
        className="font-mono text-xs text-primary hover:underline"
      >
        {row.original.id.slice(0, 8)}...
      </Link>
    ),
  },
  { accessorKey: "output_format", header: "出力形式" },
  {
    accessorKey: "status",
    header: "ステータス",
    cell: ({ getValue }) => <JobStatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: "row_count",
    header: "行数",
    cell: ({ getValue }) => getValue() ?? "-",
  },
  { accessorKey: "requested_by", header: "依頼者" },
  {
    accessorKey: "created_at",
    header: "作成日時",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];

export function ReportJobTable({ jobs }: { jobs: ReportJob[] }) {
  return <DataTable columns={columns} data={jobs} />;
}
