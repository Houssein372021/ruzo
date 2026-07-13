import { Star } from "lucide-react";

type StarRatingProps = {
  value: number;
  size?: number;
  className?: string;
};

export function StarRating({ value, size = 14, className = "" }: StarRatingProps) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star - 0.25;
        const half = !filled && value >= star - 0.75;

        return (
          <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-[#080808]/20" style={{ width: size, height: size }} />
            {filled || half ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: half ? size / 2 : size }}>
                <Star className="fill-[#6B0F1A] text-[#6B0F1A]" style={{ width: size, height: size }} />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

type InteractiveStarsProps = {
  value: number;
  onChange: (value: number) => void;
};

export function InteractiveStars({ value, onChange }: InteractiveStarsProps) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} stars`}
          className="transition hover:scale-110"
          onClick={() => onChange(star)}
        >
          <Star
            className={
              star <= value ? "h-5 w-5 fill-[#6B0F1A] text-[#6B0F1A]" : "h-5 w-5 text-[#080808]/25"
            }
          />
        </button>
      ))}
    </div>
  );
}
