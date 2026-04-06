import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface TemplateSelectorProps {
  value?: string;
  onChange: (templateId: string | undefined) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="rounded-xl border border-[#162038] bg-[rgba(11,19,38,0.56)] px-4 py-4">
      <div className="mb-3">
        <Label>テンプレート</Label>
        <p className="mt-2 text-sm text-muted-foreground">
          保存済みの Import テンプレートが利用できる場合はここで選択します。
        </p>
      </div>
      <Select
        value={value ?? "none"}
        onValueChange={(v) => onChange(v === "none" ? undefined : v)}
      >
        <SelectTrigger className="w-full max-w-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">テンプレートなし</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
