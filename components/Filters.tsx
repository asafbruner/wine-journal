"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type FilterKey =
  | "type"
  | "country"
  | "region"
  | "grape"
  | "vintageFrom"
  | "vintageTo"
  | "ratingMin"
  | "ratingMax"
  | "priceMin"
  | "priceMax"
  | "label"
  | "ai";

const wineTypes = ["RED", "WHITE", "ROSE", "SPARKLING", "FORTIFIED", "ORANGE"] as const;
const ratingOptions = [90, 92, 94, 96, 98];

export function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const labelChecked = searchParams.get("label") === "true";
  const aiChecked = searchParams.get("ai") === "true";

  const startVintage = searchParams.get("vintageFrom");
  const endVintage = searchParams.get("vintageTo");

  const startDate = useMemo(() => (startVintage ? parseISO(`${startVintage}-01-01`) : undefined), [startVintage]);
  const endDate = useMemo(() => (endVintage ? parseISO(`${endVintage}-01-01`) : undefined), [endVintage]);

  const setParam = (key: FilterKey, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] space-y-4" align="start">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Wine type</p>
            <div className="grid grid-cols-2 gap-2">
              {wineTypes.map((type) => {
                const active = searchParams.get("type") === type;
                return (
                  <Button
                    key={type}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParam("type", active ? null : type)}
                  >
                    {type.toLowerCase()}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Minimum rating</p>
            <div className="flex flex-wrap gap-2">
              {ratingOptions.map((rating) => {
                const active = Number(searchParams.get("ratingMin") ?? "0") === rating;
                return (
                  <Button
                    key={rating}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParam("ratingMin", active ? null : String(rating))}
                  >
                    {rating}+
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Vintage range</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(!startDate && "text-muted-foreground")}
                onClick={() => setParam("vintageFrom", startVintage ? null : String(new Date().getFullYear() - 10))}
              >
                {startDate ? format(startDate, "yyyy") : "From"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(!endDate && "text-muted-foreground")}
                onClick={() => setParam("vintageTo", endVintage ? null : String(new Date().getFullYear()))}
              >
                {endDate ? format(endDate, "yyyy") : "To"}
              </Button>
            </div>
            <CalendarRange
              startDate={startDate}
              endDate={endDate}
              onRangeChange={(from, to) => {
                setParam("vintageFrom", from ? format(from, "yyyy") : null);
                setParam("vintageTo", to ? format(to, "yyyy") : null);
              }}
            />
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="label" checked={labelChecked} onCheckedChange={(checked) => setParam("label", checked ? "true" : null)} />
              <Label htmlFor="label" className="text-sm">Has label image</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ai" checked={aiChecked} onCheckedChange={(checked) => setParam("ai", checked ? "true" : null)} />
              <Label htmlFor="ai" className="text-sm">Has AI tags</Label>
            </div>
          </section>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              [
                "type",
                "country",
                "region",
                "grape",
                "vintageFrom",
                "vintageTo",
                "ratingMin",
                "ratingMax",
                "priceMin",
                "priceMax",
                "label",
                "ai",
              ].forEach((key) => params.delete(key));
              startTransition(() => router.replace(`${pathname}?${params.toString()}`));
            }}
          >
            Reset filters
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

type CalendarRangeProps = {
  startDate?: Date;
  endDate?: Date;
  onRangeChange: (start?: Date, end?: Date) => void;
};

function CalendarRange({ startDate, endDate, onRangeChange }: CalendarRangeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex w-full items-center justify-between">
          <span className="text-sm">
            {startDate && endDate
              ? `${format(startDate, "yyyy")} – ${format(endDate, "yyyy")}`
              : "Select range"}
          </span>
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <ScrollArea className="h-[360px] w-[300px]">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={(range) => onRangeChange(range?.from, range?.to)}
            initialFocus
            captionLayout="dropdown"
            numberOfMonths={1}
          />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}




