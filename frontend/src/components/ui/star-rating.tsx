"use client";

import { Star } from "lucide-react";

import type { Review } from "@/types/vehicle";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

const SIZE_MAP: Record<string, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function StarRating({
  rating,
  onChange,
  disabled = false,
  size = "md",
  readOnly = false,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const canInteract = onChange && !disabled && !readOnly;

  const handleStarClick = (val: number) => {
    if (canInteract) {
      onChange(val);
    }
  };

  return (
    <div
      className="flex items-center gap-1"
      role="rating"
      aria-label={`Rating: ${rating} out of 5`}
    >
      {stars.map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => handleStarClick(val)}
          disabled={!canInteract}
          aria-label={String(val)}
          aria-pressed={val <= rating}
          className={`
            cursor-pointer transition-colors duration-200
            ${SIZE_MAP[size]}
            ${canInteract ? "hover:text-yellow-400" : ""}
            ${val <= rating ? "text-yellow-400" : "text-gray-300"}
          `}
        >
          <Star />
        </button>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm font-medium">{review.reviewer.userName}</div>
        <div className="flex items-center gap-1 text-sm text-yellow-500">
          {[1, 2, 3, 4, 5].map((val) => (
            <Star key={val} className={val <= review.rating ? "size-4 fill-yellow-400" : "size-4 text-gray-300"} />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        {new Date(review.createdAt).toLocaleDateString("en-IN")}
      </div>
    </div>
  );
}
