import { useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useValidation } from "~/features/validation/hooks/use-validation";

export default function JobValidatePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const mutation = useValidation(jobId!);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">バリデーション実行</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ジョブID: {jobId}</CardTitle>
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
          >
            {mutation.isPending ? "実行中..." : "バリデーション実行"}
          </Button>

          {mutation.isSuccess && (
            <p className="text-sm text-muted-foreground">
              エラー件数: {mutation.data.error_count}件
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
