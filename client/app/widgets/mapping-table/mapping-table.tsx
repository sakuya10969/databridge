import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import type { MappingFormItem } from "~/features/mapping/types";

interface MappingTableProps {
  sourceColumns: string[];
  onSave: (mappings: MappingFormItem[]) => void;
  isSaving?: boolean;
}

const DATA_TYPES = ["str", "int", "float", "datetime", "bool"] as const;

export function MappingTable({ sourceColumns, onSave, isSaving }: MappingTableProps) {
  const { register, control, handleSubmit } = useForm<{ mappings: MappingFormItem[] }>({
    defaultValues: {
      mappings: sourceColumns.map((col) => ({
        source_column: col,
        target_column: col,
        data_type: "str",
        nullable: true,
        is_unique: false,
        pattern: "",
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "mappings" });

  return (
    <form onSubmit={handleSubmit((data) => onSave(data.mappings))}>
      <div className="overflow-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">ソース列名</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">ターゲット列名</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">データ型</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">NULL許可</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">一意</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">パターン</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="border-t">
                <td className="px-3 py-2 text-gray-700">{field.source_column}</td>
                <td className="px-3 py-2">
                  <input
                    {...register(`mappings.${index}.target_column`)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    {...register(`mappings.${index}.data_type`)}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    {DATA_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" {...register(`mappings.${index}.nullable`)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" {...register(`mappings.${index}.is_unique`)} />
                </td>
                <td className="px-3 py-2">
                  <input
                    {...register(`mappings.${index}.pattern`)}
                    placeholder="正規表現"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "保存中..." : "マッピングを保存"}
        </Button>
      </div>
    </form>
  );
}
