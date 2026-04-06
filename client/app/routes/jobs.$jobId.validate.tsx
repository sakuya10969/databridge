import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useValidation } from "~/features/validation/hooks/use-validation";
import { BackLink, PageContainer, PageHeader, StatGrid } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Play, CheckCircle2, AlertTriangle } from "lucide-react";

export default function JobValidatePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const mutation = useValidation(jobId!);

  return (
    <PageContainer className="max-w-3xl">
      <BackLink to={`/jobs/${jobId}`}>ジョブ詳細に戻る</BackLink>

      <PageHeader
        eyebrow="Validation"
        title="バリデーション実行"
        description="データの型・必須・重複・形式チェックを実行します。"
      />

      <StatGrid
        items={[
          { label: "ジョブID", value: <span className="font-mono text-xs">{jobId}</span> },
          { label: "チェック内容", value: "Type / Required", hint: "重複・形式も含む" },
        ]}
      />

      <SectionCard title="実行" description="マッピング済みデータに対してバリデーションを行います。">
        <div className="space-y-4">
          <Button
            onClick={() =>
              mutation.mutate(undefined, {
                onSuccess: (result) => {
                  if (result.error_count === 0) {
                    toast.success("バリデーション完了: エラーなし");
                  } else {
                    toast.warning(`バリデーション完了: ${result.error_count}件のエラー`);
                  }
                },
                onError: (e) => toast.error(String(e)),
              })
            }
            disabled={mutation.isPending}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {mutation.isPending ? "実行中..." : "バリデーション実行"}
          </Button>

          {mutation.isSuccess && (
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-4 ${
              mutation.data.error_count === 0
                ? "border-[#16a34a]/20 bg-[#f0fdf4]"
                : "border-[#d97706]/20 bg-[#fffbeb]"
            }`}>
              {mutation.data.error_count === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-[#16a34a]" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-[#d97706]" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  mutation.data.error_count === 0 ? "text-[#16a34a]" : "text-[#d97706]"
                }`}>
                  {mutation.data.error_count === 0
                    ? "バリデーション成功"
                    : `${mutation.data.error_count}件のエラーが見つかりました`}
                </p>
                {mutation.data.error_count > 0 && (
                  <Link
                    to={`/jobs/${jobId}/errors`}
                    className="text-xs text-[#d97706] underline hover:text-foreground"
                  >
                    エラー詳細を確認
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
