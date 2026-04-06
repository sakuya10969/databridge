import { useParams, Link } from "react-router";
import { useState } from "react";
import { useErrors } from "~/features/validation/hooks/use-validation";
import { ErrorTable } from "~/widgets/error-table/error-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { BackLink, PageContainer, PageHeader, Pagination } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
    <PageContainer className="max-w-6xl">
      <BackLink to={`/jobs/${jobId}`}>ジョブ詳細に戻る</BackLink>

      <PageHeader
        eyebrow="Validation Errors"
        title="エラー一覧"
        description="行・列単位のバリデーションエラーを確認できます。"
      />

      <SectionCard title="フィルタ" description="列名とエラー種別でエラーを絞り込みます。">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              value={columnName}
              onChange={(e) => { setColumnName(e.target.value); setPage(1); }}
              placeholder="列名でフィルタ"
              className="max-w-xs"
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
              <span className="text-sm text-muted-foreground lg:ml-auto">全 {data.meta.total} 件</span>
            )}
          </div>
      </SectionCard>

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="エラーはありません" description="バリデーションエラーは検出されませんでした" />
      )}
      {data?.data && data.data.length > 0 && (
        <SectionCard title="エラー詳細" description="行番号、列名、期待値、実際の値を表示します。">
          <ErrorTable errors={data.data} />
        </SectionCard>
      )}

      {data?.meta && data.meta.total > data.meta.per_page && (
        <Pagination
          page={page}
          totalPages={Math.ceil(data.meta.total / data.meta.per_page)}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          disablePrev={page === 1}
          disableNext={page * data.meta.per_page >= data.meta.total}
        />
      )}
    </PageContainer>
  );
}
