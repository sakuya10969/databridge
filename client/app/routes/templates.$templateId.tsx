import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplate } from "~/features/template/api/fetch-templates";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { formatDate } from "~/shared/utils/format-date";

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
      <h1 className="text-2xl font-bold text-gray-800">{template.name}</h1>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="font-medium text-gray-500">ターゲットテーブル</dt>
          <dd className="text-gray-800">{template.target_table}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">説明</dt>
          <dd className="text-gray-800">{template.description ?? "-"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">作成日時</dt>
          <dd className="text-gray-800">{formatDate(template.created_at)}</dd>
        </div>
      </dl>
      <h2 className="text-lg font-semibold text-gray-700">列定義</h2>
      <table className="w-full text-sm border rounded-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">ソース列</th>
            <th className="px-3 py-2 text-left">ターゲット列</th>
            <th className="px-3 py-2 text-left">データ型</th>
          </tr>
        </thead>
        <tbody>
          {template.column_definitions.map((col, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2">{col.source_column}</td>
              <td className="px-3 py-2">{col.target_column}</td>
              <td className="px-3 py-2">{col.data_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
