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

const joinSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.enum(["vendor", "customer"]),
  whatTheySell: z.string().trim().max(200).optional().or(z.literal("")),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => joinSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = adminClient();
    const { error } = await supabase.from("waitlist_entries").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone ? data.phone : null,
      role: data.role,
      what_they_sell: data.role === "vendor" && data.whatTheySell ? data.whatTheySell : null,
    });

    if (error && error.code !== "23505") {
      console.error("[Waitlist] Signup insert failed", { code: error.code });
      return { ok: false as const, reason: "database" as const, position: 0 };
    }

    const { count } = await supabase
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true });

    if (error) {
      return { ok: true as const, reason: "duplicate" as const, position: count ?? 0 };
    }
    return { ok: true as const, reason: "created" as const, position: count ?? 0 };
  });

export const getWaitlistCount = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminClient();
  const { count } = await supabase
    .from("waitlist_entries")
    .select("id", { count: "exact", head: true });
  return { count: count ?? 0 };
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
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("id,name,email,phone,role,what_they_sell,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Waitlist query failed", {
      code: error.code || "unknown",
      message: error.message,
    });
    return {
      locked: false as const,
      errorCode: error.code || "unknown",
      errorMessage: error.message,
    };
  }
  const entries = (data ?? []) as Entry[];
  return { locked: false as const, entries, stats: buildStats(entries) };
});
