"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Coin = "BTC" | "USDT" | "SOL";

const COINS: Record<
  Coin,
  { label: string; network: string; color: string; icon: string }
> = {
  BTC: {
    label: "Bitcoin",
    network: "Bitcoin network",
    color: "#f7931a",
    icon: "₿",
  },
  USDT: {
    label: "USDT",
    network: "Tron · TRC-20",
    color: "#26a17b",
    icon: "₮",
  },
  SOL: {
    label: "Solana",
    network: "Solana network",
    color: "#9945ff",
    icon: "◎",
  },
};

const PRICE_PER_MRSC = 1.0;

export default function BuyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState<string>("");
  const [selected, setSelected] = useState<Coin>("BTC");
  const [balance, setBalance] = useState<number>(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, balance_mrsc")
        .eq("id", user.id)
        .single();

      if (profile?.is_admin) {
        router.push("/admin");
        return;
      }

      setBalance(Number(profile?.balance_mrsc || 0));
      setChecking(false);
    }
    checkAuth();
  }, [router, supabase]);

  const numericAmount = parseFloat(amount) || 0;
  const totalUSD = numericAmount * PRICE_PER_MRSC;

  function handleContinue() {
    if (numericAmount < 1) return;
    router.push(`/buy/pay?amount=${numericAmount}&coin=${selected}`);
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-xl mx-auto">
        {/* ============ TOP BAR ============ */}
        <div className="flex items-center justify-between mb-10 fade-up">
          <Link href="/dashboard" className="flex items-center gap-3 group">
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
              <div className="text-xs text-white/40">Buy $MRSC</div>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="mono-label hover:text-orange-500 transition"
          >
            ← Wallet
          </Link>
        </div>

        {/* ============ HEADING ============ */}
        <div className="mb-8 fade-up fade-up-delay-1">
          <div className="flex items-center justify-between mb-3">
            <span className="mono-label">Step 1 of 2</span>
            <span className="mono-label">$1.00 per $MRSC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Purchase $MRSC
          </h1>
          <p className="text-white/40 text-sm mt-3">
            Enter how much you want to buy, then choose how to pay.
          </p>
        </div>

        {/* ============ BALANCE PANEL ============ */}
        <div className="glass rounded-2xl p-6 mb-4 fade-up fade-up-delay-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="mono-label">Current balance</span>
              <div className="text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight mt-2">
                {balance.toLocaleString()}
                <span className="text-orange-500 text-base sm:text-lg ml-2">
                  $MRSC
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="mono-label">Value</span>
              <div className="text-sm font-mono mt-2">
                $
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ============ AMOUNT PANEL ============ */}
        <div className="glass rounded-3xl p-6 sm:p-7 mb-4 fade-up fade-up-delay-2">
          <span className="mono-label">Purchase amount</span>

          <div className="relative mt-4">
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-0 text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight outline-none placeholder:text-white/15 pr-24"
              placeholder="0"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 text-base font-mono">
              $MRSC
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {[100, 500, 1000, 5000, 10000].map((n) => (
              <button
                key={n}
                onClick={() => setAmount(String(n))}
                className="px-3 py-1.5 text-xs mono-label rounded-lg border border-white/10 hover:border-orange-500/50 hover:text-orange-500 transition"
              >
                {n.toLocaleString()}
              </button>
            ))}
          </div>

          {numericAmount > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <span className="mono-label">You pay</span>
              <span className="text-2xl font-semibold tabular-nums">
                $
                {totalUSD.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-white/40 text-sm font-normal">USD</span>
              </span>
            </div>
          )}
        </div>

        {/* ============ PAYMENT METHOD ============ */}
        <div className="glass rounded-2xl p-6 mb-4 fade-up fade-up-delay-3">
          <span className="mono-label">Payment method</span>

          <div className="space-y-2 mt-4">
            {(Object.keys(COINS) as Coin[]).map((key) => {
              const c = COINS[key];
              const isActive = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition text-left ${
                    isActive
                      ? "border-orange-500/60 bg-orange-500/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold shrink-0"
                    style={{
                      background: `${c.color}20`,
                      color: c.color,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{c.label}</div>
                    <div className="mono-label mt-0.5">{c.network}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                      isActive ? "border-orange-500" : "border-white/20"
                    }`}
                  >
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ CONTINUE ============ */}
        <button
          onClick={handleContinue}
          disabled={numericAmount < 1}
          className="btn-primary fade-up fade-up-delay-4"
        >
          {numericAmount < 1
            ? "Enter an amount"
            : `Continue with ${COINS[selected].label} →`}
        </button>

        {/* ============ FOOTER ============ */}
        <div className="flex items-center justify-between mt-10 fade-up fade-up-delay-4">
          <span className="mono-label">Secure checkout</span>
          <span className="mono-label">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </main>
  );
}