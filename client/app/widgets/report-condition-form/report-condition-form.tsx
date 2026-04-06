import { useForm, Controller } from "react-hook-form";
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

const OUTPUT_FORMATS = [
  { value: "pdf", label: "PDF (.pdf)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV (.csv)" },
] as const;

export interface ReportConditionFormValues {
  output_format: "pdf" | "xlsx" | "csv";
  requested_by: string;
}

interface ReportConditionFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ReportConditionFormValues) => void;
}

export function ReportConditionForm({ isSubmitting, onSubmit }: ReportConditionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportConditionFormValues>({
    defaultValues: { output_format: "xlsx", requested_by: "anonymous" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>出力形式</Label>
        <Controller
          control={control}
          name="output_format"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requested_by">依頼者</Label>
        <Input
          id="requested_by"
          {...register("requested_by", { required: "依頼者を入力してください" })}
        />
        {errors.requested_by && (
          <p className="text-xs text-destructive">{errors.requested_by.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="min-w-40">
        {isSubmitting ? "作成中..." : "ジョブ作成"}
      </Button>
    </form>
  );
}
