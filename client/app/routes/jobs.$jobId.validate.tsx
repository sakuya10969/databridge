import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { useValidation } from "~/features/validation/hooks/use-validation";
import { ArrowLeft, Play, CheckCircle2, AlertTriangle } from "lucide-react";

export default function JobValidatePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const mutation = useValidation(jobId!);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to={`/jobs/${jobId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            ジョブ詳細に戻る
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">バリデーション実行</h1>
        <p className="mt-1 text-sm text-gray-500">データの型・必須・重複・形式チェックを実行します</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">ジョブ情報</CardTitle>
          <CardDescription className="font-mono text-xs">{jobId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
              mutation.data.error_count === 0
                ? "bg-green-50 border border-green-200"
                : "bg-amber-50 border border-amber-200"
            }`}>
              {mutation.data.error_count === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  mutation.data.error_count === 0 ? "text-green-800" : "text-amber-800"
                }`}>
                  {mutation.data.error_count === 0
                    ? "バリデーション成功"
                    : `${mutation.data.error_count}件のエラーが見つかりました`}
                </p>
                {mutation.data.error_count > 0 && (
                  <Link
                    to={`/jobs/${jobId}/errors`}
                    className="text-xs text-amber-700 hover:text-amber-900 underline"
                  >
                    エラー詳細を確認
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
