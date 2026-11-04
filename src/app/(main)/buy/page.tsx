"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Coin = "BTC" | "USDT" | "SOL";

const COINS: Record<Coin, { label: string; network: string; color: string; icon: string; address: string }> = {
  BTC: { 
    label: "Bitcoin", 
    network: "Bitcoin network", 
    color: "#f7931a", 
    icon: "₿",
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS || "Address not configured"
  },
  USDT: { 
    label: "USDT", 
    network: "Tron · TRC-20", 
    color: "#26a17b", 
    icon: "₮",
    address: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || "Address not configured"
  },
  SOL: { 
    label: "Solana", 
    network: "Solana network", 
    color: "#9945ff", 
    icon: "◎",
    address: process.env.NEXT_PUBLIC_SOL_ADDRESS || "Address not configured"
  },
};

type PaymentData = {
  id: string;
  coin: Coin;
  amount_usd: number;
  mrsc_credited: number;
  status: string;
};

function PayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const paymentId = searchParams.get("payment_id");

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      router.push("/buy");
      return;
    }

    async function fetchPayment() {
      // Verify the user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch the payment (RLS ensures they can only see their own)
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      if (error || !data) {
        setError("Payment record not found.");
      } else {
        setPayment(data);
      }
      setLoading(false);
    }

    fetchPayment();
  }, [paymentId, router, supabase]);

  function copyAddress() {
    if (!payment) return;
    const address = COINS[payment.coin].address;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading payment details...</div>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-400 text-sm mb-4">{error || "Invalid payment"}</div>
          <Link href="/buy" className="text-orange-500 text-sm hover:text-orange-400">
            ← Return to Buy page
          </Link>
        </div>
      </main>
    );
  }

  const coinInfo = COINS[payment.coin];

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-xl mx-auto">
        {/* ============ TOP BAR ============ */}
        <div className="flex items-center justify-between mb-10 fade-up">
          <Link href="/buy" className="flex items-center gap-3 group">
            <div className="logo-mark" style={{ width: 36, height: 36 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold group-hover:text-orange-500 transition">MarsChain</div>
              <div className="text-xs text-white/40">Payment</div>
            </div>
          </Link>
          <Link href="/buy" className="mono-label hover:text-orange-500 transition">
            ← Change
          </Link>
        </div>

        {/* ============ HEADING ============ */}
        <div className="mb-8 fade-up fade-up-delay-1">
          <div className="flex items-center justify-between mb-3">
            <span className="mono-label">Step 2 of 2</span>
            <span className="mono-label text-orange-500">Awaiting payment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Send {coinInfo.label}
          </h1>
          <p className="text-white/40 text-sm mt-3">
            Send the exact amount to the address below. Your balance will update after confirmation.
          </p>
        </div>

        {/* ============ ORDER SUMMARY ============ */}
        <div className="glass rounded-2xl p-6 mb-4 fade-up fade-up-delay-2">
          <span className="mono-label">Order summary</span>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Amount</span>
              <span className="text-sm font-semibold tabular-nums">
                {Number(payment.mrsc_credited).toLocaleString()} $MRSC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Price</span>
              <span className="text-sm font-semibold tabular-nums">$1.00 / token</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Method</span>
              <span className="text-sm font-semibold">{coinInfo.label}</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="mono-label">Total due</span>
              <span className="text-2xl font-semibold tabular-nums text-orange-500">
                ${Number(payment.amount_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ============ DEPOSIT ADDRESS ============ */}
        <div className="glass rounded-3xl p-6 sm:p-7 mb-4 fade-up fade-up-delay-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,87,34,0.06) 0%, transparent 70%)", transform: "translate(40%, -40%)" }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-semibold shrink-0" style={{ background: `${coinInfo.color}20`, color: coinInfo.color }}>
                {coinInfo.icon}
              </div>
              <div>
                <div className="text-sm font-semibold">{coinInfo.label} deposit address</div>
                <div className="mono-label mt-0.5">{coinInfo.network}</div>
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
              <div className="font-mono text-xs break-all text-white/90 leading-relaxed">
                {coinInfo.address}
              </div>
            </div>
            <button onClick={copyAddress} className="btn-primary" disabled={coinInfo.address === "Address not configured"}>
              {copied ? "✓ Copied" : "Copy address"}
            </button>
          </div>
        </div>

        {/* ============ WARNING ============ */}
        <div className="glass rounded-2xl p-5 mb-4 fade-up fade-up-delay-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-amber-300 mb-1">Send only {coinInfo.label}</div>
              <p className="text-white/50 text-xs leading-relaxed">
                Send <strong className="text-white/80">exactly ${Number(payment.amount_usd).toFixed(2)}</strong> worth of {coinInfo.label} on the {coinInfo.network}. Sending the wrong coin, wrong network, or wrong amount may result in lost funds.
              </p>
            </div>
          </div>
        </div>

        {/* ============ NEXT STEPS ============ */}
        <div className="glass rounded-2xl p-6 mb-6 fade-up fade-up-delay-4">
          <span className="mono-label">What happens next</span>
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <div className="mono-label text-orange-500 shrink-0 w-6">01</div>
              <div className="text-white/60 text-xs leading-relaxed">Send ${Number(payment.amount_usd).toFixed(2)} worth of {coinInfo.label} to the address above</div>
            </div>
            <div className="flex gap-3">
              <div className="mono-label text-orange-500 shrink-0 w-6">02</div>
              <div className="text-white/60 text-xs leading-relaxed">Payment is confirmed on-chain by the MarsChain team</div>
            </div>
            <div className="flex gap-3">
              <div className="mono-label text-orange-500 shrink-0 w-6">03</div>
              <div className="text-white/60 text-xs leading-relaxed">Your $MRSC balance is credited to your wallet</div>
            </div>
          </div>
        </div>

        {/* ============ BACK TO WALLET ============ */}
        <div className="text-center mb-10 fade-up fade-up-delay-4">
          <Link href="/dashboard" className="mono-label hover:text-orange-500 transition">
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

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function PayPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </main>
    }>
      <PayContent />
    </Suspense>
  );
}