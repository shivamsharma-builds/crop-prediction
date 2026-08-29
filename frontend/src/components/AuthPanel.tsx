// auth panel
import { FormEvent, useState } from "react";
import { Leaf, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type AuthPanelProps = { onBack?: () => void };

export function AuthPanel({ onBack }: AuthPanelProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto w-full max-w-[930px] px-3 py-4 sm:px-5 md:py-7">
        <div className="mx-auto mt-4 w-full max-w-[410px] rounded-[4px] p-5 sm:mt-8 border border-gray-200 bg-white p-6 shadow-soft">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to prediction
            </button>
          )}
          <div className="mb-5 flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-xl font-bold text-green-600">CropWise</div>
              <div className="text-[10px] text-gray-500">
                Create an account to save your crop predictions
              </div>
            </div>
          </div>
          <div className="mb-5 rounded border border-green-100 bg-green-50 p-3 text-[11px] leading-4 text-green-800">
            You can try CropWise first without signing in. Create your free
            account whenever you want to save your predictions and access your
            history.
          </div>
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="label">Name</span>
              <input
                className="field mt-1"
                value={name}
                onChange={(e : any) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="label">Email</span>
              <input
                className="field mt-1"
                type="email"
                value={email}
                onChange={(e : any) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input
                className="field mt-1"
                type="password"
                minLength={8}
                value={password}
                onChange={(e : any) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-[11px] text-red-700">
                {error}
              </div>
            )}
            <button
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded bg-green-600 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create
              account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
