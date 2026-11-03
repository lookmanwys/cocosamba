"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Coin = "BTC" | "USDT" | "SOL";

const COINS: Record<
  Coin,
  { label: string; network: string; address: string; color: string; icon: string }
> = {
  BTC: {
    label: "Bitcoin",
    network: "Bitcoin network",
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS || "",
    color: "#f7931a",
    icon: "₿",
  },
  USDT: {
    label: "USDT",
    network: "Tron · TRC-20",
    address: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || "",
    color: "#26a17b",
    icon: "₮",
  },
  SOL: {
    label: "Solana",
    network: "Solana network",
    address: process.env.NEXT_PUBLIC_SOL_ADDRESS || "",
    color: "#9945ff",
    icon: "◎",
  },
};

function PayContent() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const amount = parseFloat(params.get("amount") || "0");
  const coinKey = (params.get("coin") || "BTC") as Coin;
  const coin = COINS[coinKey];

  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (!amount || amount < 1 || !coin) {
        router.push("/buy");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profile?.is_admin) {
        router.push("/admin");
        return;
      }

      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;

      const { data: existing } = await supabase
        .from("payments")
        .select("id")
        .eq("profile_id", user.id)
        .eq("coin", coinKey)
        .eq("amount_usd", amount)
        .eq("status", "pending")
        .maybeSingle();

      if (cancelled) return;

      if (!existing) {
        await supabase.from("payments").insert({
          profile_id: user.id,
          coin: coinKey,
          amount_crypto: 0,
          amount_usd: amount,
          mrsc_credited: amount,
          status: "pending",
        });
      }

      if (!cancelled) setChecking(false);
    }
    init();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, amount, coinKey]);

  async function copyAddress() {
    await navigator.clipboard.writeText(coin.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (checking || !coin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </main>
    );
  }

  const totalUSD = amount * 1.0;

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-xl mx-auto">
        {/* ============ TOP BAR ============ */}
        <div className="flex items-center justify-between mb-10 fade-up">
          <Link href="/buy" className="flex items-center gap-3 group">
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
              <div className="text-xs text-white/40">Payment</div>
            </div>
          </Link>
          <Link
            href="/buy"
            className="mono-label hover:text-orange-500 transition"
          >
            ← Change
          </Link>
        </div>

        {/* ============ HEADING ============ */}
        <div className="mb-8 fade-up fade-up-delay-1">
          <div className="flex items-center justify-between mb-3">
            <span className="mono-label">Step 2 of 2</span>
            <span className="mono-label">Awaiting payment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Send {coin.label}
          </h1>
          <p className="text-white/40 text-sm mt-3">
            Send the exact amount to the address below. Your balance will
            update after confirmation.
          </p>
        </div>

        {/* ============ ORDER SUMMARY ============ */}
        <div className="glass rounded-2xl p-6 mb-4 fade-up fade-up-delay-2">
          <span className="mono-label">Order summary</span>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Amount</span>
              <span className="text-sm font-semibold tabular-nums">
                {amount.toLocaleString()} $MRSC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Price</span>
              <span className="text-sm font-semibold tabular-nums">
                $1.00 / token
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Method</span>
              <span className="text-sm font-semibold">{coin.label}</span>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="mono-label">Total due</span>
              <span className="text-2xl font-semibold tabular-nums text-orange-500">
                $
                {totalUSD.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ============ DEPOSIT ADDRESS ============ */}
        <div className="glass rounded-3xl p-6 sm:p-7 mb-4 fade-up fade-up-delay-3 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,87,34,0.06) 0%, transparent 70%)",
              transform: "translate(40%, -40%)",
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-semibold shrink-0"
                style={{
                  background: `${coin.color}20`,
                  color: coin.color,
                }}
              >
                {coin.icon}
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {coin.label} deposit address
                </div>
                <div className="mono-label mt-0.5">{coin.network}</div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
              <div className="font-mono text-xs break-all text-white/90 leading-relaxed">
                {coin.address || "Address not configured"}
              </div>
            </div>

            <button
              onClick={copyAddress}
              className="btn-primary"
              disabled={!coin.address}
            >
              {copied ? "✓ Copied" : "Copy address"}
            </button>
          </div>
        </div>

        {/* ============ WARNING ============ */}
        <div className="glass rounded-2xl p-5 mb-4 fade-up fade-up-delay-3">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-amber-300 mb-1">
                Send only {coin.label}
              </div>
              <p className="text-white/50 text-xs leading-relaxed">
                Send <strong className="text-white/80">exactly ${totalUSD.toFixed(2)}</strong>{" "}
                worth of {coin.label} on the {coin.network} network. Sending
                the wrong coin, wrong network, or wrong amount may result in
                lost funds.
              </p>
            </div>
          </div>
        </div>

        {/* ============ NEXT STEPS ============ */}
        <div className="glass rounded-2xl p-6 mb-6 fade-up fade-up-delay-4">
          <span className="mono-label">What happens next</span>

          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <div className="mono-label text-orange-500 shrink-0 w-6">
                01
              </div>
              <div className="text-white/60 text-xs leading-relaxed">
                Send ${totalUSD.toFixed(2)} worth of {coin.label} to the
                address above
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mono-label text-orange-500 shrink-0 w-6">
                02
              </div>
              <div className="text-white/60 text-xs leading-relaxed">
                               Payment is confirmed on-chain
            </div>
            <div className="flex gap-3">
              <div className="mono-label text-orange-500 shrink-0 w-6">
                03
              </div>
              <div className="text-white/60 text-xs leading-relaxed">
                Your $MRSC balance is credited to your wallet
              </div>
            </div>
          </div>
        </div>

        {/* ============ BACK TO WALLET ============ */}
        <div className="text-center mb-10 fade-up fade-up-delay-4">
          <Link
            href="/dashboard"
            className="mono-label hover:text-orange-500 transition"
          >
            Done — back to wallet →
          </Link>
        </div>

        {/* ============ FOOTER ============ */}
        <div className="flex items-center justify-between fade-up fade-up-delay-4">
          <span className="mono-label">Secure checkout</span>
          <span className="mono-label">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </main>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-white/40 text-sm">Loading...</div>
        </main>
      }
    >
      <PayContent />
    </Suspense>
  );
}