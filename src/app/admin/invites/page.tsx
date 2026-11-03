"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type InviteCode = {
  id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  max_uses: number;
  times_used: number;
  expires_at: string | null;
  note: string | null;
  active: boolean;
  created_at: string;
};

export default function AdminInvitesPage() {
  const supabase = createClient();

  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [count, setCount] = useState("1");
  const [note, setNote] = useState("");
  const [expiresDays, setExpiresDays] = useState("");

  async function loadCodes() {
    const { data, error } = await supabase
      .from("invite_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCodes(data as InviteCode[]);
    setLoading(false);
  }

  useEffect(() => {
    loadCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);

    const { data, error } = await supabase.rpc("generate_invite_codes", {
      count: parseInt(count) || 1,
      max_uses: 1,
      note: note || null,
      expires_days: expiresDays ? parseInt(expiresDays) : null,
    });

    if (error) {
      setMessage(error.message);
      setGenerating(false);
      return;
    }

    setMessage(`Generated ${data?.length || 0} one-time code(s)`);
    setCount("1");
    setNote("");
    setExpiresDays("");
    setGenerating(false);
    await loadCodes();
  }

  async function toggleActive(code: InviteCode) {
    await supabase
      .from("invite_codes")
      .update({ active: !code.active })
      .eq("id", code.id);
    await loadCodes();
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  async function copyAll() {
    const available = codes
      .filter(
        (c) =>
          c.active &&
          c.times_used < c.max_uses &&
          (!c.expires_at || new Date(c.expires_at) > new Date())
      )
      .map((c) => c.code)
      .join("\n");

    if (!available) {
      setMessage("No available codes to copy");
      return;
    }

    await navigator.clipboard.writeText(available);
    setMessage(`Copied ${available.split("\n").length} codes to clipboard`);
    setTimeout(() => setMessage(null), 2500);
  }

  const stats = {
    total: codes.length,
    available: codes.filter(
      (c) =>
        c.active &&
        c.times_used < c.max_uses &&
        (!c.expires_at || new Date(c.expires_at) > new Date())
    ).length,
    used: codes.filter((c) => c.times_used >= c.max_uses).length,
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
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
              <div className="text-xs text-white/40">Invite Codes</div>
            </div>
          </Link>
          <Link
            href="/admin"
            className="text-xs text-white/50 hover:text-white transition"
          >
            ← Admin
          </Link>
        </div>

        <div className="mb-6 sm:mb-8 fade-up fade-up-delay-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Invite Codes
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            One-time access codes for the private presale
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 fade-up fade-up-delay-2">
          <div className="glass rounded-xl p-4">
            <div className="mono-label mb-1">Total</div>
            <div className="text-xl sm:text-2xl font-semibold">
              {stats.total}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="mono-label mb-1">Available</div>
            <div className="text-xl sm:text-2xl font-semibold text-green-400">
              {stats.available}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="mono-label mb-1">Used</div>
            <div className="text-xl sm:text-2xl font-semibold text-orange-500">
              {stats.used}
            </div>
          </div>
        </div>

        {/* Generate form */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-6 fade-up fade-up-delay-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Generate codes</div>
            <button
              type="button"
              onClick={copyAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 hover:text-orange-500 transition"
            >
              Copy all available
            </button>
          </div>

          <p className="text-xs text-white/40 mb-4 leading-relaxed">
            Each code can be used once. When a user registers with a
            code, it becomes permanently consumed.
          </p>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mono-label mb-2 block">Count</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="access-input"
                />
              </div>
              <div>
                <label className="mono-label mb-2 block">
                  Expires in (days, optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={expiresDays}
                  onChange={(e) => setExpiresDays(e.target.value)}
                  className="access-input"
                  placeholder="Leave blank = never"
                />
              </div>
            </div>

            <div>
              <label className="mono-label mb-2 block">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="access-input"
                placeholder="e.g. Sent to investor X on Telegram"
              />
            </div>

            {message && (
              <div
                className={`text-xs px-3 py-2.5 rounded ${
                  message.startsWith("Generated") ||
                  message.startsWith("Copied")
                    ? "text-green-400 bg-green-950/30 border border-green-900/50"
                    : "text-red-400 bg-red-950/30 border border-red-900/50"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className="btn-primary"
            >
              {generating ? "Generating..." : "Generate codes"}
            </button>
          </form>
        </div>

        {/* Codes list */}
        <div className="glass rounded-2xl overflow-hidden fade-up fade-up-delay-3">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm">
              Loading...
            </div>
          ) : codes.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              No codes generated yet
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {codes.map((c) => {
                const isUsed = c.times_used >= c.max_uses;
                const isExpired =
                  c.expires_at && new Date(c.expires_at) < new Date();
                const isActive = c.active && !isUsed && !isExpired;

                return (
                  <div
                    key={c.id}
                    className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="font-mono text-sm font-semibold hover:text-orange-500 transition"
                        >
                          {c.code}
                        </button>
                        {copied === c.code && (
                          <span className="text-[10px] text-green-400">
                            Copied
                          </span>
                        )}
                        {!isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium uppercase tracking-wider">
                            {isExpired ? "Expired" : "Used"}
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium uppercase tracking-wider">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/40">
                        {c.note && <span>{c.note}</span>}
                        {c.expires_at && (
                          <span>
                            Expires{" "}
                            {new Date(c.expires_at).toLocaleDateString()}
                          </span>
                        )}
                        {c.used_at && (
                          <span>
                            Used{" "}
                            {new Date(c.used_at).toLocaleString()}
                          </span>
                        )}
                        <span className="text-white/25">
                          Created{" "}
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-orange-500/50 hover:text-orange-500 transition"
                      >
                        {copied === c.code ? "✓" : "Copy"}
                      </button>
                      {!isUsed && (
                        <button
                          onClick={() => toggleActive(c)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                            c.active
                              ? "border-red-900/50 text-red-400 hover:bg-red-950/30"
                              : "border-white/10 text-white/60 hover:border-white/20"
                          }`}
                        >
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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