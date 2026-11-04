"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  user_id: string;
  username: string;
  email: string;
  balance_mrsc: number;
  is_admin: boolean;
  is_verified: boolean;
  verification_code: string | null;
  status: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unverified" | "verified">("all");

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setUsers(data as UserProfile[]);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateCode(userId: string, username: string) {
    setGenerating(userId);
    setMessage(null);

    const { data, error } = await supabase.rpc("admin_generate_verification_code", {
      target_user_id: userId,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage(`✓ Code for ${username}: ${data}`);
      await loadUsers();
    }
    setGenerating(null);
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setMessage(`✓ Copied: ${code}`);
  }

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "unverified") return !u.is_verified;
    return u.is_verified;
  });

  const counts = {
    all: users.length,
    unverified: users.filter((u) => !u.is_verified).length,
    verified: users.filter((u) => u.is_verified).length,
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 fade-up">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="logo-mark" style={{ width: 36, height: 36 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold group-hover:text-orange-500 transition">MarsChain</div>
              <div className="text-xs text-white/40">Users</div>
            </div>
          </Link>
          <Link href="/admin" className="text-xs text-white/50 hover:text-white transition">
            ← Admin
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-6 sm:mb-8 fade-up fade-up-delay-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            Generate verification codes for new users
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 fade-up fade-up-delay-2 flex-wrap">
          {(["all", "unverified", "verified"] as const).map((f) => (
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
          ))}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-mono ${
              message.startsWith("✓")
                ? "text-green-400 bg-green-950/30 border border-green-900/50"
                : "text-red-400 bg-red-950/30 border border-red-900/50"
            }`}
          >
            {message}
          </div>
        )}

        {/* Users list */}
        <div className="glass rounded-2xl overflow-hidden fade-up fade-up-delay-3">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">No users to show</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((u) => (
                <div key={u.id} className="px-4 sm:px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-sm font-semibold hover:text-orange-500 transition"
                        >
                          {u.username}
                        </Link>
                        {u.is_admin && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                            Admin
                          </span>
                        )}
                        {u.is_verified ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-1 truncate">{u.email}</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                        <div>
                          <span className="text-white/40">Balance: </span>
                          <span className="font-semibold text-orange-500">
                            {Number(u.balance_mrsc).toLocaleString()} $MRSC
                          </span>
                        </div>
                        <div className="text-white/30">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {!u.is_verified && u.verification_code && (
                        <div className="mb-2">
                          <div className="text-[10px] uppercase text-white/40 mb-1 text-right">Code</div>
                          <button
                            onClick={() => copyCode(u.verification_code!)}
                            className="font-mono text-lg font-bold text-amber-400 hover:text-amber-300 tracking-widest px-3 py-1 rounded bg-black/40 border border-amber-900/50"
                            title="Click to copy"
                          >
                            {u.verification_code}
                          </button>
                        </div>
                      )}

                      {!u.is_verified && (
                        <button
                          onClick={() => generateCode(u.id, u.username)}
                          disabled={generating === u.id}
                          className="w-full px-3 py-2 text-xs bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
                        >
                          {generating === u.id
                            ? "Generating..."
                            : u.verification_code
                            ? "Regenerate Code"
                            : "Generate Code"}
                        </button>
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
