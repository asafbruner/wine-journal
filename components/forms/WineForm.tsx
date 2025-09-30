"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, Wand2 } from "lucide-react";

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
import { wineFormSchema, type WineFormValues } from "@/lib/validation";

type WineFormProps = {
  defaultValues?: Partial<WineFormValues>;
  onSubmit: (values: WineFormValues) => Promise<void>;
};

export function WineForm({ defaultValues, onSubmit }: WineFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<WineFormValues>({
    resolver: zodResolver(wineFormSchema),
    defaultValues: {
      name: "",
      type: "RED",
      grapes: [],
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        onSubmit={form.handleSubmit((data) => startTransition(() => onSubmit(data)))}
      >
        <section className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Château Margaux" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="producer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producer</FormLabel>
                <FormControl>
                  <Input placeholder="Margaux" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="France" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="regionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input placeholder="Bordeaux" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vintage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vintage</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="2018" 
                    type="number" 
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tasting notes</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="Appearance, nose, palate..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" disabled={isPending}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload label
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={isPending}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate AI tags
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            Save wine
          </Button>
          <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={isPending}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}




