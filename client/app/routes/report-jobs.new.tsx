import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReportTemplates } from "~/features/report-template/hooks/use-report-templates";
import { createReportJob } from "~/features/report-job/api/report-job-api";
import { ReportConditionForm } from "~/widgets/report-condition-form/report-condition-form";
import type { ReportConditionFormValues } from "~/widgets/report-condition-form/report-condition-form";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { useState } from "react";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "DataBridge - 帳票ジョブ作成" }];
}

export default function ReportJobNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: templatesData, isLoading: loadingTemplates } = useReportTemplates();
  const [templateId, setTemplateId] = useState("");

  const mutation = useMutation({
    mutationFn: createReportJob,
    onSuccess: (job) => {
      qc.invalidateQueries({ queryKey: ["report-jobs"] });
      toast.success("ジョブを作成しました");
      navigate(`/report-jobs/${job.id}`);
    },
    onError: (e) => toast.error(String(e)),
  });

  const templates = templatesData?.data ?? [];

  if (loadingTemplates) return <LoadingSpinner />;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">帳票出力ジョブ作成</h1>

      <div className="space-y-1">
        <Label htmlFor="template_select">帳票テンプレート</Label>
        <select
          id="template_select"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">テンプレートを選択...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <ReportConditionForm
        isSubmitting={mutation.isPending}
        onSubmit={(values: ReportConditionFormValues) => {
          if (!templateId) {
            toast.error("テンプレートを選択してください");
            return;
          }
          mutation.mutate({
            report_template_id: templateId,
            output_format: values.output_format,
            requested_by: values.requested_by,
            filter_conditions: null,
          });
        }}
      />
    </div>
  );
}
