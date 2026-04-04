import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreateReportTemplate } from "~/features/report-template/hooks/use-report-templates";
import { ReportTemplateForm } from "~/widgets/report-template-form/report-template-form";

export default function ReportTemplateNewPage() {
  const navigate = useNavigate();
  const mutation = useCreateReportTemplate();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">帳票テンプレート作成</h1>
      <ReportTemplateForm
        isSubmitting={mutation.isPending}
        onSubmit={(data) =>
          mutation.mutate(
            { ...data, layout_definition: {}, operator: "anonymous" },
            {
              onSuccess: (template) => {
                toast.success("テンプレートを作成しました");
                navigate(`/report-templates/${template.id}`);
              },
              onError: (e) => toast.error(String(e)),
            }
          )
        }
      />
    </div>
  );
}
