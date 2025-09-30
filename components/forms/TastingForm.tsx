"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type TastingFormValues, tastingFormSchema } from "@/lib/validation";

type TastingFormProps = {
  wines: Array<{ id: string; name: string; vintage: number | null }>;
  defaultValues?: Partial<TastingFormValues>;
  onSubmit: (values: TastingFormValues) => Promise<void>;
};

export function TastingForm({ wines, defaultValues, onSubmit }: TastingFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TastingFormValues>({
    resolver: zodResolver(tastingFormSchema),
    defaultValues: {
      wineId: wines[0]?.id ?? "",
      date: new Date(),
      appearance: "",
      nose: "",
      palate: "",
      conclusion: "",
      rating: undefined,
      servingTemp: undefined,
      decantTime: undefined,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) => startTransition(() => onSubmit(values)))}
      >
        <FormField
          control={form.control}
          name="wineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wine</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...field}
                >
                  {wines.map((wine) => (
                    <option key={wine.id} value={wine.id}>
                      {wine.name}
                      {wine.vintage ? ` (${wine.vintage})` : ""}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="95" 
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servingTemp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serving temp (°C)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="16" 
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="appearance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appearance</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nose</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="palate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palate</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="conclusion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conclusion</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            Save tasting
          </Button>
          <Button type="button" variant="ghost" disabled={isPending} onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}




