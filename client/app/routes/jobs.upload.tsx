import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useFileUpload } from "~/features/upload/hooks/use-file-upload";
import { UploadDropzone } from "~/widgets/upload-dropzone/upload-dropzone";
import { PageContainer, PageHeader, StatGrid } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export default function JobsUploadPage() {
  const navigate = useNavigate();
  const [operator, setOperator] = useState("anonymous");

  const upload = useFileUpload((job) => {
    toast.success(`アップロード完了: ${job.file_name}`);
    navigate(`/jobs/${job.id}`);
  });

  return (
    <PageContainer className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Import"
        title="ファイルアップロード"
        description="CSV または Excel ファイルをアップロードして、取り込みジョブを開始します。"
      />

      <StatGrid
        items={[
          { label: "対応形式", value: "CSV / XLSX", hint: "業務ファイル対応" },
          { label: "最大サイズ", value: "50MB", hint: "MVP 制限" },
          { label: "処理フロー", value: "Upload → Parse", hint: "次画面でマッピング設定" },
        ]}
      />

      <SectionCard title="アップロード設定" description="操作者名を入力し、対象ファイルを選択してください。">
        <div className="space-y-5">
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
            <div className="rounded-lg border border-destructive/20 bg-[#fef2f2] px-4 py-3 text-sm text-destructive">
              {String(upload.error)}
            </div>
          )}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
