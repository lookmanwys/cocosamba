"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  totalUsers: number;
  totalRaised: number;
  totalTokensSold: number;
  pendingPayments: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: payments } = await supabase
        .from("payments")
        .select("amount_usd, mrsc_credited, status");

      const confirmed = (payments || []).filter(
        (p) => p.status === "confirmed"
      );
      const totalRaised = confirmed.reduce(
        (sum, p) => sum + Number(p.amount_usd),
        0
      );
      const totalTokensSold = confirmed.reduce(
        (sum, p) => sum + Number(p.mrsc_credited),
        0
      );
      const pendingPayments = (payments || []).filter(
        (p) => p.status === "pending"
      ).length;

      setStats({
        totalUsers: totalUsers || 0,
        totalRaised,
        totalTokensSold,
        pendingPayments,
      });
      setLoading(false);
    }

    loadStats();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 fade-up">
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
              <div className="text-xs text-orange-500">Admin Panel</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm text-white/50 hover:text-white transition"
          >
            Log out
          </button>
        </div>

        {/* Heading */}
        <div className="mb-8 fade-up fade-up-delay-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            Presale statistics and activity
          </p>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="text-white/40 text-sm">Loading stats...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-2xl p-6 fade-up fade-up-delay-1">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Total Users
              </div>
              <div className="text-3xl font-semibold">
                {stats?.totalUsers.toLocaleString()}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 fade-up fade-up-delay-2">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Total Raised
              </div>
              <div className="text-3xl font-semibold">
                $
                {stats?.totalRaised.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 fade-up fade-up-delay-3">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Tokens Sold
              </div>
              <div className="text-3xl font-semibold">
                {stats?.totalTokensSold.toLocaleString()}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 fade-up fade-up-delay-4">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Pending Payments
              </div>
              <div className="text-3xl font-semibold text-orange-500">
                {stats?.pendingPayments.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-up fade-up-delay-4">
          <Link
            href="/admin/users"
            className="glass rounded-2xl p-6 hover:border-orange-500/40 transition group"
          >
            <div className="text-base font-semibold mb-1 group-hover:text-orange-500 transition">
              Users
            </div>
            <div className="text-xs text-white/40">
              View, search, and credit users
            </div>
          </Link>

          <Link
            href="/admin/payments"
            className="glass rounded-2xl p-6 hover:border-orange-500/40 transition group"
          >
            <div className="text-base font-semibold mb-1 group-hover:text-orange-500 transition">
              Payments
            </div>
            <div className="text-xs text-white/40">
              Confirm or reject pending payments
            </div>
          </Link>

          <Link
            href="/admin/invites"
            className="glass rounded-2xl p-6 hover:border-orange-500/40 transition group"
          >
            <div className="text-base font-semibold mb-1 group-hover:text-orange-500 transition">
              Invite Codes
            </div>
            <div className="text-xs text-white/40">
              Generate and manage access codes
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="glass rounded-2xl p-6 hover:border-orange-500/40 transition group"
          >
            <div className="text-base font-semibold mb-1 group-hover:text-orange-500 transition">
              Settings
            </div>
            <div className="text-xs text-white/40">
              Launch date and wallet addresses
            </div>
          </Link>
        </div>

        <p className="text-center text-white/20 mt-12 text-xs">
          © {new Date().getFullYear()} MarsChain · Admin
        </p>
      </div>
    </main>
  );
}