// Stub until data-staging-import provides real template API
interface TemplateSelectorProps {
  value?: string;
  onChange: (templateId: string | undefined) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">テンプレート:</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="">テンプレートなし</option>
        {/* Templates will be loaded dynamically after data-staging-import is implemented */}
      </select>
    </div>
  );
}
