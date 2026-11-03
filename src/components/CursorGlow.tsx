"use client";

import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on devices with a fine pointer (desktop)
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);

    function move(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] hidden md:block"
      aria-hidden="true"
    >
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[80px] transition-transform duration-300 ease-out"
        style={{
          background:
            "radial-gradient(circle, #ff5722 0%, rgba(255,87,34,0) 70%)",
          transform: `translate(${pos.x - 200}px, ${pos.y - 200}px)`,
        }}
      />
    </div>
  );
}