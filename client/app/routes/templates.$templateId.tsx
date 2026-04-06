import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplate } from "~/features/template/api/fetch-templates";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { formatDate } from "~/shared/utils/format-date";
import { BackLink, InfoList, PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();

  const { data: template, isLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
  });

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!template) return <p className="py-20 text-center text-muted-foreground">テンプレートが見つかりません</p>;

  return (
    <PageContainer className="max-w-5xl">
      <BackLink to="/templates">一覧に戻る</BackLink>

      <PageHeader
        eyebrow="Import Template"
        title={template.name}
        description={template.description || "説明なし"}
      />

      <SectionCard title="テンプレート情報" description="ターゲットテーブルと作成日時です。">
        <InfoList
          items={[
            { label: "ターゲットテーブル", value: template.target_table, mono: true },
            { label: "作成日時", value: formatDate(template.created_at) },
          ]}
        />
      </SectionCard>

      <SectionCard title="列定義" description="ソース列とターゲット列、型の対応です。">
          {template.column_definitions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">列定義がありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ソース列</TableHead>
                  <TableHead>ターゲット列</TableHead>
                  <TableHead>データ型</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.column_definitions.map((col, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm">{col.source_column}</TableCell>
                    <TableCell className="font-mono text-sm">{col.target_column}</TableCell>
                    <TableCell><Badge variant="secondary">{col.data_type}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </SectionCard>
    </PageContainer>
  );
}
