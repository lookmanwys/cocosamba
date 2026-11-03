"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import UserNav from "@/components/UserNav";

const LAUNCH_DATE = new Date("2027-01-01T00:00:00Z");

type Profile = {
  user_id: string;
  username: string;
  balance_mrsc: number;
};

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [amount, setAmount] = useState("");

  // Live countdown tick
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, balance_mrsc")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  // Is the sell feature unlocked yet?
  const isLive = now >= LAUNCH_DATE.getTime();

  const diff = LAUNCH_DATE.getTime() - now;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

  const numericAmount = parseFloat(amount) || 0;
  const estimatedUSD = numericAmount * 1.0;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-xl mx-auto">
        <UserNav
          subtitle="Sell $MRSC"
          backHref="/dashboard"
          backLabel="← Dashboard"
        />

        {/* Heading */}
        <div className="mb-8 fade-up fade-up-delay-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs text-white/40 uppercase tracking-wider">
              Sell
            </div>
            {!isLive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium uppercase tracking-wider">
                Locked
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sell your $MRSC
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {isLive
              ? "Enter an amount to sell at market price"
              : "Available after launch on January 1"}
          </p>
        </div>

        {/* Countdown banner when locked */}
        {!isLive && (
          <div className="glass rounded-2xl p-5 mb-4 border-orange-500/20 fade-up fade-up-delay-2">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
              Unlocks in
            </div>
            <div className="flex items-baseline gap-3 sm:gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {days}
                </div>
                <div className="text-xs text-white/40 uppercase">Days</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {hours}
                </div>
                <div className="text-xs text-white/40 uppercase">Hrs</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {minutes}
                </div>
                <div className="text-xs text-white/40 uppercase">Min</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-orange-500">
                  {seconds}
                </div>
                <div className="text-xs text-white/40 uppercase">Sec</div>
              </div>
            </div>
          </div>
        )}

        {/* Balance card */}
        <div className="glass rounded-2xl p-6 mb-4 fade-up fade-up-delay-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Your Balance
              </div>
              <div className="text-2xl font-semibold">
                {profile.balance_mrsc.toLocaleString()}{" "}
                <span className="text-orange-500 text-lg">$MRSC</span>
              </div>
            </div>
            <button
              disabled={!isLive}
              onClick={() => setAmount(String(profile.balance_mrsc))}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 hover:text-orange-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>
        </div>

        {/* Sell form */}
        <div className="glass rounded-2xl p-6 mb-4 fade-up fade-up-delay-4">
          <label className="block text-xs font-medium mb-3 text-white/60 uppercase tracking-wider">
            Amount to sell
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isLive}
              className="input-field text-xl sm:text-2xl font-semibold pr-20 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              $MRSC
            </div>
          </div>

          {numericAmount > 0 && (
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-white/40">Estimated value</div>
              <div className="text-xl font-semibold">
                $
                {estimatedUSD.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-white/40 text-sm font-normal">USD</span>
              </div>
            </div>
          )}

          <button
            disabled={!isLive || numericAmount <= 0}
            className="btn-primary mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLive ? "Sell $MRSC" : "Locked until January 1"}
          </button>

          {!isLive && (
            <p className="text-xs text-white/40 text-center mt-4 leading-relaxed">
              Selling opens the moment $MRSC launches. At launch, you will
              be able to trade $MRSC on any Solana exchange that lists it.
            </p>
          )}
        </div>

        {/* Info card */}
        <div className="glass rounded-2xl p-5 fade-up fade-up-delay-4">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
            How selling will work
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-orange-500 font-mono text-xs mt-0.5">
                01
              </div>
              <div className="text-white/60 text-xs leading-relaxed">
                At launch, $MRSC lists on Solana exchanges
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-orange-500 font-mono text-xs mt-0.5">
                02
              </div>
              <div className="text-white/60 text-xs leading-relaxed">
                You can sell directly here or on external exchanges
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-orange-500 font-mono text-xs mt-0.5">
                03
              </div>
              <div className="text-white/60 text-xs leading-relaxed">
                Once listed, $MRSC trades freely at market price
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 mt-12 text-xs">
          © {new Date().getFullYear()} MarsChain · Beyond Bitcoin
        </p>
      </div>
    </main>
  );
}