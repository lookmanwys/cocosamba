"use client";

import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2027-01-01T00:00:00Z");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calcTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  return {
    days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
    minutes: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
    seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
  };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calcTimeLeft());
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "Days", value: timeLeft?.days },
    { label: "Hours", value: timeLeft?.hours },
    { label: "Minutes", value: timeLeft?.minutes },
    { label: "Seconds", value: timeLeft?.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="glass rounded-xl px-3 sm:px-4 py-2 min-w-[56px] sm:min-w-[80px]">
            <div className="text-2xl sm:text-3xl font-semibold tabular-nums">
              {item.value === undefined
                ? "--"
                : String(item.value).padStart(2, "0")}
            </div>
          </div>
          <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider mt-2">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}