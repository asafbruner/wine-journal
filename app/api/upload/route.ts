import { NextResponse } from "next/server"

import { uploadImage } from "@/lib/storage"
import { getCurrentSession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  const url = await uploadImage(file, formData.get("filename")?.toString() ?? "label")
  return NextResponse.json({ url })
}



