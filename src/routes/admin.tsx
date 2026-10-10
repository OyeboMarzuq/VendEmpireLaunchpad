import { ThemeToggle } from "@/components/theme-toggle";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpDown, Loader2, Lock, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLock, adminUnlock, getAdminData } from "@/lib/waitlist.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Waitlist Dashboard — VendEmpire" },
      { name: "description", content: "Private VendEmpire waitlist analytics dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Waitlist Dashboard — VendEmpire" },
      { property: "og:description", content: "Private VendEmpire waitlist analytics dashboard." },
    ],
  }),
  component: AdminPage,
});

type Entry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  what_they_sell: string | null;
  created_at: string;
};

type Stats = {
  total: number;
  vendors: number;
  customers: number;
  lastSevenDays: number;
  daily: { date: string; count: number }[];
  categories: { category: string; count: number }[];
};

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)"];
type SortKey = "name" | "email" | "role" | "created_at";

function AdminPage() {
  const load = useServerFn(getAdminData);
  const unlock = useServerFn(adminUnlock);
  const lock = useServerFn(adminLock);

  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [asc, setAsc] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await load({});
      if (result.locked) {
        setLocked(true);
      } else if ("errorCode" in result) {
        setLoadError(
          `Supabase couldn't load the waitlist (error code: ${result.errorCode}): ${result.errorMessage}`,
        );
      } else {
        setLocked(false);
        setEntries(result.entries as Entry[]);
        setStats(result.stats as Stats);
      }
    } catch {
      setLoadError(
        "Could not load the dashboard. Check that the server has SUPABASE_SERVICE_ROLE_KEY configured and the waitlist_entries table exists, then check the dev-server terminal for the error.",
      );
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await unlock({ data: { password } });
      if (!res.ok) {
        setAuthError(
          res.reason === "not-configured"
            ? "Admin access is not configured. Set ADMIN_PASSWORD in the server environment."
            : "Incorrect passcode.",
        );
        return;
      }
      setPassword("");
      await refresh();
    } catch {
      setAuthError("The sign-in request failed. Check the dev-server terminal for the error.");
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? entries.filter((e) =>
          [e.name, e.email, e.phone ?? "", e.role, e.what_they_sell ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : entries;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [entries, query, sortKey, asc]);

  if (locked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <form
          onSubmit={onUnlock}
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-soft"
        >
          <div className="bg-brand-gradient mx-auto flex size-12 items-center justify-center rounded-2xl text-primary-foreground">
            <Lock className="size-5" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-semibold">Admin access</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Enter the admin passcode to view the waitlist dashboard.
          </p>
          <div className="mt-6 space-y-2">
            <Label htmlFor="password">Passcode</Label>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {(authError || loadError) && (
            <p className="text-destructive mt-3 text-sm" role="alert">
              {authError ?? loadError}
            </p>
          )}
          <Button type="submit" className="mt-6 h-11 w-full" disabled={loading}>
            Unlock dashboard
          </Button>
        </form>
      </div>
    );
  }

  const metrics = [
    { label: "Total signups", value: stats?.total ?? 0 },
    { label: "Vendors", value: stats?.vendors ?? 0 },
    { label: "Customers", value: stats?.customers ?? 0 },
    { label: "Last 7 days", value: stats?.lastSevenDays ?? 0 },
  ];

  const pieData = [
    { name: "Vendors", value: stats?.vendors ?? 0 },
    { name: "Customers", value: stats?.customers ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Waitlist dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Live data from VendEmpire signups.</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await lock({});
                setLocked(true);
                setEntries([]);
                setStats(null);
              }}
            >
              Lock
            </Button>
          </div>
        </div>

        {loadError && (
          <p className="text-destructive mt-4 text-sm" role="alert">
            {loadError}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                {m.label}
              </p>
              <p className="mt-2 text-3xl font-semibold">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
            <h2 className="text-base font-semibold">Signups over time</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.daily ?? []}>
                  <defs>
                    <linearGradient id="sig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--chart-1)"
                    fill="url(#sig)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Vendors vs customers</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-muted-foreground flex justify-center gap-4 text-sm">
              {pieData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i] }}
                  />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Top vendor categories</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categories ?? []} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={150}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">All signups ({rows.length})</h2>
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, product…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  {(
                    [
                      ["name", "Name"],
                      ["email", "Email"],
                      ["role", "Role"],
                      ["created_at", "Joined"],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key} className="py-2 pr-4 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => {
                          if (sortKey === key) setAsc(!asc);
                          else {
                            setSortKey(key);
                            setAsc(true);
                          }
                        }}
                      >
                        {label} <ArrowUpDown className="size-3" />
                      </button>
                    </th>
                  ))}
                  <th className="py-2 pr-4 font-medium">Phone</th>
                  <th className="py-2 font-medium">Sells</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-4 font-medium">{e.name}</td>
                    <td className="py-2.5 pr-4">{e.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-1 text-xs capitalize">
                        {e.role}
                      </span>
                    </td>
                    <td className="text-muted-foreground py-2.5 pr-4">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-muted-foreground py-2.5 pr-4">{e.phone ?? "—"}</td>
                    <td className="text-muted-foreground py-2.5">{e.what_they_sell ?? "—"}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground py-8 text-center">
                      No signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
