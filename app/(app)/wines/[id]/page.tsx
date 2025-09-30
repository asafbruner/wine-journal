import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { WineForm } from "@/components/forms/WineForm";

type Params = {
  params: {
    id: string;
  };
};

export default async function EditWinePage({ params }: Params) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const wine = await prisma.wine.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      grapes: {
        include: {
          grape: true,
        },
      },
    },
  });

  if (!wine) {
    notFound();
  }

  async function handleSubmit() {
    "use server";
    // TODO: implement update action
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit wine</h1>
        <p className="text-sm text-muted-foreground">Update tasting notes, upload new labels, and adjust AI insights.</p>
      </div>
      <WineForm
        onSubmit={handleSubmit}
        defaultValues={{
          name: wine.name,
          producer: wine.producer ?? "",
          country: wine.country ?? "",
          regionId: wine.regionId ?? "",
          appellation: wine.appellation ?? "",
          vintage: wine.vintage ?? undefined,
          type: wine.type,
          abv: wine.abv ?? undefined,
          price: wine.price ?? undefined,
          rating: wine.rating ?? undefined,
          grapes: wine.grapes.map((g) => ({
            id: g.grapeId,
            name: g.grape.name,
            percent: g.percent ?? undefined,
          })),
          notes: "",
        }}
      />
    </div>
  );
}




