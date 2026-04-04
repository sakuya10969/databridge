import { useFieldArray, useFormContext, Controller } from "react-hook-form";
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
        <h3 className="text-sm font-medium">フィールド定義</h3>
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
        >
          フィールド追加
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">フィールドがありません</p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">フィールドキー</Label>
                <Input
                  {...register(`fields.${index}.field_key`)}
                  placeholder="field_key"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ラベル</Label>
                <Input
                  {...register(`fields.${index}.label`)}
                  placeholder="表示名"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ソースパス</Label>
                <Input
                  {...register(`fields.${index}.source_path`)}
                  placeholder="column_name"
                  className="h-7 text-xs"
                />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="space-y-1">
                <Label className="text-xs">書式タイプ</Label>
                <Controller
                  control={control}
                  name={`fields.${index}.format_type`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger className="h-7 w-36 text-xs">
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
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive ml-auto"
              >
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
