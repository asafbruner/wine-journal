import { describe, it, expect } from "vitest";
import { buildCsv } from "./csv";

describe("buildCsv", () => {
  it("should generate CSV with headers", () => {
    const rows = [
      { name: "Wine 1", price: 20, vintage: 2020 },
      { name: "Wine 2", price: 30, vintage: 2021 },
    ];
    
    const csv = buildCsv(rows);
    
    expect(csv).toContain("name,price,vintage");
    expect(csv).toContain("Wine 1,20,2020");
    expect(csv).toContain("Wine 2,30,2021");
  });

  it("should handle empty array", () => {
    const csv = buildCsv([]);
    // csv-stringify returns a newline for empty array
    expect(csv.trim()).toBe("");
  });

  it("should handle custom columns order", () => {
    const rows = [
      { name: "Wine 1", price: 20, vintage: 2020 },
    ];
    
    const csv = buildCsv(rows, { columns: ["vintage", "name", "price"] });
    
    expect(csv).toContain("vintage,name,price");
    expect(csv).toContain("2020,Wine 1,20");
  });

  it("should handle null and undefined values", () => {
    const rows = [
      { name: "Wine 1", price: null, vintage: undefined },
    ];
    
    const csv = buildCsv(rows);
    
    expect(csv).toContain("Wine 1");
  });

  it("should handle special characters", () => {
    const rows = [
      { name: 'Wine "Special"', notes: "With, comma" },
    ];
    
    const csv = buildCsv(rows);
    
    expect(csv).toContain('"Wine ""Special"""');
    expect(csv).toContain('"With, comma"');
  });

  it("should handle boolean values", () => {
    const rows = [
      { name: "Wine 1", hasLabel: true, hasAI: false },
    ];
    
    const csv = buildCsv(rows);
    
    // csv-stringify converts true to "1" and false to empty string
    expect(csv).toContain("1");
    expect(csv).toContain("hasAI");
  });
});
