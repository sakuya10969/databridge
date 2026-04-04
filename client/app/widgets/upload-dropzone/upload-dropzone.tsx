import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatFileSize } from "~/shared/utils/format-file-size";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
  isUploading?: boolean;
}

export function UploadDropzone({ onFileAccepted, isUploading }: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);
      if (rejectedFiles && (rejectedFiles as { errors: { message: string }[] }[]).length > 0) {
        const errs = (rejectedFiles as { errors: { message: string }[] }[])[0].errors;
        setError(errs.map((e) => e.message).join(", "));
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 bg-gray-50"
      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-700">
          {isDragActive ? "ここにドロップ" : "ファイルをドラッグ&ドロップ"}
        </p>
        <p className="text-sm text-gray-500">または クリックしてファイルを選択</p>
        <p className="text-xs text-gray-400">
          CSV, XLSX 対応 / 最大 {formatFileSize(MAX_SIZE)}
        </p>
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
