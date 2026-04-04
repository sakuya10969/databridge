import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ソース列名</TableHead>
              <TableHead>ターゲット列名</TableHead>
              <TableHead>データ型</TableHead>
              <TableHead className="text-center">NULL許可</TableHead>
              <TableHead className="text-center">一意</TableHead>
              <TableHead>パターン</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="text-muted-foreground">{field.source_column}</TableCell>
                <TableCell>
                  <Input
                    {...register(`mappings.${index}.target_column`)}
                    className="h-7 text-xs"
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    control={control}
                    name={`mappings.${index}.data_type`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DATA_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Controller
                    control={control}
                    name={`mappings.${index}.nullable`}
                    render={({ field: f }) => (
                      <Checkbox
                        checked={f.value}
                        onCheckedChange={f.onChange}
                      />
                    )}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Controller
                    control={control}
                    name={`mappings.${index}.is_unique`}
                    render={({ field: f }) => (
                      <Checkbox
                        checked={f.value}
                        onCheckedChange={f.onChange}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`mappings.${index}.pattern`)}
                    placeholder="正規表現"
                    className="h-7 text-xs"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "保存中..." : "マッピングを保存"}
        </Button>
      </div>
    </form>
  );
}
