"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Supabase sends the session via URL hash after password reset
  // The client picks it up automatically on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User is in password recovery mode — let them set a new password
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-200 mb-2">Password updated!</h1>
          <p className="text-sm text-slate-400 mb-2">
            Your password has been changed successfully.
          </p>
          <p className="text-xs text-slate-600">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TrendForge</span>
        </div>

        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-slate-200">Set new password</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">Choose a strong password for your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#0a0a0f] border border-[#2a2a3e] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
              <input
                type={showPass ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2a2a3e] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 w-8 rounded-full transition-colors ${
                        password.length >= level * 3
                          ? level <= 2 ? "bg-red-500" : level === 3 ? "bg-yellow-500" : "bg-green-500"
                          : "bg-surface-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500">
                  {password.length < 6 ? "Too short" : password.length < 9 ? "Weak" : password.length < 12 ? "Good" : "Strong"}
                </span>
              </div>
            )}

            {error && (
              <div className="px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            <Link href="/auth/login" className="text-violet-400 hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
