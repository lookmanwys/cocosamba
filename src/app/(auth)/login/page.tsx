"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State to track if the UI should be locked
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Countdown timer for the lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError(null); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    await supabase.auth.signOut();
    await new Promise((r) => setTimeout(r, 100));

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      const { data: lockData } = await supabase.rpc('record_failed_login', { 
        user_email: cleanEmail 
      });

      if (lockData?.locked) {
        setError(lockData.message);
        // Use the exact seconds remaining from the database!
        setLockoutSeconds(lockData.seconds_remaining || 900); 
      } else if (lockData?.remaining !== undefined) {
        setError(`Invalid credentials. ${lockData.remaining} attempts remaining.`);
      } else {
        setError(authError.message);
      }
      
      setLoading(false);
      return;
    }

    await supabase.rpc('reset_login_attempts', { user_email: cleanEmail });

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, status")
        .eq("id", authData.user.id)
        .single();

      if (profile?.status === 'locked') {
        await supabase.auth.signOut();
        setError("Your account has been suspended. Please contact support.");
        setLoading(false);
        return;
      }

      if (profile?.is_admin) {
        router.push("/admin");
        router.refresh();
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    // If hours exist, show HH:MM:SS, otherwise MM:SS
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 fade-up">
          <div className="flex justify-center mb-5">
            <div className="logo-mark">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-white/40 text-sm mt-3">Log in to your MarsChain account</p>
        </div>

        <div className="glass rounded-2xl p-8 fade-up fade-up-delay-1">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={lockoutSeconds > 0}
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={lockoutSeconds > 0}
                  className="input-field pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={lockoutSeconds > 0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-orange-500 transition p-1 disabled:opacity-50"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 104.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className={`text-sm px-4 py-3 rounded-lg border ${
                lockoutSeconds > 0 ? "text-red-400 bg-red-950/50 border-red-900" : "text-red-400 bg-red-950/30 border-red-900/50"
              }`}>
                {error}
                {lockoutSeconds > 0 && (
                  <div className="mt-2 text-xl font-mono font-bold text-center tracking-widest">
                    {formatTime(lockoutSeconds)}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : lockoutSeconds > 0 ? "Account Locked" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 mt-8 text-sm fade-up fade-up-delay-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium transition">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}