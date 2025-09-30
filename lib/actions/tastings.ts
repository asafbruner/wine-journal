"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"
import { tastingFormSchema, type TastingFormValues } from "@/lib/validation"
import { getCurrentSession } from "@/lib/auth"

export async function createTasting(values: TastingFormValues) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = tastingFormSchema.safeParse(values)
  if (!parsed.success) {
    throw new Error("Validation failed")
  }

  await prisma.tasting.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  revalidatePath("/tastings")
}

export async function updateTasting(id: string, values: TastingFormValues) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = tastingFormSchema.safeParse(values)
  if (!parsed.success) {
    throw new Error("Validation failed")
  }

  await prisma.tasting.update({
    where: { id, userId: session.user.id },
    data: parsed.data,
  })

  revalidatePath(`/tastings/${id}`)
  revalidatePath("/tastings")
}

export async function deleteTasting(id: string) {
  const session = await getCurrentSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await prisma.tasting.delete({ where: { id, userId: session.user.id } })
  revalidatePath("/tastings")
}
