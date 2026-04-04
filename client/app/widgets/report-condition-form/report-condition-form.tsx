import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";

const OUTPUT_FORMATS = ["pdf", "xlsx", "csv"] as const;

export interface ReportConditionFormValues {
  output_format: "pdf" | "xlsx" | "csv";
  requested_by: string;
}

interface ReportConditionFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ReportConditionFormValues) => void;
}

export function ReportConditionForm({
  isSubmitting,
  onSubmit,
}: ReportConditionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportConditionFormValues>({
    defaultValues: { output_format: "xlsx", requested_by: "anonymous" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          出力形式
        </label>
        <select
          {...register("output_format", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {OUTPUT_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          依頼者
        </label>
        <input
          {...register("requested_by", { required: "依頼者を入力してください" })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        {errors.requested_by && (
          <p className="text-red-500 text-xs mt-1">{errors.requested_by.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "作成中..." : "ジョブ作成"}
      </Button>
    </form>
  );
}
