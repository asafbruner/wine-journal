"use client";

import { useTransition, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Github, Mail, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type EmailSchema = z.infer<typeof emailSchema>;

const oauthProviders: Array<{
  id: "github" | "google";
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}> = [
  {
    id: "github",
    label: "Continue with GitHub",
    icon: <Github className="h-4 w-4" />,
    enabled: Boolean(process.env.NEXT_PUBLIC_GITHUB_ENABLED ?? true),
  },
  {
    id: "google",
    label: "Continue with Google",
    icon: <Sparkles className="h-4 w-4" />,
    enabled: Boolean(process.env.NEXT_PUBLIC_GOOGLE_ENABLED ?? true),
  },
];

export function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const { toast } = useToast();

  const form = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: EmailSchema) => {
    startTransition(async () => {
      try {
        const result = await signIn("email", {
          email: values.email,
          callbackUrl,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        toast({
          title: "Check your inbox",
          description: "We sent you a secure sign-in link.",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Cannot send sign-in email";
        toast({
          title: "Failed to send email",
          description: message,
          variant: "destructive",
        });
      }
    });
  };

  const signInWithProvider = async (provider: "github" | "google") => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start OAuth flow";
      toast({
        title: "Sign-in failed",
        description: message,
        variant: "destructive",
      });
      setOauthLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">Email address</span>
          <Input
            type="email"
            placeholder="you@example.com"
            disabled={isPending}
            {...form.register("email")}
          />
        </label>
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link…
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Continue with email
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <div className="grid gap-3">
        {oauthProviders.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className="w-full"
            disabled={!provider.enabled || Boolean(oauthLoading)}
            onClick={() => signInWithProvider(provider.id)}
          >
            {oauthLoading === provider.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              provider.icon
            )}
            <span className="ml-2">{provider.label}</span>
          </Button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to the Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}




