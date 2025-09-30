import { z } from "zod"

type WineSearch = {
  type?: string
  ratingMin?: number
  label?: boolean
  ai?: boolean
}

const wineSearchSchema = z.object({
  type: z.string().optional(),
  ratingMin: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().min(0).max(100))
    .optional(),
  label: z
    .string()
    .transform((value) => value === "true")
    .optional(),
  ai: z
    .string()
    .transform((value) => value === "true")
    .optional(),
})

export function parseWineSearch(params: URLSearchParams): WineSearch {
  const parsed = wineSearchSchema.safeParse(Object.fromEntries(params))
  return parsed.success ? parsed.data : {}
}



