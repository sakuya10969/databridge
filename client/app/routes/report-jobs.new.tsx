import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReportTemplates } from "~/features/report-template/hooks/use-report-templates";
import { createReportJob } from "~/features/report-job/api/report-job-api";
import { ReportConditionForm } from "~/widgets/report-condition-form/report-condition-form";
import type { ReportConditionFormValues } from "~/widgets/report-condition-form/report-condition-form";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { BackLink, PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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

  if (loadingTemplates) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }

  return (
    <PageContainer className="max-w-3xl">
      <BackLink to="/report-jobs">一覧に戻る</BackLink>
      <PageHeader
        eyebrow="Report Job"
        title="帳票出力ジョブ作成"
        description="テンプレートを選択して帳票出力ジョブを作成します。"
      />
      <SectionCard title="ジョブ設定" description="テンプレートと出力条件を指定してください。">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="template_select">帳票テンプレート</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template_select" className="w-full">
                <SelectValue placeholder="テンプレートを選択..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </SectionCard>
    </PageContainer>
  );
}
