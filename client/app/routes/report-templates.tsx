import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useReportTemplates } from "~/features/report-template/hooks/use-report-templates";
import { DataTable } from "~/shared/ui/data-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { ReportTemplate } from "~/entities/report-template/types";
import { formatDate } from "~/shared/utils/format-date";
import { Plus } from "lucide-react";

const columns: ColumnDef<ReportTemplate, unknown>[] = [
  {
    accessorKey: "name",
    header: "テンプレート名",
    cell: ({ row }) => (
      <Link to={`/report-templates/${row.original.id}`} className="font-medium text-[#4d83fd] hover:text-foreground">
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
    <PageContainer>
      <PageHeader
        eyebrow="Report Templates"
        title="帳票テンプレート"
        description="帳票出力のレイアウトとフィールド定義を管理します。"
        actions={
          <Link to="/report-templates/new">
            <Button className="gap-2">
            <Plus className="h-4 w-4" />
            テンプレート作成
            </Button>
          </Link>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}
      {!isLoading && templates.length === 0 && (
        <EmptyState title="帳票テンプレートがありません" description="テンプレートを作成して帳票出力を始めましょう" />
      )}
      {templates.length > 0 && (
        <SectionCard title="テンプレート一覧" description="帳票テンプレートの一覧です。">
          <DataTable columns={columns} data={templates} />
        </SectionCard>
      )}
    </PageContainer>
  );
}
