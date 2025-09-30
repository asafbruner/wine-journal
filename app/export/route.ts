import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { buildCsv } from "@/lib/csv"
import { getCurrentSession } from "@/lib/auth"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [wines, tastings] = await Promise.all([
    prisma.wine.findMany({
      where: { userId: session.user.id },
      include: {
        region: true,
        grapes: { include: { grape: true } },
      },
    }),
    prisma.tasting.findMany({
      where: { userId: session.user.id },
      include: {
        wine: true,
      },
    }),
  ])

  const wineRows = wines.map((wine) => ({
    id: wine.id,
    name: wine.name,
    producer: wine.producer ?? "",
    country: wine.country ?? "",
    region: wine.region?.name ?? "",
    vintage: wine.vintage ?? "",
    type: wine.type,
    rating: wine.rating ?? "",
    price: wine.price ?? "",
    grapes: wine.grapes.map((g) => g.grape.name).join(", "),
  }))

  const tastingRows = tastings.map((tasting) => ({
    id: tasting.id,
    wine: tasting.wine.name,
    date: tasting.date.toISOString(),
    rating: tasting.rating ?? "",
    appearance: tasting.appearance ?? "",
    nose: tasting.nose ?? "",
    palate: tasting.palate ?? "",
    conclusion: tasting.conclusion ?? "",
  }))

  const boundary = `----wine-journal-${Date.now()}`

  const wineCsv = buildCsv(wineRows)
  const tastingCsv = buildCsv(tastingRows)

  const body = `--${boundary}\r\n` +
    "Content-Type: text/csv\r\n" +
    "Content-Disposition: attachment; filename=\"wines.csv\"\r\n\r\n" +
    wineCsv +
    `\r\n--${boundary}\r\n` +
    "Content-Type: text/csv\r\n" +
    "Content-Disposition: attachment; filename=\"tastings.csv\"\r\n\r\n" +
    tastingCsv +
    `\r\n--${boundary}--`

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": `multipart/mixed; boundary=${boundary}`,
      "Content-Disposition": "attachment; filename=wine-journal-export.zip",
    },
  })
}



