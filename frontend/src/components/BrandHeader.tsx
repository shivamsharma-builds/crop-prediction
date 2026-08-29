import { Leaf, LogIn, LogOut, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function BrandHeader({ onCreateAccount, onLogin }: { onCreateAccount?: () => void; onLogin?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <Link to="/" className="flex items-center gap-2.5">
        <Leaf className="h-8 w-8 text-green-600" strokeWidth={1.7} />
        <div>
          <div className="text-[19px] font-bold tracking-tight text-green-600">CropWise</div>
          <div className="text-[9px] text-gray-500">AI-Powered Crop Suitability &amp; Planning</div>
        </div>
      </Link>

      {user ? (
        <div className="flex items-center justify-between gap-2 text-[11px] text-gray-600 sm:justify-end">
          <span>{user.name}</span>
          {user.role === "admin" && <Link to="/admin" className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-green-700"><ShieldCheck className="h-3.5 w-3.5" /> Admin</Link>}
          <button onClick={() => void logout()} className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 hover:bg-gray-50"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          {onLogin && <button type="button" onClick={onLogin} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"><LogIn className="h-3.5 w-3.5" /> Log In</button>}
          {onCreateAccount && <button type="button" onClick={onCreateAccount} className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-green-600 px-3 text-[11px] font-semibold text-white transition hover:bg-green-700 sm:px-4"><UserPlus className="h-3.5 w-3.5" /> Create account</button>}
        </div>
      )}
    </header>
  );
}
