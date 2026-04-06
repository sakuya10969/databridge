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
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
          isDragActive
            ? "scale-[1.01] border-primary bg-[rgba(38,101,253,0.06)]"
            : "border-border bg-muted hover:border-primary/40 hover:bg-[rgba(38,101,253,0.04)]"
        } ${isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`rounded-full p-4 transition-colors ${isDragActive ? "bg-[rgba(38,101,253,0.1)]" : "bg-card border border-border"}`}>
            <Upload className={`h-8 w-8 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {isDragActive ? "ここにドロップ" : "ファイルをドラッグ&ドロップ"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">またはクリックしてファイルを選択</p>
          </div>
          <p className="text-xs text-muted-foreground">
            CSV, XLSX 対応 / 最大 {formatFileSize(MAX_SIZE)}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-[#fef2f2] px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[rgba(38,101,253,0.08)] p-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">
            <Button onClick={handleUpload} disabled={isUploading} className="w-full">
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
