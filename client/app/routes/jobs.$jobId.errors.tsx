import { useParams, Link } from "react-router";
import { useState } from "react";
import { useErrors } from "~/features/validation/hooks/use-validation";
import { ErrorTable } from "~/widgets/error-table/error-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const ERROR_TYPE_OPTIONS = [
  { value: "all", label: "全エラー種別" },
  { value: "type_error", label: "型エラー" },
  { value: "required_error", label: "必須エラー" },
  { value: "unique_error", label: "重複エラー" },
  { value: "pattern_error", label: "形式エラー" },
];

export default function JobErrorsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [page, setPage] = useState(1);
  const [columnName, setColumnName] = useState("");
  const [errorType, setErrorType] = useState("all");

  const { data, isLoading } = useErrors(
    jobId!,
    page,
    columnName || undefined,
    errorType === "all" ? undefined : errorType
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link to={`/jobs/${jobId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            ジョブ詳細に戻る
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">エラー一覧</h1>
        <p className="mt-1 text-sm text-gray-500">バリデーションエラーの詳細を確認できます</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Input
              value={columnName}
              onChange={(e) => { setColumnName(e.target.value); setPage(1); }}
              placeholder="列名でフィルタ"
              className="max-w-48"
            />
            <Select value={errorType} onValueChange={(v) => { setErrorType(v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ERROR_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data?.meta && (
              <span className="ml-auto text-sm text-gray-400">全 {data.meta.total} 件</span>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="エラーはありません" description="バリデーションエラーは検出されませんでした" />
      )}
      {data?.data && data.data.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <ErrorTable errors={data.data} />
        </Card>
      )}

      {data?.meta && data.meta.total > data.meta.per_page && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>
          <span className="text-gray-600 tabular-nums">
            {page} / {Math.ceil(data.meta.total / data.meta.per_page)} ページ
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * data.meta.per_page >= data.meta.total}
            className="gap-1"
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
