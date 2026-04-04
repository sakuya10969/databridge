import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useFileUpload } from "~/features/upload/hooks/use-file-upload";
import { UploadDropzone } from "~/widgets/upload-dropzone/upload-dropzone";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";

export default function JobsUploadPage() {
  const navigate = useNavigate();
  const [operator, setOperator] = useState("anonymous");

  const upload = useFileUpload((job) => {
    toast.success(`アップロード完了: ${job.file_name}`);
    navigate(`/jobs/${job.id}`);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ファイルアップロード</h1>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">操作者名</label>
        <input
          type="text"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="操作者名を入力"
        />
      </div>

      <UploadDropzone
        isUploading={upload.isPending}
        onFileAccepted={(file) => upload.mutate({ file, operator })}
      />

      {upload.isPending && (
        <div className="flex items-center gap-3 text-blue-600">
          <LoadingSpinner size="sm" />
          <span className="text-sm">アップロード中...</span>
        </div>
      )}

      {upload.isError && (
        <p className="text-sm text-red-500">{String(upload.error)}</p>
      )}
    </div>
  );
}
