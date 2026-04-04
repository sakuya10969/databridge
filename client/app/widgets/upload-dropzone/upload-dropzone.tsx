import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileSpreadsheet } from "lucide-react";
import { formatFileSize } from "~/shared/utils/format-file-size";
import { Button } from "~/components/ui/button";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export function UploadDropzone({ onUpload, isUploading }: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);
      if (rejectedFiles && (rejectedFiles as { errors: { message: string }[] }[]).length > 0) {
        const errs = (rejectedFiles as { errors: { message: string }[] }[])[0].errors;
        setError(errs.map((e) => e.message).join(", "));
        return;
      }
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-blue-500 bg-blue-50/80 scale-[1.01]"
            : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50 bg-white"
        } ${isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`rounded-full p-4 transition-colors ${isDragActive ? "bg-blue-100" : "bg-gray-100"}`}>
            <Upload className={`h-8 w-8 ${isDragActive ? "text-blue-600" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">
              {isDragActive ? "ここにドロップ" : "ファイルをドラッグ&ドロップ"}
            </p>
            <p className="mt-1 text-sm text-gray-500">または クリックしてファイルを選択</p>
          </div>
          <p className="text-xs text-gray-400">
            CSV, XLSX 対応 / 最大 {formatFileSize(MAX_SIZE)}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  アップロード中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  アップロード
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
