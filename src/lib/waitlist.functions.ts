import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  adminClient,
  buildStats,
  isUnlocked,
  passwordMatches,
  sessionConfig,
  type AdminSession,
  type Entry,
} from "./waitlist.server";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => value || null);

const customerJoinSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: optionalText(30),
  city: optionalText(80),
  country: z.string().trim().min(2).max(80),
  persona: z.enum(["homemaker", "student", "professional", "everyday"]),
  interests: z.array(z.string().trim().min(1).max(80)).min(1).max(10),
  note: optionalText(300),
});

const vendorJoinSchema = z.object({
  business_name: z.string().trim().min(2).max(120),
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: optionalText(30),
  city: optionalText(80),
  country: z.string().trim().min(2).max(80),
  persona: z.enum(["market", "shop", "home", "farmer"]),
  interests: z.array(z.string().trim().min(1).max(80)).min(1).max(10),
  note: optionalText(300),
});

export const joinCustomerWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => customerJoinSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = adminClient();
    const { error } = await supabase.from("customer_waitlist").insert({
      ...data,
      email: data.email.toLowerCase(),
    });

    if (error && error.code !== "23505") {
      console.error("[Waitlist] Customer signup insert failed", { code: error.code });
      return { ok: false as const, reason: "database" as const, position: 0 };
    }

    const { count, error: countError } = await supabase
      .from("customer_waitlist")
      .select("id", { count: "exact", head: true });
    if (countError) throw countError;

    if (error) {
      return { ok: true as const, reason: "duplicate" as const, position: count ?? 0 };
    }
    return { ok: true as const, reason: "created" as const, position: count ?? 0 };
  });

export const joinVendorWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => vendorJoinSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = adminClient();
    const { error } = await supabase.from("vendor_waitlist").insert({
      ...data,
      email: data.email.toLowerCase(),
    });

    if (error && error.code !== "23505") {
      console.error("[Waitlist] Vendor signup insert failed", { code: error.code });
      return { ok: false as const, reason: "database" as const, position: 0 };
    }

    const { count, error: countError } = await supabase
      .from("vendor_waitlist")
      .select("id", { count: "exact", head: true });
    if (countError) throw countError;

    if (error) {
      return { ok: true as const, reason: "duplicate" as const, position: count ?? 0 };
    }
    return { ok: true as const, reason: "created" as const, position: count ?? 0 };
  });

export const getWaitlistCount = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminClient();
  const [customersResult, vendorsResult] = await Promise.all([
    supabase.from("customer_waitlist").select("id", { count: "exact", head: true }),
    supabase.from("vendor_waitlist").select("id", { count: "exact", head: true }),
  ]);
  if (customersResult.error) throw customersResult.error;
  if (vendorsResult.error) throw vendorsResult.error;
  const customers = customersResult.count ?? 0;
  const vendors = vendorsResult.count ?? 0;
  return { count: customers + vendors, customers, vendors };
});

export const adminUnlock = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ password: z.string().trim().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSWORD"]?.trim();
    if (!expected) return { ok: false as const, reason: "not-configured" as const };
    if (!passwordMatches(data.password, expected)) {
      return { ok: false as const, reason: "invalid-password" as const };
    }
    const session = await useSession<AdminSession>(sessionConfig);
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLock = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig);
  await session.clear();
  return { ok: true as const };
});

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isUnlocked())) {
    return { locked: true as const };
  }
  const supabase = adminClient();
  const [customersResult, vendorsResult] = await Promise.all([
    supabase.from("customer_waitlist").select("*").order("created_at", { ascending: false }),
    supabase.from("vendor_waitlist").select("*").order("created_at", { ascending: false }),
  ]);

  if (customersResult.error || vendorsResult.error) {
    const error = customersResult.error ?? vendorsResult.error;
    console.error("[Admin] Waitlist query failed", {
      code: error?.code || "unknown",
      message: error?.message,
    });
    return {
      locked: false as const,
      errorCode: error?.code || "unknown",
      errorMessage: error?.message || "Unknown waitlist query error",
    };
  }
  const entries: Entry[] = [
    ...(customersResult.data ?? []).map((entry) => ({
      id: entry.id,
      name: entry.full_name,
      email: entry.email,
      phone: entry.phone,
      role: "customer",
      what_they_sell: entry.interests.join(", ") || entry.note,
      created_at: entry.created_at,
    })),
    ...(vendorsResult.data ?? []).map((entry) => ({
      id: entry.id,
      name: entry.business_name ?? entry.full_name,
      email: entry.email,
      phone: entry.phone,
      role: "vendor",
      what_they_sell: entry.interests.join(", ") || entry.note,
      created_at: entry.created_at,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { locked: false as const, entries, stats: buildStats(entries) };
});
