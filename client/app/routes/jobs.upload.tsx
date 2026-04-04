import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useFileUpload } from "~/features/upload/hooks/use-file-upload";
import { UploadDropzone } from "~/widgets/upload-dropzone/upload-dropzone";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";

export default function JobsUploadPage() {
  const navigate = useNavigate();
  const [operator, setOperator] = useState("anonymous");

  const upload = useFileUpload((job) => {
    toast.success(`アップロード完了: ${job.file_name}`);
    navigate(`/jobs/${job.id}`);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ファイルアップロード</h1>
        <p className="mt-1 text-sm text-gray-500">CSV または Excel ファイルを取り込みます</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">アップロード設定</CardTitle>
          <CardDescription>操作者名を入力し、ファイルを選択してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
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
            onUpload={(file) => upload.mutate({ file, operator })}
          />

          {upload.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {String(upload.error)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
