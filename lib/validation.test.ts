import { describe, it, expect } from "vitest";
import { wineFormSchema, tastingFormSchema } from "./validation";

describe("wineFormSchema", () => {
  it("should validate minimal valid wine", () => {
    const data = {
      name: "Test Wine",
      type: "RED",
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject wine without name", () => {
    const data = {
      name: "",
      type: "RED",
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject wine with short name", () => {
    const data = {
      name: "A",
      type: "RED",
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject wine without type", () => {
    const data = {
      name: "Test Wine",
      type: "",
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should validate complete wine data", () => {
    const data = {
      name: "Château Margaux",
      producer: "Château Margaux",
      regionId: "region-123",
      country: "France",
      appellation: "Margaux",
      vintage: 2015,
      type: "RED",
      abv: 13.5,
      price: 500,
      rating: 98,
      grapes: [
        { id: "grape-1", name: "Cabernet Sauvignon", percent: 85 },
        { id: "grape-2", name: "Merlot", percent: 15 },
      ],
      labelImage: "https://example.com/image.jpg",
      notes: "Excellent wine",
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid vintage year", () => {
    const data = {
      name: "Test Wine",
      type: "RED",
      vintage: 1800,
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject future vintage (too far)", () => {
    const data = {
      name: "Test Wine",
      type: "RED",
      vintage: new Date().getFullYear() + 5,
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid ABV", () => {
    const data = {
      name: "Test Wine",
      type: "RED",
      abv: 30,
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid rating", () => {
    const data = {
      name: "Test Wine",
      type: "RED",
      rating: 45,
      grapes: [],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid grape percentage", () => {
    const data = {
      name: "Test Wine",
      type: "RED",
      grapes: [
        { id: "grape-1", name: "Cabernet Sauvignon", percent: 150 },
      ],
    };
    
    const result = wineFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("tastingFormSchema", () => {
  it("should validate minimal tasting", () => {
    const data = {
      wineId: "wine-123",
      date: new Date(),
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject tasting without wineId", () => {
    const data = {
      wineId: "",
      date: new Date(),
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should validate complete tasting data", () => {
    const data = {
      wineId: "wine-123",
      date: new Date(),
      appearance: "Deep ruby red",
      nose: "Black fruits, oak, vanilla",
      palate: "Full-bodied with firm tannins",
      conclusion: "Excellent wine with great aging potential",
      rating: 95,
      servingTemp: 18,
      decantTime: 60,
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid rating", () => {
    const data = {
      wineId: "wine-123",
      date: new Date(),
      rating: 30,
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid serving temperature", () => {
    const data = {
      wineId: "wine-123",
      date: new Date(),
      servingTemp: 40,
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid decant time", () => {
    const data = {
      wineId: "wine-123",
      date: new Date(),
      decantTime: 1000,
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should handle optional fields", () => {
    const data = {
      wineId: "wine-123",
      date: new Date(),
      appearance: "",
      nose: "",
      palate: "",
      conclusion: "",
    };
    
    const result = tastingFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
