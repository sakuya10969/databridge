import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { useCreateReportTemplate } from "~/features/report-template/hooks/use-report-templates";
import { ReportTemplateForm } from "~/widgets/report-template-form/report-template-form";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ReportTemplateNewPage() {
  const navigate = useNavigate();
  const mutation = useCreateReportTemplate();

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

      <div>
        <h1 className="text-2xl font-bold text-gray-900">帳票テンプレート作成</h1>
        <p className="mt-1 text-sm text-gray-500">新しい帳票テンプレートを作成します</p>
      </div>

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
