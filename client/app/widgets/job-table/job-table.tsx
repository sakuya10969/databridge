import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/shared/ui/data-table";
import { JobStatusBadge } from "~/widgets/job-status-badge/job-status-badge";
import type { ImportJob } from "~/entities/import-job/types";
import { formatDate } from "~/shared/utils/format-date";
import { formatFileSize } from "~/shared/utils/format-file-size";

const columns: ColumnDef<ImportJob, unknown>[] = [
  {
    accessorKey: "file_name",
    header: "ファイル名",
    cell: ({ row }) => (
      <Link to={`/jobs/${row.original.id}`} className="font-medium text-[#4d83fd] hover:text-foreground">
        {row.original.file_name}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "ステータス",
    cell: ({ getValue }) => <JobStatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: "file_size",
    header: "サイズ",
    cell: ({ getValue }) => formatFileSize(getValue() as number),
  },
  {
    accessorKey: "total_rows",
    header: "行数",
    cell: ({ getValue }) => getValue() ?? "-",
  },
  { accessorKey: "operator", header: "操作者" },
  {
    accessorKey: "created_at",
    header: "作成日時",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];

interface JobTableProps {
  jobs: ImportJob[];
}

export function JobTable({ jobs }: JobTableProps) {
  return <DataTable columns={columns} data={jobs} />;
}
