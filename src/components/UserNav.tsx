"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UserNav({
  subtitle = "Dashboard",
  backHref = "/dashboard",
  backLabel = "← Dashboard",
}: {
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between mb-8 sm:mb-10 fade-up">
      <Link href={backHref} className="flex items-center gap-3 group">
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
          <div className="text-xs text-white/40">{subtitle}</div>
        </div>
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href={backHref}
          className="text-xs text-white/50 hover:text-white transition hidden md:block"
        >
          {backLabel}
        </Link>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-xs text-white/50 hover:text-white transition disabled:opacity-50"
        >
          {loading ? "..." : "Log out"}
        </button>
      </div>
    </div>
  );
}