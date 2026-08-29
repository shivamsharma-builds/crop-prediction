import { useState } from "react";
import { AlertCircle, Loader2, LogIn, UserPlus, X } from "lucide-react";
import { BrandHeader } from "../components/BrandHeader";
import { CropForm } from "../components/CropForm";
import { PredictionResults } from "../components/PredictionResults";
import { AuthPanel } from "../components/AuthPanel";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { PredictionInput, PredictionResult } from "../types";

export function Portal() {
  const { user } = useAuth();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const submit = async (input: PredictionInput) => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const r = await api.predict(input);
      setResult(r.prediction);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await api.login({ email: loginEmail, password: loginPassword });
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      window.location.reload();
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  if (showCreateAccount && !user) {
    return <AuthPanel onBack={() => setShowCreateAccount(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto w-full max-w-[930px] px-3 py-4 sm:px-5 md:py-7">
        <BrandHeader
          onLogin={!user ? () => { setLoginError(""); setShowLogin(true); } : undefined}
          onCreateAccount={!user ? () => setShowCreateAccount(true) : undefined}
        />

        <CropForm onSubmit={submit} loading={loading} />
        {loading && <div className="py-7 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-green-500" /><p className="mt-2 text-[11px] text-gray-500">Running the 2-node LangGraph pipeline…</p></div>}
        {error && <div className="mt-5 flex gap-2 rounded border border-red-200 bg-red-50 p-3 text-[11px] text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}

        {result && !loading && (
          <>
            <PredictionResults result={result} />
            {!user && (
              <div className="mt-5 flex flex-col gap-3 rounded-[4px] border border-green-100 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><div className="text-[13px] font-semibold text-green-900">Like your CropWise result?</div><p className="mt-1 text-[10px] leading-4 text-green-800">Create a free account to save your predictions and build your crop planning history.</p></div>
                <button type="button" onClick={() => setShowCreateAccount(true)} className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded bg-green-600 px-4 text-[11px] font-semibold text-white hover:bg-green-700"><UserPlus className="h-3.5 w-3.5" />Create account</button>
              </div>
            )}
          </>
        )}

        {!result && !loading && !error && <div className="mt-5 rounded-[4px] border border-dashed border-gray-200 bg-white/50 p-8 text-center"><div className="text-[16px] font-medium text-gray-500">Prediction Area</div><p className="mt-2 text-[10px] leading-4 text-gray-400">Enter your farm details above and click “Predict Suitable Crops” to get AI-driven insights — no account required.</p></div>}
        <footer className="mt-10 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400">Team : Tech Tritan</footer>
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Welcome back</h2><p className="mt-1 text-sm text-slate-500">Sign in to your CropWise account</p></div>
              <button type="button" onClick={() => setShowLogin(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close login"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label><input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
              <div><label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label><input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
              {loginError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</div>}
              <button type="submit" disabled={loginLoading} className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">{loginLoading ? "Signing in..." : "Log In"}</button>
            </form>
            <div className="mt-5 text-center text-sm text-slate-500">Don't have an account? <button type="button" onClick={() => { setShowLogin(false); setShowCreateAccount(true); }} className="font-semibold text-green-600 hover:text-green-700">Create Account</button></div>
            <div className="mt-4 text-center text-xs text-slate-400">You can continue using CropWise without an account.</div>
          </div>
        </div>
      )}
    </div>
  );
}
