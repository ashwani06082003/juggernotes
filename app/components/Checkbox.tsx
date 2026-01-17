export default function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 mb-4 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-600"
      />
      <span>{label}</span>
    </label>
  );
}