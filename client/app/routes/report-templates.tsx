import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useReportTemplates } from "~/features/report-template/hooks/use-report-templates";
import { DataTable } from "~/shared/ui/data-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { ReportTemplate } from "~/entities/report-template/types";
import { formatDate } from "~/shared/utils/format-date";
import { Plus } from "lucide-react";

const columns: ColumnDef<ReportTemplate, unknown>[] = [
  {
    accessorKey: "name",
    header: "テンプレート名",
    cell: ({ row }) => (
      <Link to={`/report-templates/${row.original.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "report_type",
    header: "帳票種別",
    cell: ({ getValue }) => <Badge variant="outline">{getValue() as string}</Badge>,
  },
  {
    accessorKey: "default_output_format",
    header: "出力形式",
    cell: ({ getValue }) => <Badge variant="secondary">{(getValue() as string).toUpperCase()}</Badge>,
  },
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">帳票テンプレート</h1>
          <p className="mt-1 text-sm text-gray-500">帳票出力のレイアウト・フィールド定義を管理します</p>
        </div>
        <Link to="/report-templates/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            テンプレート作成
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}
      {!isLoading && templates.length === 0 && (
        <EmptyState title="帳票テンプレートがありません" description="テンプレートを作成して帳票出力を始めましょう" />
      )}
      {templates.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <DataTable columns={columns} data={templates} />
        </Card>
      )}
    </div>
  );
}
