import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const FORMAT_TYPES = [
  "string", "integer", "decimal", "date", "datetime", "currency", "percentage",
] as const;

export function ReportFieldEditor() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">フィールド定義</h3>
          <p className="mt-1 text-xs text-muted-foreground">帳票出力に含めるフィールドと型を定義します。</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              field_key: "",
              label: "",
              source_path: "",
              format_type: "string",
              is_required: true,
            })
          }
          className="gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          フィールド追加
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-[rgba(11,19,38,0.56)] px-4 py-6 text-sm text-muted-foreground">
          フィールドがありません
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="bg-[rgba(17,27,51,0.82)]">
          <CardContent className="space-y-4 pt-1">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">フィールドキー</Label>
                <Input
                  {...register(`fields.${index}.field_key`)}
                  placeholder="field_key"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">ラベル</Label>
                <Input
                  {...register(`fields.${index}.label`)}
                  placeholder="表示名"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">ソースパス</Label>
                <Input
                  {...register(`fields.${index}.source_path`)}
                  placeholder="column_name"
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label className="text-xs">書式タイプ</Label>
                <Controller
                  control={control}
                  name={`fields.${index}.format_type`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger size="sm" className="w-40 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Controller
                  control={control}
                  name={`fields.${index}.is_required`}
                  render={({ field: f }) => (
                    <Checkbox
                      id={`is_required_${index}`}
                      checked={f.value}
                      onCheckedChange={f.onChange}
                    />
                  )}
                />
                <Label htmlFor={`is_required_${index}`} className="text-xs">必須</Label>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
                className="ml-auto gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
