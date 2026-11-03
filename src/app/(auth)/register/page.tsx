"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { checkEmail } from "@/lib/emailCheck";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"code" | "register">("code");
  const [inviteCode, setInviteCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);

    const { data, error } = await supabase.rpc("validate_invite_code", {
      code_input: inviteCode,
    });

    if (error) {
      setError(error.message);
      setVerifying(false);
      return;
    }

    const result = data as { valid: boolean; reason?: string };

    if (!result.valid) {
      setError(result.reason || "Invalid invite code");
      setVerifying(false);
      return;
    }

    setStep("register");
    setVerifying(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const emailCheck = checkEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.reason);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    await new Promise((r) => setTimeout(r, 100));

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await supabase.rpc("redeem_invite_code", {
        code_input: inviteCode,
      });
      router.push("/dashboard");
      router.refresh();
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10 fade-up">
          <div className="flex justify-center mb-5">
            <div className="logo-mark">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {step === "code" ? "Enter your invite code" : "Create your account"}
          </h1>
          <p className="text-white/40 text-sm mt-3">
            {step === "code"
              ? "Access is limited to invited participants."
              : "Fill in the details below to finish setting up."}
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-8 fade-up fade-up-delay-1">
          {/* STEP 1: INVITE CODE */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                  Invite code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  autoFocus
                  className="input-field text-center font-mono tracking-wider"
                  placeholder="MRSC-XXXX-XXXX"
                />
                <p className="text-white/30 text-xs mt-3 leading-relaxed">
                   Registration requires a valid invitation.
                </p>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying || inviteCode.length < 4}
                className="btn-primary mt-2"
              >
                {verifying ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {/* STEP 2: REGISTER */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="text-green-400 text-sm bg-green-950/20 border border-green-900/40 px-4 py-3 rounded-lg">
                ✓ Invite code accepted
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-field"
                  placeholder="your_username"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-white/60 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pr-12"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-orange-500 transition p-1"
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 104.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password warning */}
                <div className="mt-3 flex items-start gap-2 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2.5">
                  <svg
                    className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <p className="text-red-300 text-xs leading-relaxed">
                    <span className="font-semibold">Important:</span> Your
                    password cannot be recovered. Store it safely. Losing it
                    means losing access to your account and funds.
                  </p>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("code");
                  setError(null);
                }}
                className="w-full text-center text-xs text-white/40 hover:text-white/70 transition"
              >
                ← Use a different code
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/40 mt-8 text-sm fade-up fade-up-delay-2">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-500 hover:text-orange-400 font-medium transition"
          >
            Log in
          </Link>
        </p>

        <p className="text-center text-white/20 mt-12 text-xs fade-up fade-up-delay-3">
          © {new Date().getFullYear()} MarsChain
        </p>
      </div>
    </main>
  );
}