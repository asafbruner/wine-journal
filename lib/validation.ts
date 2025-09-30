import { z } from "zod";

export const wineFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  producer: z.string().optional().or(z.literal("")),
  regionId: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  appellation: z.string().optional().or(z.literal("")),
  vintage: z
    .number({ invalid_type_error: "Vintage must be a year" })
    .int()
    .min(1900, "Vintage too old")
    .max(new Date().getFullYear() + 2, "Vintage too far in future")
    .nullable()
    .optional(),
  type: z.string().min(1, "Select a type"),
  abv: z.number().min(0).max(25).nullable().optional(),
  price: z.number().min(0).max(10000).nullable().optional(),
  rating: z.number().min(50).max(100).nullable().optional(),
  grapes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    percent: z.number().min(0).max(100).nullable().optional(),
  })),
  labelImage: z.string().url().nullable().optional(),
  notes: z.string().max(10_000).optional().or(z.literal("")),
});

export type WineFormValues = z.infer<typeof wineFormSchema>;

export const tastingFormSchema = z.object({
  wineId: z.string().min(1, "Select a wine"),
  date: z.date(),
  appearance: z.string().max(5_000).optional().or(z.literal("")),
  nose: z.string().max(5_000).optional().or(z.literal("")),
  palate: z.string().max(5_000).optional().or(z.literal("")),
  conclusion: z.string().max(5_000).optional().or(z.literal("")),
  rating: z.number().min(50).max(100).nullable().optional(),
  servingTemp: z.number().min(0).max(30).nullable().optional(),
  decantTime: z.number().min(0).max(600).nullable().optional(),
});

export type TastingFormValues = z.infer<typeof tastingFormSchema>;

