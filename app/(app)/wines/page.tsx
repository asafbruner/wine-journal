import { Suspense } from "react";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Filters } from "@/components/Filters";
import { WineCard } from "@/components/WineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { parseWineSearch } from "@/lib/search";

export const dynamic = "force-dynamic";

async function loadWines(userId: string, searchParams: URLSearchParams) {
  const filters = parseWineSearch(searchParams);
  const wines = await prisma.wine.findMany({
    where: {
      userId,
      type: filters.type,
      rating: filters.ratingMin
        ? {
            gte: filters.ratingMin,
          }
        : undefined,
      labelImage: filters.label ? { not: null } : undefined,
      aiTags: filters.ai ? { not: "[]" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: {
      region: true,
      notes: {
        orderBy: { date: "desc" },
        take: 1,
      },
      grapes: {
        include: {
          grape: true,
        },
      },
    },
  });

  return wines;
}

export default async function WinesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value);
    }
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your wines</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage all bottles in your cellar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link className={buttonVariants({ variant: "outline" })} href="/export">
            Export CSV
          </Link>
          <Link className={buttonVariants({ size: "sm" })} href="/wines/new">
            Add wine
          </Link>
        </div>
      </header>
      <Filters />
      <Suspense fallback={<WinesSkeleton />}>
        <WinesGrid userId={session.user.id} searchParams={query} />
      </Suspense>
    </div>
  );
}

async function WinesGrid({ userId, searchParams }: { userId: string; searchParams: URLSearchParams }) {
  const wines = await loadWines(userId, searchParams);

  if (wines.length === 0) {
    return (
      <div className="grid h-48 place-items-center rounded-lg border border-dashed text-muted-foreground">
        No wines found. Try adjusting filters or add a new bottle.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {wines.map((wine) => (
        <WineCard key={wine.id} wine={wine} />
      ))}
    </div>
  );
}

function WinesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-5">
          <Skeleton className="h-40 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

