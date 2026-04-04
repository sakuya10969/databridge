import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchReportTemplate } from "~/features/report-template/api/fetch-report-templates";
import { useUpdateReportTemplate, useDeleteReportTemplate } from "~/features/report-template/hooks/use-report-templates";
import { ReportTemplateForm } from "~/widgets/report-template-form/report-template-form";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";

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
  if (!template) return <p className="text-center py-20 text-gray-500">テンプレートが見つかりません</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/report-templates">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <p className="mt-1 text-sm text-gray-500">帳票テンプレートの編集・削除</p>
        </div>
        <Button
          variant="outline"
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
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-4 w-4" />
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
