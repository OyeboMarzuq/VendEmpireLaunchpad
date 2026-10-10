import { ThemeToggle } from "@/components/theme-toggle";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, Camera, Sparkles, Store, Users, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinWaitlist, getWaitlistCount } from "@/lib/waitlist.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VendEmpire — Every vendor deserves their own shop" },
      {
        name: "description",
        content:
          "Join the VendEmpire waitlist: branded shops for small vendors, a shared marketplace for customers, and an AI assistant that lists products from a single photo.",
      },
      { property: "og:title", content: "VendEmpire — Every vendor deserves their own shop" },
      {
        property: "og:description",
        content:
          "Branded vendor shops, a shared marketplace, and AI-assisted product listing. Join the pre-launch waitlist.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: Store,
    title: "Vendors get a shop",
    body: "Claim a branded storefront in minutes — your name, your products, your link to share anywhere.",
  },
  {
    icon: Camera,
    title: "AI lists in seconds",
    body: "Snap a photo. Our assistant writes the title, description, category and price suggestion for you.",
  },
  {
    icon: Users,
    title: "Customers discover you",
    body: "Every shop is part of one shared marketplace, so new buyers find you without you paying for ads.",
  },
];

function Landing() {
  const join = useServerFn(joinWaitlist);
  const fetchCount = useServerFn(getWaitlistCount);

  const [count, setCount] = useState<number | null>(null);
  const [role, setRole] = useState<"vendor" | "customer">("vendor");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ position: number; duplicate: boolean } | null>(null);

  useEffect(() => {
    fetchCount({})
      .then((r) => setCount(r.count))
      .catch(() => setCount(null));
  }, [fetchCount]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await join({
        data: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          role,
          whatTheySell: String(form.get("whatTheySell") ?? ""),
        },
      });
      if (!result.ok) {
        setError("We couldn't save your signup. Please try again in a moment.");
      } else {
        setDone({ position: result.position, duplicate: result.reason === "duplicate" });
        setCount(result.position);
      }
    } catch {
      setError("We couldn't reach the signup service. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="bg-brand-gradient flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <Store className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">VendEmpire</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Pre-launch
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pt-8 pb-16 text-center sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
            <Sparkles className="size-3.5" /> AI-assisted listings included
          </span>
          <h1 className="mt-6 text-4xl leading-tight font-semibold sm:text-6xl">
            Every vendor deserves <span className="text-brand-gradient">their own shop</span> — and
            customers who find it.
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base sm:text-lg">
            VendEmpire gives small vendors a branded storefront inside one shared marketplace, with
            an AI assistant that turns a single product photo into a complete listing.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button size="lg" className="h-12 px-8 text-base shadow-soft" asChild>
              <a href="#waitlist">Join the Waitlist</a>
            </Button>
            <p className="text-muted-foreground text-sm">
              {count === null ? "Loading signups…" : `${count} people already on the list`}
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-secondary/60 border-y border-border py-16">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">How it works</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-xl">
                    <step.icon className="size-5" />
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs font-semibold tracking-widest uppercase">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="mx-auto max-w-xl scroll-mt-8 px-5 py-16">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            {done ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="text-primary mx-auto size-12" />
                <h2 className="mt-4 text-2xl font-semibold">You're in.</h2>
                <p className="text-brand-gradient mt-4 text-4xl font-semibold">
                  You're #{done.position} on the waitlist
                </p>
                <p className="text-muted-foreground mt-4 text-sm">
                  {done.duplicate
                    ? "You were already signed up — we kept your original spot."
                    : "We'll email you the moment VendEmpire opens up."}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">Join the waitlist</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Be first in line when we launch. No spam, one email at launch.
                </p>
                <form onSubmit={onSubmit} className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" name="name" required placeholder="Ada Obi" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone number <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+234 800 000 0000" />
                  </div>

                  <div className="space-y-2">
                    <Label>I want to…</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          ["vendor", "I want to sell (Vendor)"],
                          ["customer", "I want to shop (Customer)"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setRole(value)}
                          aria-pressed={role === value}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                            role === value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:bg-accent"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {role === "vendor" && (
                    <div className="space-y-2">
                      <Label htmlFor="whatTheySell">What do you sell?</Label>
                      <Input
                        id="whatTheySell"
                        name="whatTheySell"
                        required
                        placeholder="Handmade jewelry, sneakers, baked goods…"
                      />
                    </div>
                  )}

                  {error && (
                    <p className="text-destructive text-sm" role="alert">
                      {error}
                    </p>
                  )}

                  <Button type="submit" size="lg" className="h-12 w-full" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Join the Waitlist
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <p className="text-muted-foreground mx-auto max-w-5xl px-5 text-center text-sm">
          This is a pre-launch page — VendEmpire isn't live yet. Join the waitlist and we'll let you
          know as soon as shops open.
        </p>
      </footer>
    </div>
  );
}
