import { SELECT_CLASS } from "@/lib/form-utils";
import type { UseFormRegisterReturn } from "react-hook-form";

interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  registration?: UseFormRegisterReturn;
}

export function FormSelect({
  id,
  label,
  value,
  options,
  placeholder = "Select",
  disabled = false,
  error,
  onChange,
  registration,
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium tracking-[-0.01em] text-foreground">{label}</label>
      <select
        id={id}
        className={SELECT_CLASS}
        value={value}
        disabled={disabled}
        onChange={onChange}
        {...registration}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
