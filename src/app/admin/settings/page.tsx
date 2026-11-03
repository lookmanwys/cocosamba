"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  totalUsers: number;
  totalRaised: number;
  totalTokensSold: number;
  remainingTokens: number;
};

const PRESALE_SUPPLY = 6_000_000;

export default function AdminSettingsPage() {
  const supabase = createClient();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const addresses = [
    {
      key: "BTC",
      label: "Bitcoin",
      network: "Bitcoin Network",
      address: process.env.NEXT_PUBLIC_BTC_ADDRESS || "",
      explorer: "https://mempool.space/address/",
      color: "#f7931a",
    },
    {
      key: "USDT",
      label: "USDT",
      network: "Tron (TRC-20)",
      address: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || "",
      explorer: "https://tronscan.org/#/address/",
      color: "#26a17b",
    },
    {
      key: "SOL",
      label: "Solana",
      network: "Solana Network",
      address: process.env.NEXT_PUBLIC_SOL_ADDRESS || "",
      explorer: "https://solscan.io/account/",
      color: "#9945ff",
    },
  ];

  useEffect(() => {
    async function load() {
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

      setStats({
        totalUsers: totalUsers || 0,
        totalRaised,
        totalTokensSold,
        remainingTokens: PRESALE_SUPPLY - totalTokensSold,
      });
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function copyAddress(key: string, address: string) {
    await navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const soldPercent = stats
    ? Math.min(100, (stats.totalTokensSold / PRESALE_SUPPLY) * 100)
    : 0;

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 fade-up">
          <Link href="/admin" className="flex items-center gap-3 group">
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
              <div className="text-sm font-semibold group-hover:text-orange-500 transition">
                MarsChain
              </div>
              <div className="text-xs text-white/40">Settings</div>
            </div>
          </Link>
          <Link
            href="/admin"
            className="text-xs text-white/50 hover:text-white transition"
          >
            ← Admin
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8 fade-up fade-up-delay-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            Wallet addresses, launch info, and presale stats
          </p>
        </div>

        {/* Presale progress */}
        {!loading && stats && (
          <div className="glass rounded-2xl p-5 sm:p-6 mb-4 fade-up fade-up-delay-2">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">
              Presale Progress
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
              <div>
                <div className="text-2xl sm:text-3xl font-semibold">
                  {stats.totalTokensSold.toLocaleString()}
                  <span className="text-white/30 text-base sm:text-lg">
                    {" "}
                    / {PRESALE_SUPPLY.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-white/40 mt-1">
                  $MRSC sold · {stats.remainingTokens.toLocaleString()}{" "}
                  remaining
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-2xl sm:text-3xl font-semibold text-orange-500">
                  {soldPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-white/40 mt-1">of presale</div>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Launch info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 fade-up fade-up-delay-3">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
              Launch Date
            </div>
            <div className="text-lg font-semibold">Jan 1, 2027</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
              Presale Price
            </div>
            <div className="text-lg font-semibold">$1.00</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
              Total Raised
            </div>
            <div className="text-lg font-semibold">
              $
              {(stats?.totalRaised || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* Wallet addresses */}
        <div className="glass rounded-2xl p-5 sm:p-6 fade-up fade-up-delay-4">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-4">
            Payment Addresses
          </div>
          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a.key}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{
                    background: `${a.color}20`,
                    color: a.color,
                  }}
                >
                  {a.key}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{a.label}</div>
                  <div className="text-xs text-white/40">{a.network}</div>
                  <div className="font-mono text-xs text-white/70 break-all mt-1">
                    {a.address || "Not configured"}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => copyAddress(a.key, a.address)}
                    disabled={!a.address}
                    className="text-[10px] px-2.5 py-1 rounded-md border border-white/10 text-white/60 hover:border-orange-500/50 hover:text-orange-500 transition disabled:opacity-30"
                  >
                    {copiedKey === a.key ? "✓ Copied" : "Copy"}
                  </button>
                  <a
                    href={a.explorer + a.address}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-2.5 py-1 rounded-md border border-white/10 text-white/60 hover:border-orange-500/50 hover:text-orange-500 transition text-center"
                  >
                    Explorer →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/30 mt-4 leading-relaxed">
            These addresses are loaded from{" "}
            <span className="text-white/50 font-mono">.env.local</span>. To
            change them, edit the file and redeploy.
          </p>
        </div>

        <p className="text-center text-white/20 mt-12 text-xs">
          © {new Date().getFullYear()} MarsChain · Admin
        </p>
      </div>
    </main>
  );
}