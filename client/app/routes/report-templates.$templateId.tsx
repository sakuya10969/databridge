import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchReportTemplate } from "~/features/report-template/api/fetch-report-templates";
import { useUpdateReportTemplate, useDeleteReportTemplate } from "~/features/report-template/hooks/use-report-templates";
import { ReportTemplateForm } from "~/widgets/report-template-form/report-template-form";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Button } from "~/components/ui/button";

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

  if (isLoading) return <LoadingSpinner />;
  if (!template) return <p>テンプレートが見つかりません</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{template.name}</h1>
        <Button
          variant="outline"
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
          className="text-red-500"
        >
          削除
        </Button>
      </div>

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
    </div>
  );
}
