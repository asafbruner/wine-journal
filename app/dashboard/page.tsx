import { cookies } from "next/headers";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const [recentWines, totalWines, totalTastings] = await Promise.all([
    prisma.wine.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        notes: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    }),
    prisma.wine.count({ where: { userId } }),
    prisma.tasting.count({ where: { userId } }),
  ]);

  return {
    recentWines,
    totalWines,
    totalTastings,
  };
}

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    cookies().delete("next-auth.session-token");
    cookies().delete("__Secure-next-auth.session-token");
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Session expired</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Please sign in again to continue exploring your Wine Journal.
              </p>
              <Link
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
                href="/signin"
              >
                Go to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total wines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.totalWines}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total tastings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.totalTastings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Last updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data.recentWines[0]?.createdAt
                ? new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(data.recentWines[0].createdAt)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recently added</h2>
          <Link className={buttonVariants({ variant: "outline" })} href="/wines">
            View all wines
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.recentWines.map((wine) => (
            <Card key={wine.id} className="border-border/60">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {wine.name} {wine.vintage ? `· ${wine.vintage}` : ""}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {[wine.producer, wine.regionId].filter(Boolean).join(" · ")}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {wine.notes[0]?.palate || "No tasting note yet."}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{wine.type}</span>
                  {wine.rating ? <span>• {wine.rating}/100</span> : null}
                </div>
              </CardContent>
            </Card>
          ))}
          {data.recentWines.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
                No wines yet. Start by adding your first bottle!
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}




