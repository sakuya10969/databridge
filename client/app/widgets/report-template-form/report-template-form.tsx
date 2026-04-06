import { FormProvider, useForm, Controller } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rt-name">テンプレート名</Label>
            <Input
              id="rt-name"
              {...methods.register("name", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rt-resource">ターゲットリソース</Label>
            <Input
              id="rt-resource"
              {...methods.register("target_resource_type")}
            />
          </div>
          <div className="space-y-2">
            <Label>帳票種別</Label>
            <Controller
              control={methods.control}
              name="report_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>デフォルト出力形式</Label>
            <Controller
              control={methods.control}
              name="default_output_format"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTPUT_FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rt-desc">説明</Label>
            <Input
              id="rt-desc"
              {...methods.register("description")}
            />
          </div>
        </div>

        <ReportFieldEditor />

        <Button type="submit" disabled={isSubmitting} className="min-w-40">
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </form>
    </FormProvider>
  );
}
