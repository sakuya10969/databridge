import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useTemplates, useCreateTemplate } from "~/features/template/hooks/use-templates";
import { DataTable } from "~/shared/ui/data-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import type { Template } from "~/entities/template/types";
import { formatDate } from "~/shared/utils/format-date";
import { Plus, X } from "lucide-react";

const columns: ColumnDef<Template, unknown>[] = [
  {
    accessorKey: "name",
    header: "テンプレート名",
    cell: ({ row }) => (
      <Link to={`/templates/${row.original.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importテンプレート</h1>
          <p className="mt-1 text-sm text-gray-500">列マッピング・バリデーション設定の再利用テンプレート</p>
        </div>
        <Button
          variant={showForm ? "outline" : "default"}
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          {showForm ? <><X className="h-4 w-4" />キャンセル</> : <><Plus className="h-4 w-4" />テンプレート作成</>}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base">テンプレート作成</CardTitle>
            <CardDescription>新しいImportテンプレートを作成します</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(
                  { ...form, column_definitions: [], operator: "anonymous" },
                  {
                    onSuccess: () => {
                      toast.success("テンプレートを作成しました");
                      setShowForm(false);
                      setForm({ name: "", target_table: "", description: "" });
                    },
                    onError: (err) => toast.error(String(err)),
                  }
                );
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="tmpl-name">テンプレート名</Label>
                <Input
                  id="tmpl-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="例: 顧客マスタ取り込み"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tmpl-table">ターゲットテーブル</Label>
                <Input
                  id="tmpl-table"
                  value={form.target_table}
                  onChange={(e) => setForm({ ...form, target_table: e.target.value })}
                  required
                  placeholder="例: customers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tmpl-desc">説明</Label>
                <Input
                  id="tmpl-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="テンプレートの説明（任意）"
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "作成中..." : "作成"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}
      {!isLoading && templates.length === 0 && (
        <EmptyState title="テンプレートがありません" description="テンプレートを作成してください" />
      )}
      {templates.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <DataTable columns={columns} data={templates} />
        </Card>
      )}
    </div>
  );
}
