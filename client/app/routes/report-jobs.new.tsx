import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReportTemplates } from "~/features/report-template/hooks/use-report-templates";
import { createReportJob } from "~/features/report-job/api/report-job-api";
import { ReportConditionForm } from "~/widgets/report-condition-form/report-condition-form";
import type { ReportConditionFormValues } from "~/widgets/report-condition-form/report-condition-form";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft } from "lucide-react";

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
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/report-jobs">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">帳票出力ジョブ作成</h1>
        <p className="mt-1 text-sm text-gray-500">テンプレートを選択して帳票出力ジョブを作成します</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">ジョブ設定</CardTitle>
          <CardDescription>テンプレートと出力条件を指定してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
        </CardContent>
      </Card>
    </div>
  );
}
