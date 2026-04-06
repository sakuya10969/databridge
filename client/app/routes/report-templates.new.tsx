import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { useCreateReportTemplate } from "~/features/report-template/hooks/use-report-templates";
import { ReportTemplateForm } from "~/widgets/report-template-form/report-template-form";
import { BackLink, PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";

export default function ReportTemplateNewPage() {
  const navigate = useNavigate();
  const mutation = useCreateReportTemplate();

  return (
    <PageContainer className="max-w-4xl">
      <BackLink to="/report-templates">一覧に戻る</BackLink>

      <PageHeader
        eyebrow="Report Template"
        title="帳票テンプレート作成"
        description="新しい帳票テンプレートを作成します。"
      />

      <SectionCard title="テンプレート定義" description="帳票種別、出力形式、対象リソース、フィールドを設定します。">
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
      </SectionCard>
    </PageContainer>
  );
}
