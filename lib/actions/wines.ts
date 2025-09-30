"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"
import { wineFormSchema, type WineFormValues } from "@/lib/validation"
import { getCurrentSession } from "@/lib/auth"

export async function createWine(values: WineFormValues) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = wineFormSchema.safeParse(values)
  if (!parsed.success) {
    throw new Error("Validation failed")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { grapes, notes: _notes, ...wineData } = parsed.data;
  
  await prisma.wine.create({
    data: {
      name: wineData.name,
      producer: wineData.producer || null,
      regionId: wineData.regionId || null,
      country: wineData.country || null,
      appellation: wineData.appellation || null,
      vintage: wineData.vintage ?? null,
      type: wineData.type,
      abv: wineData.abv ?? null,
      price: wineData.price ?? null,
      rating: wineData.rating ?? null,
      labelImage: wineData.labelImage || null,
      userId: session.user.id,
      grapes: {
        create: grapes?.map((g) => ({
          grapeId: g.id,
          percent: g.percent ?? null,
        })) || [],
      },
    },
  })

  revalidatePath("/wines")
}

export async function updateWine(id: string, values: WineFormValues) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = wineFormSchema.safeParse(values)
  if (!parsed.success) {
    throw new Error("Validation failed")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { grapes, notes: _notes, ...wineData } = parsed.data;
  
  await prisma.wine.update({
    where: { id, userId: session.user.id },
    data: {
      name: wineData.name,
      producer: wineData.producer || null,
      regionId: wineData.regionId || null,
      country: wineData.country || null,
      appellation: wineData.appellation || null,
      vintage: wineData.vintage ?? null,
      type: wineData.type,
      abv: wineData.abv ?? null,
      price: wineData.price ?? null,
      rating: wineData.rating ?? null,
      labelImage: wineData.labelImage || null,
      grapes: {
        deleteMany: {},
        create: grapes?.map((g) => ({
          grapeId: g.id,
          percent: g.percent ?? null,
        })) || [],
      },
    },
  })

  revalidatePath(`/wines/${id}`)
  revalidatePath("/wines")
}

export async function deleteWine(id: string) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await prisma.wine.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/wines")
}
