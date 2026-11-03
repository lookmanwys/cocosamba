"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  user_id: string;
  username: string;
  email: string;
  balance_mrsc: number;
  status: string;
  is_admin: boolean;
  created_at: string;
};

type Payment = {
  id: string;
  coin: string;
  amount_crypto: number;
  amount_usd: number;
  mrsc_credited: number;
  status: string;
  created_at: string;
};

const LAUNCH_DATE = new Date("2027-01-01T00:00:00Z");

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Countdown tick
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      setError(profileError?.message || "Could not load profile");
      setLoading(false);
      return;
    }

    if (profileData.is_admin) {
      router.push("/admin");
      return;
    }

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    setProfile(profileData);
    setPayments(paymentsData || []);
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        clearTimeout(timeout);
        timeout = setTimeout(() => loadData(), 300);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(timeout);
    };
  }, [loadData]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading dashboard...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-400 text-sm mb-4">Error: {error}</div>
          <button
            onClick={handleLogout}
            className="text-orange-500 text-sm hover:text-orange-400"
          >
            Log out and try again
          </button>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const diff = LAUNCH_DATE.getTime() - now;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* ============ TOP BAR ============ */}
        <div className="flex items-center justify-between mb-10 fade-up">
          <div className="flex items-center gap-3">
            <div className="logo-mark" style={{ width: 36, height: 36 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold">MarsChain</div>
              <div className="text-xs text-white/40">Wallet</div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-white/40">Signed in as</div>
              <div className="text-sm font-semibold">{profile.username}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm text-white/50 hover:text-white transition"
            >
              Log out
            </button>
          </div>
        </div>

        {/* ============ WALLET HERO ============ */}
        <div className="glass rounded-3xl p-6 sm:p-10 mb-5 fade-up fade-up-delay-1 relative overflow-hidden">
          {/* Subtle glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,87,34,0.08) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="mono-label">Your balance</span>
            </div>

            <div className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight tabular-nums leading-none mb-2">
              {profile.balance_mrsc.toLocaleString()}
              <span className="text-orange-500 text-2xl sm:text-3xl md:text-4xl ml-3">
                $MRSC
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 mb-8">
              <span className="mono-label">
                ID:{" "}
                <span className="text-orange-500">{profile.user_id}</span>
              </span>
              <span className="text-white/20">·</span>
              <span className="mono-label">Locked until Jan 1, 2027</span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md">
              <Link
                href="/buy"
                className="group flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Buy</span>
              </Link>

              <Link
                href="/sell"
                className="group flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Sell</span>
              </Link>
            </div>

            <p className="mono-label mt-4 text-white/25">
              Selling activates at launch on January 1
            </p>
          </div>
        </div>

        {/* ============ MISSION CONTROL TELEMETRY ============ */}
        <div className="glass rounded-2xl p-6 mb-5 fade-up fade-up-delay-2">
          <div className="flex items-center justify-between mb-5">
            <span className="mono-label">Launch sequence</span>
            <span className="flex items-center gap-1.5 mono-label text-orange-500">
              <span className="status-dot" />
              Counting
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: "Days", value: days },
              { label: "Hours", value: hours },
              { label: "Min", value: minutes },
              { label: "Sec", value: seconds },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`text-center ${
                  i === 3 ? "text-orange-500" : "text-white"
                }`}
              >
                <div className="text-3xl sm:text-5xl font-semibold tabular-nums tracking-tight">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="mono-label mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ TRANSACTION HISTORY ============ */}
        <div className="glass rounded-2xl overflow-hidden fade-up fade-up-delay-3">
          <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-white/5">
            <div>
              <div className="text-sm font-semibold">Transaction history</div>
              <div className="mono-label mt-1">
                {payments.length} record{payments.length === 1 ? "" : "s"}
              </div>
            </div>
            <button
              onClick={loadData}
              className="mono-label hover:text-orange-500 transition"
            >
              Refresh
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="text-white/40 text-sm mb-1">
                No transactions yet
              </div>
              <Link
                href="/buy"
                className="text-orange-500 hover:text-orange-400 text-xs font-medium transition"
              >
                Make your first purchase →
              </Link>
            </div>
          ) : (
            <>
              {/* Table header (desktop only) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-7 py-3 border-b border-white/5 mono-label">
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Method</div>
                <div className="col-span-3 text-right">Paid</div>
                <div className="col-span-3 text-right">$MRSC</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              <div className="divide-y divide-white/5">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="px-5 sm:px-7 py-4 hover:bg-white/[0.02] transition"
                  >
                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2 text-xs text-white/60">
                        {new Date(p.created_at).toLocaleDateString()}
                        <div className="text-white/30 text-[10px] mt-0.5">
                          {new Date(p.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white/70">
                          {p.coin}
                        </span>
                      </div>
                      <div className="col-span-3 text-right text-sm font-mono">
                        $
                        {Number(p.amount_usd).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="col-span-3 text-right text-sm font-semibold text-orange-500">
                        {Number(p.mrsc_credited).toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        <span
                          className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full ${
                            p.status === "confirmed"
                              ? "bg-green-500/10 text-green-400"
                              : p.status === "pending"
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-xs font-semibold text-orange-500 shrink-0">
                          {p.coin}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {Number(p.mrsc_credited).toLocaleString()} $MRSC
                          </div>
                          <div className="text-[10px] text-white/40 truncate">
                            {new Date(p.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono">
                          $
                          {Number(p.amount_usd).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${
                            p.status === "confirmed"
                              ? "text-green-400"
                              : p.status === "pending"
                              ? "text-orange-400"
                              : "text-red-400"
                          }`}
                        >
                          {p.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ============ FOOTER ============ */}
        <div className="flex items-center justify-between mt-10 fade-up fade-up-delay-4">
          <span className="mono-label">MarsChain · Wallet v1.0</span>
          <span className="mono-label">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </main>
  );
}