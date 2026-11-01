import { describe, it, expect } from "vitest";
import { formatPlateNumber } from "@/lib/form-utils";

describe("formatPlateNumber", () => {
  it("formats a standard Indian plate number", () => {
    expect(formatPlateNumber("MH01AB1234")).toBe("MH 01 AB 1234");
  });

  it("handles spaces in input", () => {
    expect(formatPlateNumber("MH 01 AB 1234")).toBe("MH 01 AB 1234");
  });

  it("uppercases lowercase input", () => {
    expect(formatPlateNumber("mh01ab1234")).toBe("MH 01 AB 1234");
  });

  it("handles partial plate numbers", () => {
    expect(formatPlateNumber("MH01")).toBe("MH 01");
  });

  it("handles empty string", () => {
    expect(formatPlateNumber("")).toBe("");
  });

  it("truncates to 10 characters", () => {
    expect(formatPlateNumber("MH01AB12345678")).toBe("MH 01 AB 1234");
  });
});
