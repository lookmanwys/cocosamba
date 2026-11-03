"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PRESALE_SUPPLY = 6_000_000;

export default function PresaleProgress() {
  const supabase = createClient();
  const [sold, setSold] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.rpc("get_presale_stats");

      if (!cancelled && !error && data) {
        const stats = data as { tokens_sold: number };
        setSold(Number(stats.tokens_sold));
      }
    }

    load();

    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [supabase]);

  const percent =
    sold !== null ? Math.min(100, (sold / PRESALE_SUPPLY) * 100) : 0;
  const remaining =
    sold !== null ? Math.max(0, PRESALE_SUPPLY - sold) : PRESALE_SUPPLY;

  return (
    <div className="glass rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-end justify-between mb-3 gap-3">
        <div className="min-w-0">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
            Presale Progress
          </div>
          <div className="text-lg sm:text-2xl font-semibold truncate">
            {sold !== null ? sold.toLocaleString() : "—"}
            <span className="text-white/30 text-sm sm:text-base">
              {" "}
              / {PRESALE_SUPPLY.toLocaleString()} $MRSC
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg sm:text-2xl font-semibold text-orange-500">
            {sold !== null ? `${percent.toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] sm:text-xs text-white/40">
            {remaining.toLocaleString()} left
          </div>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}