import { useParams } from "react-router";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">エラー一覧</h1>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Input
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="列名でフィルタ"
              className="max-w-48"
            />
            <Select value={errorType} onValueChange={(v) => { setErrorType(v); setPage(1); }}>
              <SelectTrigger className="w-44">
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
          </div>
        </CardContent>
      </Card>

      {isLoading && <LoadingSpinner />}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="エラーはありません" />
      )}
      {data?.data && data.data.length > 0 && <ErrorTable errors={data.data} />}

      {data?.meta && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            前へ
          </Button>
          <span>
            {page} / {Math.ceil(data.meta.total / data.meta.per_page)} ページ
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * data.meta.per_page >= data.meta.total}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
