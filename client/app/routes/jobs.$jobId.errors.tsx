import { useParams } from "react-router";
import { useState } from "react";
import { useErrors } from "~/features/validation/hooks/use-validation";
import { ErrorTable } from "~/widgets/error-table/error-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";

export default function JobErrorsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [page, setPage] = useState(1);
  const [columnName, setColumnName] = useState("");
  const [errorType, setErrorType] = useState("");

  const { data, isLoading } = useErrors(
    jobId!,
    page,
    columnName || undefined,
    errorType || undefined
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">エラー一覧</h1>

      <div className="flex gap-3">
        <input
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          placeholder="列名でフィルタ"
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        />
        <select
          value={errorType}
          onChange={(e) => setErrorType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="">全エラー種別</option>
          <option value="type_error">型エラー</option>
          <option value="required_error">必須エラー</option>
          <option value="unique_error">重複エラー</option>
          <option value="pattern_error">形式エラー</option>
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="エラーはありません" />
      )}
      {data?.data && data.data.length > 0 && <ErrorTable errors={data.data} />}

      {data?.meta && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            前へ
          </button>
          <span>
            {page} / {Math.ceil(data.meta.total / data.meta.per_page)} ページ
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * data.meta.per_page >= data.meta.total}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
