"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
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

type ManualCredit = {
  id: string;
  amount_mrsc: number;
  reason: string;
  note: string | null;
  credited_at: string;
};

const REASONS = [
  { value: "bonus", label: "Bonus" },
  { value: "support", label: "Support" },
  { value: "airdrop", label: "Airdrop" },
  { value: "correction", label: "Correction" },
  { value: "other", label: "Other" },
];

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [credits, setCredits] = useState<ManualCredit[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual credit form
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("bonus");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: pays } = await supabase
      .from("payments")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    const { data: creds } = await supabase
      .from("manual_credits")
      .select("*")
      .eq("profile_id", userId)
      .order("credited_at", { ascending: false });

    if (p) setProfile(p);
    if (pays) setPayments(pays);
    if (creds) setCredits(creds);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setMessage("Enter a valid amount");
      setSubmitting(false);
      return;
    }

    const {
      data: { user: admin },
    } = await supabase.auth.getUser();

    if (!admin) {
      setMessage("Not authenticated");
      setSubmitting(false);
      return;
    }

    // 1. Insert manual credit record
    const { error: creditError } = await supabase
      .from("manual_credits")
      .insert({
        profile_id: userId,
        amount_mrsc: numericAmount,
        reason,
        note: note || null,
        credited_by: admin.id,
      });

    if (creditError) {
      setMessage(creditError.message);
      setSubmitting(false);
      return;
    }

    // 2. Recalculate balance from scratch (prevents double-counting)
    const { error: recalcError } = await supabase.rpc("recalculate_balance", {
      user_profile_id: userId,
    });

    if (recalcError) {
      setMessage(recalcError.message);
      setSubmitting(false);
      return;
    }

    setMessage(`✓ Credited ${numericAmount.toLocaleString()} $MRSC`);
    setAmount("");
    setNote("");
    setSubmitting(false);
    await loadData();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading user...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <div className="text-white/60 mb-4">User not found</div>
          <Link
            href="/admin/users"
            className="text-orange-500 text-sm hover:text-orange-400"
          >
            ← Back to users
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 fade-up">
          <Link href="/admin/users" className="flex items-center gap-3 group">
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
              <div className="text-xs text-white/40">User Profile</div>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="text-xs text-white/50 hover:text-white transition"
          >
            ← Users
          </Link>
        </div>

        {/* Profile header */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-4 fade-up fade-up-delay-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl font-semibold text-orange-500 shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold">{profile.username}</h1>
                {profile.is_admin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-sm text-white/40 mt-1">
                {profile.email}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-white/40">
                <span>
                  ID:{" "}
                  <span className="text-orange-500 font-mono">
                    {profile.user_id}
                  </span>
                </span>
                <span>
                  Joined:{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Balance
              </div>
              <div className="text-2xl font-semibold">
                {profile.balance_mrsc.toLocaleString()}
              </div>
              <div className="text-xs text-orange-500">$MRSC</div>
            </div>
          </div>
        </div>

        {/* Manual credit form */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-4 fade-up fade-up-delay-2">
          <div className="text-sm font-semibold mb-4">Manual Credit</div>
          <form onSubmit={handleCredit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                  Amount ($MRSC)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field"
                placeholder="Add a note for your records..."
              />
            </div>

            {message && (
              <div
                className={`text-sm px-4 py-3 rounded-lg ${
                  message.startsWith("✓")
                    ? "text-green-400 bg-green-950/30 border border-green-900/50"
                    : "text-red-400 bg-red-950/30 border border-red-900/50"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? "Crediting..." : "Credit User"}
            </button>
          </form>
        </div>

        {/* Payment history */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-4 fade-up fade-up-delay-3">
          <div className="text-sm font-semibold mb-4">Payment History</div>
          {payments.length === 0 ? (
            <div className="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">
              No payments yet
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {p.coin} · {p.amount_crypto}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">
                      {Number(p.mrsc_credited).toLocaleString()} $MRSC
                    </div>
                    <div
                      className={`text-xs ${
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
              ))}
            </div>
          )}
        </div>

        {/* Manual credit history */}
        <div className="glass rounded-2xl p-5 sm:p-6 fade-up fade-up-delay-4">
          <div className="text-sm font-semibold mb-4">
            Manual Credit History
          </div>
          {credits.length === 0 ? (
            <div className="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">
              No manual credits yet
            </div>
          ) : (
            <div className="space-y-2">
              {credits.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold capitalize">
                      {c.reason}
                    </div>
                    {c.note && (
                      <div className="text-xs text-white/40 truncate">
                        {c.note}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-green-400">
                      +{Number(c.amount_mrsc).toLocaleString()} $MRSC
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(c.credited_at).toLocaleString()}
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