import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useFileUpload } from "~/features/upload/hooks/use-file-upload";
import { UploadDropzone } from "~/widgets/upload-dropzone/upload-dropzone";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function JobsUploadPage() {
  const navigate = useNavigate();
  const [operator, setOperator] = useState("anonymous");

  const upload = useFileUpload((job) => {
    toast.success(`アップロード完了: ${job.file_name}`);
    navigate(`/jobs/${job.id}`);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">ファイルアップロード</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">アップロード設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="operator">操作者名</Label>
            <Input
              id="operator"
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="操作者名を入力"
            />
          </div>

          <UploadDropzone
            isUploading={upload.isPending}
            onFileAccepted={(file) => upload.mutate({ file, operator })}
          />

          {upload.isPending && <LoadingSpinner size="sm" />}

          {upload.isError && (
            <p className="text-sm text-destructive">{String(upload.error)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
