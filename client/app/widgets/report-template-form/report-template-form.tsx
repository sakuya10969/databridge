import { FormProvider, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { ReportFieldEditor } from "~/widgets/report-field-editor/report-field-editor";

const REPORT_TYPES = ["list", "single", "summary"] as const;
const OUTPUT_FORMATS = ["pdf", "xlsx", "csv"] as const;

interface ReportTemplateFormData {
  name: string;
  description: string;
  report_type: string;
  default_output_format: string;
  target_resource_type: string;
  fields: object[];
}

interface ReportTemplateFormProps {
  defaultValues?: Partial<ReportTemplateFormData>;
  onSubmit: (data: ReportTemplateFormData) => void;
  isSubmitting?: boolean;
}

export function ReportTemplateForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ReportTemplateFormProps) {
  const methods = useForm<ReportTemplateFormData>({
    defaultValues: {
      name: "",
      description: "",
      report_type: "list",
      default_output_format: "pdf",
      target_resource_type: "import_jobs",
      fields: [],
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">テンプレート名</label>
            <input
              {...methods.register("name", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ターゲットリソース</label>
            <input
              {...methods.register("target_resource_type")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">帳票種別</label>
            <select
              {...methods.register("report_type")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">デフォルト出力形式</label>
            <select
              {...methods.register("default_output_format")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {OUTPUT_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <input
              {...methods.register("description")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <ReportFieldEditor />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </form>
    </FormProvider>
  );
}
