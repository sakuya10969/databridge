import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useTemplates, useCreateTemplate } from "~/features/template/hooks/use-templates";
import { DataTable } from "~/shared/ui/data-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Button } from "~/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { Template } from "~/entities/template/types";
import { formatDate } from "~/shared/utils/format-date";

const columns: ColumnDef<Template, unknown>[] = [
  {
    accessorKey: "name",
    header: "テンプレート名",
    cell: ({ row }) => (
      <Link to={`/templates/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "target_table", header: "ターゲットテーブル" },
  { accessorKey: "description", header: "説明" },
  {
    accessorKey: "created_at",
    header: "作成日時",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];

export default function TemplatesPage() {
  const { data, isLoading } = useTemplates();
  const createMutation = useCreateTemplate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", target_table: "", description: "" });

  const templates = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Importテンプレート</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "キャンセル" : "テンプレート作成"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(
              { ...form, column_definitions: [], operator: "anonymous" },
              {
                onSuccess: () => { toast.success("テンプレートを作成しました"); setShowForm(false); },
                onError: (err) => toast.error(String(err)),
              }
            );
          }}
          className="border rounded-md p-4 space-y-3 bg-gray-50"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">テンプレート名</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ターゲットテーブル</label>
            <input
              value={form.target_table}
              onChange={(e) => setForm({ ...form, target_table: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "作成中..." : "作成"}
          </Button>
        </form>
      )}

      {isLoading && <LoadingSpinner />}
      {!isLoading && templates.length === 0 && (
        <EmptyState title="テンプレートがありません" description="テンプレートを作成してください" />
      )}
      {templates.length > 0 && <DataTable columns={columns} data={templates} />}
    </div>
  );
}
