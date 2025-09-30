import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wines", label: "Wines" },
  { href: "/tastings", label: "Tastings" },
  { href: "/export", label: "Export" },
];

export default async function AuthedLayout({ children }: PropsWithChildren) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="grid min-h-screen grid-rows-[auto,1fr] bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs uppercase tracking-[0.3em] text-primary">Wine</span>
            <span className="text-lg">Journal</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <MobileNav
            sessionName={session.user.name ?? session.user.email ?? "Account"}
            sessionEmail={session.user.email}
          />
          <div className="hidden items-center gap-3 md:flex">
            <Avatar className="size-8">
              <AvatarFallback>
                {session.user.name?.slice(0, 2).toUpperCase() ?? "??"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Hi {session.user.name ?? session.user.email}
            </span>
            <form action="/api/auth/signout" method="post">
              <button
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="grid h-full grid-cols-1 gap-0 md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r bg-background/70 p-6 md:flex md:flex-col">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick links
          </div>
          <Separator className="my-4" />
          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} className="justify-start">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Separator className="my-4" />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Avatar className="size-10">
              <AvatarFallback>
                {session.user.name?.slice(0, 2).toUpperCase() ?? "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-foreground">
                {session.user.name ?? "Wine Journalist"}
              </div>
              <div className="text-xs">{session.user.email ?? "Unlinked"}</div>
            </div>
          </div>
          <form action="/api/auth/signout" method="post" className="mt-4">
            <button
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}
              type="submit"
            >
              Sign out
            </button>
          </form>
        </aside>
        <main className="flex flex-col bg-background px-4 py-8 md:px-10">
          <Suspense fallback={<div className="h-60 animate-pulse rounded-lg bg-muted" />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

type NavLinkProps = PropsWithChildren<{ href: string; className?: string }>;

function NavLink({ href, className, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-sm", className)}
    >
      {children}
    </Link>
  );
}

function MobileNav({ sessionName, sessionEmail }: { sessionName: string; sessionEmail?: string | null }) {
  return (
    <div className="flex items-center gap-3 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full border border-border")}
            type="button"
          >
            <Menu className="size-4" />
            <span className="sr-only">Toggle navigation</span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-xs space-y-6">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar className="size-10">
              <AvatarFallback>{sessionName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium text-foreground">{sessionName}</div>
              <p className="text-xs text-muted-foreground">{sessionEmail ?? "Unlinked"}</p>
            </div>
          </div>
          <Separator />
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <NavLink href={item.href} className="w-full justify-start">
                  {item.label}
                </NavLink>
              </SheetClose>
            ))}
          </nav>
          <form action="/api/auth/signout" method="post">
            <button
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}
              type="submit"
            >
              Sign out
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

