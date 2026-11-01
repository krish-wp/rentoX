import { describe, it, expect } from "vitest";

function calcDays(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
}

describe("calcDays", () => {
  it("returns 1 day for same day booking", () => {
    expect(calcDays("2026-11-05", "2026-11-05")).toBe(1);
  });

  it("returns 2 days for two day span", () => {
    expect(calcDays("2026-11-05", "2026-11-07")).toBe(2);
  });

  it("returns 5 days for a week booking", () => {
    expect(calcDays("2026-11-01", "2026-11-06")).toBe(5);
  });

  it("returns at least 1 even if end is before start", () => {
    expect(calcDays("2026-11-06", "2026-11-05")).toBe(1);
  });
});
