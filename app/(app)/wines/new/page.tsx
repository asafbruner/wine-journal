import { redirect } from "next/navigation";

import { WineForm } from "@/components/forms/WineForm";
import { getCurrentSession } from "@/lib/auth";

export default async function NewWinePage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  async function handleSubmit() {
    "use server";
    // TODO: implement server action to create wine
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add a wine</h1>
        <p className="text-sm text-muted-foreground">
          Upload the label, add tasting notes, and enrich with AI insights.
        </p>
      </div>
      <WineForm onSubmit={handleSubmit} />
    </div>
  );
}




