import { z } from "zod"
import OpenAI from "openai"

export type AISummary = {
  summary: string
  tags: string[]
  foodPairings: string[]
}

const responseSchema = z.object({
  summary: z.string(),
  tags: z.array(z.string()).max(8),
  foodPairings: z.array(z.string()).max(6),
})

const systemPrompt = `You are a WSET-trained sommelier assistant. Based on the provided wine details and tasting notes, produce:
- summary: concise overview (2-3 sentences)
- tags: sensory descriptors in lowercase, kebab-case when useful
- foodPairings: thoughtful pairing suggestions
Only rely on provided data; do not invent facts.`

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type AIInput = {
  name: string
  producer?: string
  region?: string
  country?: string
  appellation?: string
  vintage?: number
  grapes?: string[]
  tastingNotes?: string
  ocrText?: string
}

export async function generateAISummary(input: AIInput): Promise<AISummary> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt + "\nRespond with valid JSON only." },
      { role: "user", content: JSON.stringify(input, null, 2) },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response from AI")
  }

  return responseSchema.parse(JSON.parse(content))
}



