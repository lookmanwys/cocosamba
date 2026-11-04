"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If no user is logged in, kick them out
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, [router, supabase]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers
    const newDigits = [...digits];
    newDigits[index] = value.substring(value.length - 1); // Only take last char
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length !== 4) {
      setError("Please enter all 4 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("verify_user_code", {
      input_code: code,
    });

    if (error || !data) {
      setError("Invalid verification code. Please check and try again.");
      setLoading(false);
      return;
    }

    // Success! Route to dashboard
    router.push("/dashboard");
    router.refresh();
  };

  if (loading) return <LoadingScreen text="Verifying account..." />;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass rounded-2xl p-8 text-center fade-up">
        <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
        <p className="text-white/40 text-sm mb-8">
          Enter the 4-digit code sent to your email. If you haven't received it, contact support.
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-14 h-16 text-center text-2xl font-mono bg-black/40 border border-white/10 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
            />
          ))}
        </div>

        {error && <div className="text-red-400 text-sm mb-4 bg-red-950/30 p-2 rounded">{error}</div>}

        <button onClick={handleVerify} className="btn-primary w-full mt-2">
          Verify Account
        </button>
      </div>
    </main>
  );
}
