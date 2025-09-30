import { NextResponse } from "next/server"

import { extractLabelText } from "@/lib/ocr"
import { getCurrentSession } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`ocr-${session.user.id}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  const text = await extractLabelText(file)
  return NextResponse.json({ text })
}
