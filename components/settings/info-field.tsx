type InfoFieldProps = {
  label: string;
  value: string;
};

export function InfoField({
  label,
  value,
}: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-stone-500">
        {label}
      </label>

      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900">
        {value}
      </div>
    </div>
  );
}