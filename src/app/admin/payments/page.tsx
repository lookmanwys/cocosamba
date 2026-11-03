"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Payment = {
  id: string;
  profile_id: string;
  coin: string;
  amount_crypto: number;
  amount_usd: number;
  mrsc_credited: number;
  status: string;
  confirmed_at: string | null;
  created_at: string;
  profiles: {
    user_id: string;
    username: string;
    email: string;
  } | null;
};

type Filter = "pending" | "confirmed" | "rejected" | "all";

export default function AdminPaymentsPage() {
  const supabase = createClient();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        profiles:profile_id (user_id, username, email)
      `
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data as Payment[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmPayment(payment: Payment) {
    setProcessing(payment.id);
    setMessage(null);

    const {
      data: { user: admin },
    } = await supabase.auth.getUser();

    if (!admin) {
      setMessage("Not authenticated");
      setProcessing(null);
      return;
    }

    // 1. Update payment status (with .select() to verify success)
    const { data: updatedPayment, error: payError } = await supabase
      .from("payments")
      .update({
        status: "confirmed",
        confirmed_by: admin.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
      .select()
      .single();

    if (payError) {
      setMessage(payError.message);
      setProcessing(null);
      return;
    }

    if (!updatedPayment || updatedPayment.status !== "confirmed") {
      setMessage("Failed to update payment. Check RLS policies.");
      setProcessing(null);
      return;
    }

    // 2. Recalculate balance from scratch (prevents double-counting)
    const { error: balError } = await supabase.rpc("recalculate_balance", {
      user_profile_id: payment.profile_id,
    });

    if (balError) {
      setMessage(balError.message);
      setProcessing(null);
      return;
    }

    setMessage(
      `✓ Confirmed — ${payment.mrsc_credited.toLocaleString()} $MRSC credited to ${
        payment.profiles?.username || "user"
      }`
    );
    setProcessing(null);
    await loadPayments();
  }

  async function rejectPayment(payment: Payment) {
    if (!confirm("Reject this payment? This cannot be undone.")) return;

    setProcessing(payment.id);
    setMessage(null);

    const { error } = await supabase
      .from("payments")
      .update({ status: "rejected" })
      .eq("id", payment.id);

    if (error) {
      setMessage(error.message);
    } else {
      // Recalculate balance (in case this was previously confirmed)
      await supabase.rpc("recalculate_balance", {
        user_profile_id: payment.profile_id,
      });
      setMessage("Payment rejected");
      await loadPayments();
    }
    setProcessing(null);
  }

  const filtered = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const counts = {
    pending: payments.filter((p) => p.status === "pending").length,
    confirmed: payments.filter((p) => p.status === "confirmed").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
    all: payments.length,
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
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
              <div className="text-xs text-white/40">Payments</div>
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
        <div className="mb-6 sm:mb-8 fade-up fade-up-delay-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Payments
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            Confirm payments to credit users with $MRSC
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 fade-up fade-up-delay-2 flex-wrap">
          {(["pending", "confirmed", "rejected", "all"] as Filter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-2 text-xs rounded-lg border transition capitalize ${
                  filter === f
                    ? "border-orange-500/60 bg-orange-500/10 text-orange-500"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {f} ({counts[f]})
              </button>
            )
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.startsWith("✓")
                ? "text-green-400 bg-green-950/30 border border-green-900/50"
                : "text-red-400 bg-red-950/30 border border-red-900/50"
            }`}
          >
            {message}
          </div>
        )}

        {/* Payments list */}
        <div className="glass rounded-2xl overflow-hidden fade-up fade-up-delay-3">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm">
              Loading payments...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              No {filter === "all" ? "" : filter} payments
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((p) => (
                <div key={p.id} className="px-4 sm:px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left: user info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/users/${p.profile_id}`}
                          className="text-sm font-semibold hover:text-orange-500 transition"
                        >
                          {p.profiles?.username || "Unknown"}
                        </Link>
                        <span className="text-xs text-white/40 font-mono">
                          {p.profiles?.user_id}
                        </span>
                      </div>
                      <div className="text-xs text-white/40 mt-1 truncate">
                        {p.profiles?.email}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
                        <div>
                          <span className="text-white/40">Coin: </span>
                          <span className="font-semibold">{p.coin}</span>
                        </div>
                        <div>
                          <span className="text-white/40">Sent: </span>
                          <span className="font-mono">{p.amount_crypto}</span>
                        </div>
                        <div>
                          <span className="text-white/40">USD: </span>
                          <span className="font-semibold">
                            $
                            {Number(p.amount_usd).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40">$MRSC: </span>
                          <span className="font-semibold text-orange-500">
                            {Number(p.mrsc_credited).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-white/30 mt-2">
                        {new Date(p.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Right: status + actions */}
                    <div className="shrink-0 sm:text-right">
                      <div
                        className={`text-xs font-medium px-3 py-1 rounded-full inline-block mb-3 ${
                          p.status === "confirmed"
                            ? "bg-green-500/10 text-green-400"
                            : p.status === "pending"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </div>

                      {p.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmPayment(p)}
                            disabled={processing === p.id}
                            className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
                          >
                            {processing === p.id
                              ? "Processing..."
                              : "Confirm"}
                          </button>
                          <button
                            onClick={() => rejectPayment(p)}
                            disabled={processing === p.id}
                            className="px-3 py-1.5 text-xs border border-red-900/50 text-red-400 hover:bg-red-950/30 disabled:opacity-50 rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {p.status === "confirmed" && p.confirmed_at && (
                        <div className="text-xs text-white/30">
                          {new Date(p.confirmed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-white/20 mt-12 text-xs">
          © {new Date().getFullYear()} MarsChain · Admin
        </p>
      </div>
    </main>
  );
}