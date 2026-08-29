
import { useState } from "react";
import { AlertCircle, Loader2, UserPlus, X } from "lucide-react";
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
      await api.login({
        email: loginEmail,
        password: loginPassword,
      });

      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");

      window.location.reload();
    } catch (e) {
      setLoginError(
        e instanceof Error ? e.message : "Unable to sign in"
      );
    } finally {
      setLoginLoading(false);
    }
  };

  if (showCreateAccount && !user) {
    return (
      <div className="min-h-screen w-full">
        <AuthPanel onBack={() => setShowCreateAccount(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f5f5]">
      {/* Full-width application container */}
      <div className="mx-auto w-full max-w-[1720px] px-3 py-4 sm:px-5 md:px-7 md:py-7 lg:px-10 xl:px-12 2xl:px-16">

        {/* Header */}
        <div className="w-full">
          <BrandHeader
            onLogin={
              !user
                ? () => {
                    setLoginError("");
                    setShowLogin(true);
                  }
                : undefined
            }
            onCreateAccount={
              !user ? () => setShowCreateAccount(true) : undefined
            }
          />
        </div>

        {/* Main content */}
        <main className="mt-6 w-full">

          {/* Crop prediction form */}
          <section className="w-full">
            <CropForm
              onSubmit={submit}
              loading={loading}
            />
          </section>

          {/* Loading */}
          {loading && (
            <div className="flex w-full flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-green-500" />

              <p className="mt-3 text-xs text-gray-500">
                Running the 2-node LangGraph pipeline…
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 flex w-full gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />

              <span className="min-w-0 break-words">
                {error}
              </span>
            </div>
          )}

          {/* Prediction result */}
          {result && !loading && (
            <section className="mt-6 w-full">
              <PredictionResults result={result} />

              {!user && (
                <div className="mt-5 flex w-full flex-col gap-4 rounded-lg border border-green-100 bg-green-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-green-900">
                      Like your CropWise result?
                    </div>

                    <p className="mt-1 max-w-3xl text-xs leading-5 text-green-800">
                      Create a free account to save your predictions
                      and build your crop planning history.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateAccount(true)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-xs font-semibold text-white transition hover:bg-green-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Empty prediction state */}
          {!result && !loading && !error && (
            <section className="mt-6 w-full rounded-lg border border-dashed border-gray-200 bg-white/60 p-10 text-center">
              <div className="text-lg font-medium text-gray-500">
                Prediction Area
              </div>

              <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-gray-400">
                Enter your farm details above and click
                “Predict Suitable Crops” to get AI-driven insights —
                no account required.
              </p>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 w-full border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
          Team : Tech Tritan
        </footer>
      </div>

      {/* Login modal */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogin(false);
            }
          }}
        >
          <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">

            {/* Modal header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sign in to your CropWise account
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close login"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Login form */}
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? "Signing in..." : "Log In"}
              </button>
            </form>

            {/* Create account */}
            <div className="mt-5 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowLogin(false);
                  setShowCreateAccount(true);
                }}
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Create Account
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-slate-400">
              You can continue using CropWise without an account.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
