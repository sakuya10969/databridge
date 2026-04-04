import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useReportTemplates } from "~/features/report-template/hooks/use-report-templates";
import { DataTable } from "~/shared/ui/data-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Button } from "~/components/ui/button";
import type { ReportTemplate } from "~/entities/report-template/types";
import { formatDate } from "~/shared/utils/format-date";

const columns: ColumnDef<ReportTemplate, unknown>[] = [
  {
    accessorKey: "name",
    header: "テンプレート名",
    cell: ({ row }) => (
      <Link to={`/report-templates/${row.original.id}`} className="text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "report_type", header: "帳票種別" },
  { accessorKey: "default_output_format", header: "出力形式" },
  { accessorKey: "target_resource_type", header: "対象リソース" },
  {
    accessorKey: "created_at",
    header: "作成日時",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];

export default function ReportTemplatesPage() {
  const { data, isLoading } = useReportTemplates();

  const templates = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">帳票テンプレート</h1>
        <Link to="/report-templates/new">
          <Button>テンプレート作成</Button>
        </Link>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && templates.length === 0 && (
        <EmptyState title="帳票テンプレートがありません" />
      )}
      {templates.length > 0 && <DataTable columns={columns} data={templates} />}
    </div>
  );
}
