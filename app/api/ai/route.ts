import { NextResponse } from "next/server"

import { generateAISummary } from "@/lib/ai"
import { getCurrentSession } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`ai-${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await request.json()
  const summary = await generateAISummary(body)
  return NextResponse.json(summary)
}
