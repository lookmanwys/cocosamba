"use client";

import { useEffect, useState } from "react";
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

export default function AdminUsersPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUsers(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    loadUsers();
  }, [supabase]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.user_id.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

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
              <div className="text-xs text-white/40">Users</div>
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
            Users
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 fade-up fade-up-delay-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            placeholder="Search by User ID, username, or email..."
          />
        </div>

        {/* User list */}
        <div className="glass rounded-2xl overflow-hidden fade-up fade-up-delay-3">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              {search ? "No users match your search" : "No users yet"}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-sm font-semibold text-orange-500 shrink-0">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-semibold truncate">
                        {u.username}
                      </div>
                      {u.is_admin && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                          ADMIN
                        </span>
                      )}
                      {u.status !== "active" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                          {u.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      {u.email}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] sm:text-xs text-white/40 font-mono">
                      {u.user_id}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold mt-0.5">
                      {u.balance_mrsc.toLocaleString()}{" "}
                      <span className="text-orange-500 text-[10px] sm:text-xs">
                        $MRSC
                      </span>
                    </div>
                  </div>
                </Link>
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