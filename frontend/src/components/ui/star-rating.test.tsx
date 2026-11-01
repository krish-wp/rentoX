import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "@/components/ui/star-rating";

describe("StarRating", () => {
  it("renders 5 stars", () => {
    render(<StarRating rating={0} onChange={() => {}} />);
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("shows filled stars up to rating", () => {
    render(<StarRating rating={3} onChange={() => {}} readOnly />);
    const stars = screen.getAllByRole("button");
    // First 3 stars should be filled (text-yellow-400), last 2 should be gray
    expect(stars[0]).toHaveClass("text-yellow-400");
    expect(stars[1]).toHaveClass("text-yellow-400");
    expect(stars[2]).toHaveClass("text-yellow-400");
    expect(stars[3]).not.toHaveClass("text-yellow-400");
    expect(stars[4]).not.toHaveClass("text-yellow-400");
  });

  it("calls onChange with selected star value", () => {
    const onChange = vitest.fn();
    render(<StarRating rating={0} onChange={onChange} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[3]); // Click 4th star
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("is disabled when disabled prop is true", () => {
    render(<StarRating rating={0} disabled onChange={() => {}} />);
    const stars = screen.getAllByRole("button");
    stars.forEach((star) => {
      expect(star).toBeDisabled();
    });
  });

  it("is read-only when readOnly prop is true", () => {
    const onChange = vitest.fn();
    render(<StarRating rating={0} readOnly onChange={onChange} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has correct aria-label", () => {
    render(<StarRating rating={3} readOnly />);
    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveAttribute("aria-label", "1");
    expect(stars[2]).toHaveAttribute("aria-label", "3");
  });

  it("shows aria-pressed on selected stars", () => {
    render(<StarRating rating={2} readOnly />);
    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveAttribute("aria-pressed", "true");
    expect(stars[1]).toHaveAttribute("aria-pressed", "true");
    expect(stars[2]).toHaveAttribute("aria-pressed", "false");
  });
});
