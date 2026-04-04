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
    <div className="flex items-center gap-3">
      <Label>テンプレート:</Label>
      <Select
        value={value ?? "none"}
        onValueChange={(v) => onChange(v === "none" ? undefined : v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">テンプレートなし</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
