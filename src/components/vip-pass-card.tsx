import { BadgeCheck, Sparkles } from "lucide-react";
import { passMeta, type VipPassDetails } from "@/lib/vip-pass";

export function VipPassCard({ details }: { details: VipPassDetails }) {
  const meta = passMeta(details);
  const joined = new Date(details.joinedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="vip-pass-card relative isolate overflow-hidden rounded-2xl border p-6 shadow-glow sm:p-8">
      <div
        aria-hidden="true"
        className="vip-pass-pattern pointer-events-none absolute inset-0 -z-10"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="vip-pass-brand flex flex-wrap items-center gap-2 font-display text-lg font-extrabold">
            <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="vip-pass-brand-text">VENDEMPIREMARKETPLACE</span>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--vip-gold-muted)]">
            {meta.title}
          </p>
        </div>
        <div className="vip-pass-seal grid size-14 shrink-0 place-items-center rounded-full border sm:size-16">
          <div className="text-center">
            <span className="block font-display text-lg font-extrabold">VE</span>
            <span className="block text-[8px] font-bold uppercase tracking-wider">Access</span>
          </div>
        </div>
      </div>

      <div className="relative mt-8 border-t border-[color:var(--vip-gold-muted)]/25 pt-6 sm:mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--vip-gold-muted)]">
          Pass holder
        </p>
        <h3 className="mt-2 break-words font-display text-3xl font-bold sm:text-4xl">
          {details.name}
        </h3>
        <p className="mt-2 max-w-2xl break-words text-sm text-[color:var(--vip-card-muted)]">
          {details.interests.join(" · ") || meta.fallback}
        </p>
      </div>

      <div className="relative mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-[color:var(--vip-gold-muted)]/25 pt-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--vip-gold-muted)]">
            Member number
          </p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wider">
            {meta.prefix}-{String(details.rank).padStart(5, "0")}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--vip-gold-muted)]">
            Joined
          </p>
          <p className="mt-1 text-sm font-medium">{joined}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--vip-gold-muted)]">
          <BadgeCheck aria-hidden="true" className="h-4 w-4" /> Early access
        </div>
      </div>
    </article>
  );
}
