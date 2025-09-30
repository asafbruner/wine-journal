import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentSession } from "@/lib/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-20">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Wine Journal</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to access your cellar, tasting notes, and AI-powered insights.
          </p>
        </header>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}




