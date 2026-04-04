import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";

const FORMAT_TYPES = [
  "string", "integer", "decimal", "date", "datetime", "currency", "percentage",
] as const;

export function ReportFieldEditor() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">フィールド定義</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              field_key: "",
              label: "",
              source_path: "",
              format_type: "string",
              is_required: true,
            })
          }
        >
          フィールド追加
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-400">フィールドがありません</p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-md p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-500">フィールドキー</label>
              <input
                {...register(`fields.${index}.field_key`)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="field_key"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">ラベル</label>
              <input
                {...register(`fields.${index}.label`)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="表示名"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">ソースパス</label>
              <input
                {...register(`fields.${index}.source_path`)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="column_name"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-gray-500">書式タイプ</label>
              <select
                {...register(`fields.${index}.format_type`)}
                className="border rounded px-2 py-1 text-sm"
              >
                {FORMAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <input type="checkbox" {...register(`fields.${index}.is_required`)} />
              <label className="text-xs text-gray-500">必須</label>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => remove(index)}
              className="mt-4 text-red-500 hover:text-red-700"
            >
              削除
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
