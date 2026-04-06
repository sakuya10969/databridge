import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchReportTemplate } from "~/features/report-template/api/fetch-report-templates";
import { useUpdateReportTemplate, useDeleteReportTemplate } from "~/features/report-template/hooks/use-report-templates";
import { ReportTemplateForm } from "~/widgets/report-template-form/report-template-form";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Button } from "~/components/ui/button";
import { BackLink, PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Trash2 } from "lucide-react";

export default function ReportTemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const { data: template, isLoading } = useQuery({
    queryKey: ["report-template", templateId],
    queryFn: () => fetchReportTemplate(templateId!),
    enabled: !!templateId,
  });

  const updateMutation = useUpdateReportTemplate(templateId!);
  const deleteMutation = useDeleteReportTemplate();

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!template) return <p className="py-20 text-center text-muted-foreground">テンプレートが見つかりません</p>;

  return (
    <PageContainer className="max-w-4xl">
      <BackLink to="/report-templates">一覧に戻る</BackLink>

      <PageHeader
        eyebrow="Report Template"
        title={template.name}
        description="帳票テンプレートの編集・削除"
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              deleteMutation.mutate(
                { id: templateId!, operator: "anonymous" },
                {
                  onSuccess: () => {
                    toast.success("テンプレートを削除しました");
                    navigate("/report-templates");
                  },
                  onError: (e) => toast.error(String(e)),
                }
              )
            }
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </Button>
        }
      />

      <SectionCard title="テンプレート編集" description="テンプレート内容を更新します。">
        <ReportTemplateForm
          defaultValues={{
            name: template.name,
            description: template.description ?? "",
            report_type: template.report_type,
            default_output_format: template.default_output_format,
            target_resource_type: template.target_resource_type,
            fields: template.fields,
          }}
          isSubmitting={updateMutation.isPending}
          onSubmit={(data) =>
            updateMutation.mutate(
              { ...data, layout_definition: template.layout_definition, operator: "anonymous" },
              {
                onSuccess: () => toast.success("テンプレートを更新しました"),
                onError: (e) => toast.error(String(e)),
              }
            )
          }
        />
      </SectionCard>
    </PageContainer>
  );
}
