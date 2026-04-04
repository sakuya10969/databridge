import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplate } from "~/features/template/api/fetch-templates";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { formatDate } from "~/shared/utils/format-date";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();

  const { data: template, isLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!template) return <p>テンプレートが見つかりません</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{template.name}</h1>

      <Card>
        <CardContent className="pt-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">ターゲットテーブル</dt>
              <dd>{template.target_table}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">説明</dt>
              <dd>{template.description ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">作成日時</dt>
              <dd>{formatDate(template.created_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">列定義</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell>{col.source_column}</TableCell>
                  <TableCell>{col.target_column}</TableCell>
                  <TableCell>{col.data_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
