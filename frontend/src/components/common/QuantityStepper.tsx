import { Minus, Plus } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  variant?: "default" | "product";
  onChange: (value: number) => void;
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  variant = "default",
  onChange,
}: QuantityStepperProps) {
  const { t } = useI18n();
  const dimensions =
    variant === "product" ? "h-[52px] grid-cols-[40px_42px_40px]" : "h-11 grid-cols-[44px_48px_44px]";

  return (
    <div className={`inline-grid ${dimensions} border border-[#d8cbbd] bg-white`}>
      <button
        type="button"
        aria-label={t("decreaseQuantity")}
        className="grid place-items-center transition hover:bg-[#F8F4EC]"
        onClick={() => onChange(Math.max(value - 1, min))}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="grid place-items-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        aria-label={t("increaseQuantity")}
        className="grid place-items-center transition hover:bg-[#F8F4EC]"
        onClick={() => onChange(Math.min(value + 1, max))}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
