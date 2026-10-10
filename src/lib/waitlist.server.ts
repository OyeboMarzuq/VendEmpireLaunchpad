import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AdminSession = { unlocked?: boolean };

const sessionSecret = process.env["SESSION_SECRET"];

if (process.env.NODE_ENV === "production" && !sessionSecret) {
  throw new Error("Missing SESSION_SECRET environment variable for production admin sessions.");
}

export const sessionConfig = {
  password: sessionSecret ?? "dev-only-session-secret-please-set-me-32ch",
  name: "vendempire-admin",
  maxAge: 60 * 60 * 12,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

export function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function adminClient() {
  // Generated service-role client — handles the managed key format correctly.
  return supabaseAdmin;
}

export async function isUnlocked() {
  const session = await useSession<AdminSession>(sessionConfig);
  return Boolean(session.data.unlocked);
}

export type Entry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  what_they_sell: string | null;
  created_at: string;
};

const CATEGORY_RULES: [RegExp, string][] = [
  [/(cloth|fashion|apparel|wear|thrift|boutique|shirt|dress|ankara)/i, "Fashion & Clothing"],
  [/(shoe|sneaker|footwear|sandal|heel)/i, "Shoes & Footwear"],
  [/(food|snack|restaurant|cake|pastry|bake|cook|kitchen|drink|juice)/i, "Food & Drinks"],
  [/(beauty|cosmetic|skincare|makeup|hair|wig|nail|perfume|fragrance)/i, "Beauty & Personal Care"],
  [/(phone|laptop|gadget|electronic|tech|computer|accessor)/i, "Electronics & Gadgets"],
  [/(furniture|home|decor|interior|kitchenware|bed)/i, "Home & Living"],
  [/(art|craft|handmade|jewel|bead|gift)/i, "Art, Crafts & Jewelry"],
  [/(farm|agric|produce|vegetable|fruit|grain|livestock)/i, "Farm & Agriculture"],
  [/(book|stationer|school|print)/i, "Books & Stationery"],
  [/(service|consult|design|photograph|repair|training)/i, "Services"],
];

export function categorize(value: string | null): string {
  const raw = (value ?? "").trim();
  if (!raw) return "Unspecified";
  for (const [pattern, label] of CATEGORY_RULES) {
    if (pattern.test(raw)) return label;
  }
  return raw.length > 24 ? "Other" : raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildStats(entries: Entry[]) {
  const total = entries.length;
  const vendors = entries.filter((e) => e.role === "vendor").length;
  const customers = total - vendors;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const lastSevenDays = entries.filter((e) => new Date(e.created_at).getTime() >= weekAgo).length;

  const dailyMap = new Map<string, number>();
  for (const e of entries) {
    const day = new Date(e.created_at).toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  const catMap = new Map<string, number>();
  for (const e of entries) {
    if (e.role !== "vendor") continue;
    const key = categorize(e.what_they_sell);
    catMap.set(key, (catMap.get(key) ?? 0) + 1);
  }
  const categories = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { total, vendors, customers, lastSevenDays, daily, categories };
}
