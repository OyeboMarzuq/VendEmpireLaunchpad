import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Wallet,
} from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { VipPassCard } from "@/components/vip-pass-card";
import { useColorMode } from "@/hooks/use-color-mode";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  INTERESTS,
  VENDOR_TYPES as PERSONAS,
  vendorSchema as waitlistSchema,
  type InterestId,
  type VendorTypeId as PersonaId,
} from "@/lib/marketplace";
import { downloadVipPass, type VipPassDetails } from "@/lib/vip-pass";
import { getWaitlistCount, joinVendorWaitlist } from "@/lib/waitlist.functions";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Sell on VendEmpire Marketplace — Vendor Waitlist" },
      {
        name: "description",
        content:
          "Reach thousands of shoppers looking for foodstuffs, gadgets, fashion and more. Join the VendEmpire vendor waitlist as a founding seller.",
      },
      { property: "og:title", content: "VendEmpire Marketplace — Vendor Waitlist" },
      {
        property: "og:description",
        content: "Become a founding vendor and sell to shoppers near you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TICKER = [
  "Mama Ngozi Provisions · Lagos · Foodstuffs 🍠",
  "Chi Gadgets Hub · Abuja · Gadgets 📱",
  "Grace Mart · Accra · Groceries 🧺",
  "Tunde Stationery · UNILAG · Campus Essentials 📚",
  "Wanjiru Threads · Nairobi · Fashion 👗",
  "Fatima Kitchenware · Kano · Home & Kitchen 🍳",
  "Kofi Accessories · Kumasi · Accessories 🎧",
  "Blessing Baby Store · Port Harcourt · Baby & Kids 🧸",
];

const FLOATERS = [
  { e: "🍅", c: "left-[6%] top-[18%]", r: "-12deg", d: "0s" },
  { e: "📱", c: "right-[8%] top-[14%]", r: "10deg", d: "1s" },
  { e: "🥭", c: "left-[12%] bottom-[22%]", r: "8deg", d: "2s" },
  { e: "🎧", c: "right-[14%] bottom-[26%]", r: "-8deg", d: "1.5s" },
  { e: "🛒", c: "left-[45%] top-[6%]", r: "4deg", d: "0.5s" },
];

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Cameroon",
  "Uganda",
  "Rwanda",
  "United Kingdom",
  "United States",
  "Other",
];

function useCount() {
  const [count, setCount] = useState<number | null>(null);
  const fetchCount = useServerFn(getWaitlistCount);
  useEffect(() => {
    fetchCount({})
      .then((result) => setCount(result.vendors))
      .catch(() => setCount(null));
  }, [fetchCount]);
  return [count, setCount] as const;
}

function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = shown;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{shown.toLocaleString()}</>;
}

function Index() {
  const [count, setCount] = useCount();
  const [done, setDone] = useState<VipPassDetails | null>(null);
  const { mode, toggleMode } = useColorMode();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* animated backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-lg font-black text-primary-foreground shadow-glow">
            V
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight">
            VENDEMPIRE<span className="text-primary">MARKETPLACE</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            onClick={toggleMode}
          >
            {mode === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
          <Link to="/" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
            I'm a shopper
          </Link>
          <a
            href="#join"
            className="hidden rounded-md border border-border px-4 py-2 text-sm hover:bg-muted sm:inline-block"
          >
            Get early access
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 text-center md:pt-16">
        {FLOATERS.map((f) => (
          <span
            key={f.e}
            aria-hidden
            className={`animate-float absolute hidden text-5xl md:block ${f.c}`}
            style={{ ["--r" as string]: f.r, animationDelay: f.d }}
          >
            {f.e}
          </span>
        ))}
        <div className="animate-rise mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
          {!count ? (
            "Founding vendor spots are open"
          ) : (
            <>
              <b>
                <AnimatedNumber value={count} />
              </b>
              &nbsp;vendors already signed up
            </>
          )}
        </div>
        <h1 className="animate-rise mx-auto mt-6 max-w-5xl text-4xl font-extrabold leading-[1.05] tracking-tight [animation-delay:.1s] md:text-6xl">
          Every vendor deserves
          <br />
          <span className="text-gradient">their own shop —</span>
          <br />
          and customers who find it.
        </h1>
        <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg text-muted-foreground [animation-delay:.2s]">
          Sell foodstuffs, gadgets, fashion and everyday essentials to homemakers, students and
          professionals near you. Join as a founding vendor and be ready on launch day.
        </p>
        <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3 [animation-delay:.3s]">
          <a
            href="#join"
            className="group inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-hero)] px-7 py-4 font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
          >
            Reserve my vendor spot{" "}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* ticker */}
      <div className="relative border-y border-border bg-card/40 py-3">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-sm text-muted-foreground">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {t} just signed up
            </span>
          ))}
        </div>
      </div>

      {/* categories */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold md:text-5xl">Sell what you know best</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {INTERESTS.map((c, i) => (
            <div
              key={c.id}
              className="group animate-rise glass rounded-2xl p-5 transition duration-300 hover:-translate-y-2 hover:rotate-1 hover:border-primary/60 hover:shadow-glow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="text-4xl transition group-hover:scale-125">{c.emoji}</div>
              <div className="mt-3 text-sm font-medium">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              I: ShieldCheck,
              t: "Verified badge",
              d: "Build trust from day one with a checked seller profile.",
            },
            { I: Wallet, t: "Fast payouts", d: "Get paid quickly for every order you deliver." },
            {
              I: Truck,
              t: "Delivery handled",
              d: "We help get your goods to the customer's door.",
            },
          ].map(({ I, t, d }) => (
            <div key={t} className="glass rounded-2xl p-6">
              <I className="h-7 w-7 text-secondary" />
              <h3 className="mt-3 text-xl font-bold">{t}</h3>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* form */}
      <section id="join" className="mx-auto max-w-3xl scroll-mt-10 px-5 pb-24">
        {done ? (
          <Ticket details={done} />
        ) : (
          <JoinForm
            onDone={(details) => {
              setDone(details);
              setCount(details.rank);
              document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <SocialLinks variant="footer" />
        <p className="mt-5">
          © {new Date().getFullYear()} VendEmpire Marketplace · Built for vendors everywhere
        </p>
      </footer>
    </main>
  );
}

function JoinForm({ onDone }: { onDone: (details: VipPassDetails) => void }) {
  const join = useServerFn(joinVendorWaitlist);
  const [persona, setPersona] = useState<PersonaId | null>(null);
  const [interests, setInterests] = useState<InterestId[]>([]);
  const [errors, setErrors] = useState<
    Partial<
      Record<
        "persona" | "interests" | "business_name" | "full_name" | "email" | "phone" | "country",
        string
      >
    >
  >({});
  const [busy, setBusy] = useState(false);
  const lastSubmit = useRef(0);

  const toggle = (id: InterestId) =>
    setInterests((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || Date.now() - lastSubmit.current < 2500) return;
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // honeypot for bots
    const parsed = waitlistSchema.safeParse({
      business_name: fd.get("business_name"),
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: fd.get("phone") || undefined,
      city: fd.get("city") || undefined,
      country: fd.get("country"),
      persona: persona ?? undefined,
      interests,
      note: fd.get("note") || undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs as typeof errors);
      toast.error(Object.values(errs)[0]);
      return;
    }
    setErrors({});
    setBusy(true);
    lastSubmit.current = Date.now();

    let result;
    try {
      result = await join({ data: parsed.data });
    } catch {
      setBusy(false);
      toast.error("We're very busy right now — please try again in a moment.");
      return;
    }
    if (!result.ok) {
      setBusy(false);
      toast.error("We couldn't save your signup. Please try again.");
      return;
    }
    setBusy(false);
    onDone({
      name: parsed.data.business_name,
      kind: "vendor",
      rank: result.position,
      interests: parsed.data.interests.map(
        (id) => INTERESTS.find((interest) => interest.id === id)?.label ?? id,
      ),
      joinedAt: new Date().toISOString(),
    });
  }

  const field =
    "w-full rounded-xl border border-input bg-background/60 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20";

  return (
    <form
      onSubmit={submit}
      className="glass relative overflow-hidden rounded-3xl p-6 shadow-glow md:p-10"
      noValidate
    >
      <div className="absolute inset-x-0 top-0 h-1 animate-shimmer bg-[image:var(--gradient-hero)]" />
      <h2 className="text-3xl font-extrabold md:text-4xl">Join the vendor waitlist</h2>
      <p className="mt-2 text-muted-foreground">
        Founding vendors get zero listing fees for the first 3 months and a verified badge.
      </p>

      <fieldset className="mt-8">
        <legend className="mb-3 font-semibold">1. What kind of seller are you?</legend>
        <div className="grid grid-cols-2 gap-3">
          {PERSONAS.map((p) => {
            const on = persona === p.id;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setPersona(p.id)}
                aria-pressed={on}
                className={`rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                  on ? "border-primary bg-primary/15 shadow-glow" : "border-border bg-background/40"
                }`}
              >
                <div className={`text-3xl transition ${on ? "scale-125" : ""}`}>{p.emoji}</div>
                <div className="mt-2 font-semibold">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.blurb}</div>
              </button>
            );
          })}
        </div>
        {errors.persona && <p className="mt-2 text-sm text-destructive">{errors.persona}</p>}
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-3 font-semibold">2. What do you sell?</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((c) => {
            const on = interests.includes(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(c.id)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
                  on
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border hover:border-secondary/60"
                }`}
              >
                {on ? <Check className="h-3.5 w-3.5" /> : <span>{c.emoji}</span>} {c.label}
              </button>
            );
          })}
        </div>
        {errors.interests && <p className="mt-2 text-sm text-destructive">{errors.interests}</p>}
      </fieldset>

      <fieldset className="mt-8 grid gap-4 md:grid-cols-2">
        <legend className="mb-3 font-semibold">3. Your details</legend>
        <div className="md:col-span-2">
          <input
            name="business_name"
            placeholder="Business / shop name"
            maxLength={120}
            className={field}
            autoComplete="organization"
          />
          {errors.business_name && (
            <p className="mt-1 text-sm text-destructive">{errors.business_name}</p>
          )}
        </div>
        <div>
          <input
            name="full_name"
            placeholder="Your full name"
            maxLength={100}
            className={field}
            autoComplete="name"
          />
          {errors.full_name && <p className="mt-1 text-sm text-destructive">{errors.full_name}</p>}
        </div>
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            maxLength={255}
            className={field}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
        </div>
        <div>
          <input
            name="phone"
            placeholder="WhatsApp number (optional)"
            maxLength={30}
            className={field}
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
        </div>
        <input
          name="city"
          placeholder="City / Market (optional)"
          maxLength={80}
          className={field}
        />
        <div className="md:col-span-2">
          <select name="country" defaultValue="" className={field}>
            <option value="" disabled>
              Country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {errors.country && <p className="mt-1 text-sm text-destructive">{errors.country}</p>}
        </div>
        <textarea
          name="note"
          placeholder="Tell us about your business (optional)"
          maxLength={300}
          rows={2}
          className={`${field} md:col-span-2`}
        />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      </fieldset>

      <button
        type="submit"
        disabled={busy}
        className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-hero)] px-6 py-4 text-lg font-bold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-70"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Reserve my vendor spot{" "}
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="mt-7 border-t border-border/60 pt-6">
        <SocialLinks variant="card" />
      </div>
    </form>
  );
}

function Ticket({ details }: { details: VipPassDetails }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const msg = `I just signed up as a founding vendor on VendEmpire Marketplace. Sell with me: ${url}`;
  return (
    <div className="relative">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-confetti absolute left-1/2 top-10 h-3 w-2 rounded-sm"
          style={{
            background: `var(--chart-${(i % 5) + 1})`,
            ["--x" as string]: `${Math.cos(i) * (120 + (i % 4) * 60)}px`,
            ["--y" as string]: `${Math.sin(i) * 160 - 60}px`,
            animationDelay: `${(i % 6) * 40}ms`,
          }}
        />
      ))}
      <div className="glass animate-rise rounded-xl p-6 text-center shadow-glow sm:p-8 md:p-12">
        <div className="text-6xl">🎉</div>
        <h2 className="mt-4 break-words text-3xl font-extrabold sm:text-4xl">
          You're in, {details.name}!
        </h2>
        <p className="mt-2 text-muted-foreground">Your founding vendor pass is reserved.</p>
        <div className="mt-8 text-left">
          <VipPassCard details={details} />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            onClick={() => downloadVipPass(details)}
            className="h-auto rounded-md px-5 py-3"
          >
            <Download className="h-4 w-4" /> Download vendor pass
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-5 py-3 font-semibold text-secondary-foreground transition hover:scale-105"
          >
            <MessageCircle className="h-4 w-4" /> Share on WhatsApp
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(msg);
              toast.success("Link copied!");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-semibold transition hover:bg-muted"
          >
            <Copy className="h-4 w-4" /> Copy invite
          </button>
        </div>
      </div>
    </div>
  );
}
