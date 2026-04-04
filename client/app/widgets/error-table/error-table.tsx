import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/shared/ui/data-table";
import type { ImportError } from "~/entities/error/types";

const ERROR_TYPE_LABELS: Record<string, string> = {
  type_error: "型エラー",
  required_error: "必須エラー",
  unique_error: "重複エラー",
  pattern_error: "形式エラー",
  range_error: "範囲エラー",
  unknown_error: "不明",
};

const columns: ColumnDef<ImportError, unknown>[] = [
  { accessorKey: "row_number", header: "行番号" },
  { accessorKey: "column_name", header: "列名" },
  {
    accessorKey: "error_type",
    header: "エラー種別",
    cell: ({ getValue }) => ERROR_TYPE_LABELS[getValue() as string] ?? getValue() as string,
  },
  { accessorKey: "actual_value", header: "実際の値" },
  { accessorKey: "expected_value", header: "期待値" },
  { accessorKey: "message", header: "メッセージ" },
];

interface ErrorTableProps {
  errors: ImportError[];
}

export function ErrorTable({ errors }: ErrorTableProps) {
  return <DataTable columns={columns} data={errors} />;
}
