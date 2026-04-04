import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplate } from "~/features/template/api/fetch-templates";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { formatDate } from "~/shared/utils/format-date";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, FileText, Calendar } from "lucide-react";

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();

  const { data: template, isLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
  });

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!template) return <p className="text-center py-20 text-gray-500">テンプレートが見つかりません</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/templates">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{template.description || "説明なし"}</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-5">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-gray-50 p-2">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">ターゲットテーブル</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900 font-mono">{template.target_table}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-gray-50 p-2">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">作成日時</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">{formatDate(template.created_at)}</dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">列定義</CardTitle>
        </CardHeader>
        <CardContent>
          {template.column_definitions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">列定義がありません</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
