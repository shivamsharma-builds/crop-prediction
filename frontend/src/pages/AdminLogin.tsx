import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, Leaf, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-[#f5f5f5] px-3 py-8">
    <div className="mx-auto max-w-[410px] rounded-[4px] border border-gray-200 bg-white p-6 shadow-soft">
      <Link to="/" className="mb-5 inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800"><ArrowLeft className="h-3.5 w-3.5"/> Back to CropWise</Link>
      <div className="mb-5 flex items-center gap-2"><Leaf className="h-8 w-8 text-green-600"/><div><div className="text-xl font-bold text-green-600">CropWise</div><div className="text-[10px] text-gray-500">Administrator access</div></div></div>
      <div className="mb-5 rounded border border-amber-100 bg-amber-50 p-3 text-[10px] leading-4 text-amber-800"><KeyRound className="mr-1 inline h-3.5 w-3.5 align-[-3px]"/>This sign-in is only for authorized administrators. Regular visitors can use the prediction portal without signing in.</div>
      <form onSubmit={submit} className="space-y-3">
        <label className="block"><span className="label">Admin email</span><input className="field mt-1" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label>
        <label className="block"><span className="label">Password</span><input className="field mt-1" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>
        {error && <div className="rounded border border-red-200 bg-red-50 p-2 text-[11px] text-red-700">{error}</div>}
        <button disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded bg-green-600 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin"/>}Sign in as admin</button>
      </form>
    </div>
  </div>;
}
