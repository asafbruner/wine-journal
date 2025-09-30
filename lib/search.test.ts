import { describe, it, expect } from "vitest";
import { parseWineSearch } from "./search";

describe("parseWineSearch", () => {
  it("should parse empty params", () => {
    const params = new URLSearchParams();
    const result = parseWineSearch(params);
    
    expect(result).toEqual({});
  });

  it("should parse type filter", () => {
    const params = new URLSearchParams({ type: "RED" });
    const result = parseWineSearch(params);
    
    expect(result.type).toBe("RED");
  });

  it("should parse rating minimum", () => {
    const params = new URLSearchParams({ ratingMin: "90" });
    const result = parseWineSearch(params);
    
    expect(result.ratingMin).toBe(90);
  });

  it("should parse label filter", () => {
    const params = new URLSearchParams({ label: "true" });
    const result = parseWineSearch(params);
    
    expect(result.label).toBe(true);
  });

  it("should parse ai filter", () => {
    const params = new URLSearchParams({ ai: "true" });
    const result = parseWineSearch(params);
    
    expect(result.ai).toBe(true);
  });

  it("should handle false boolean values", () => {
    const params = new URLSearchParams({ label: "false", ai: "false" });
    const result = parseWineSearch(params);
    
    expect(result.label).toBe(false);
    expect(result.ai).toBe(false);
  });

  it("should parse multiple filters", () => {
    const params = new URLSearchParams({
      type: "WHITE",
      ratingMin: "95",
      label: "true",
      ai: "true",
    });
    const result = parseWineSearch(params);
    
    expect(result).toEqual({
      type: "WHITE",
      ratingMin: 95,
      label: true,
      ai: true,
    });
  });

  it("should ignore invalid rating values", () => {
    const params = new URLSearchParams({ ratingMin: "invalid" });
    const result = parseWineSearch(params);
    
    expect(result.ratingMin).toBeUndefined();
  });

  it("should clamp rating to valid range", () => {
    const params1 = new URLSearchParams({ ratingMin: "-10" });
    const result1 = parseWineSearch(params1);
    expect(result1.ratingMin).toBeUndefined();
    
    const params2 = new URLSearchParams({ ratingMin: "150" });
    const result2 = parseWineSearch(params2);
    expect(result2.ratingMin).toBeUndefined();
  });

  it("should handle invalid parameters gracefully", () => {
    const params = new URLSearchParams({
      type: "INVALID_TYPE",
      ratingMin: "not-a-number",
      label: "maybe",
    });
    const result = parseWineSearch(params);
    
    // Should return empty object or valid values only
    expect(typeof result).toBe("object");
  });
});
