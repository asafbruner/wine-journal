import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { type Prisma } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/rating";

type WineWithRelations = Prisma.WineGetPayload<{
  include: {
    region: true;
    notes: { take: 1; orderBy: { date: "desc" } };
    grapes: { include: { grape: true } };
  };
}>;

type WineCardProps = {
  wine: WineWithRelations;
  className?: string;
};

export function WineCard({ wine, className }: WineCardProps) {
  const firstNote = wine.notes[0];
  const grapeList = wine.grapes.map((entry) => entry.grape.name).slice(0, 4);
  const tags = safeParseJson<string[]>(wine.aiTags) ?? [];

  return (
    <Card className={cn("group h-full overflow-hidden", className)}>
      <Link href={`/wines/${wine.id}`} className="block">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">
                {wine.name}
                {wine.vintage ? <span className="text-muted-foreground"> · {wine.vintage}</span> : null}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {[wine.producer, wine.region?.name, wine.country].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Rating value={wine.rating ?? undefined} />
          </div>
          {wine.labelImage ? (
            <div className="relative h-40 overflow-hidden rounded-md border bg-muted">
              <Image
                src={wine.labelImage}
                alt={`${wine.name} label`}
                fill
                className="object-cover transition-all group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No label uploaded
            </div>)
          }
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {firstNote?.palate ?? firstNote?.nose ?? "No tasting note yet."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {wine.type && <Badge variant="outline">{wine.type.toLowerCase()}</Badge>}
            {grapeList.map((grape) => (
              <Badge key={grape} variant="secondary">
                {grape}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Link>
      {tags.length ? (
        <CardFooter>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 6).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function safeParseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON", error);
    return null;
  }
}




