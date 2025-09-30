import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", true && "conditional", false && "excluded");
    expect(result).toBe("base conditional");
  });

  it("should handle undefined and null", () => {
    const result = cn("base", undefined, null, "valid");
    expect(result).toBe("base valid");
  });

  it("should merge tailwind classes correctly", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle arrays", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
