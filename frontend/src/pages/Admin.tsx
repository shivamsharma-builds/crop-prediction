import { useEffect, useState } from "react";
import {
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  FileText,
  Save,
} from "lucide-react";
import { BrandHeader } from "../components/BrandHeader";
import { api } from "../lib/api";

export function Admin() {
  const [config, setConfig] = useState<any>(null);
  const [key, setKey] = useState("");
  const [model, setModel] = useState("openrouter/free");
  const [enabled, setEnabled] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [userQ, setUserQ] = useState("");
  const [cropQ, setCropQ] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"users" | "predictions">("users");
  const load = async () => {
    const [c, u, p] = await Promise.all([
      api.adminConfig(),
      api.users(),
      api.predictions(),
    ]);
    setConfig(c);
    setModel(c.selectedModel);
    setEnabled(c.isAiEnabled);
    setUsers(u.users);
    setPredictions(p.predictions);
  };
  useEffect(() => {
    void load();
  }, []);
  const save = async () => {
    const r = await api.patchAdminConfig({
      ...(key ? { apiKey: key } : {}),
      isAiEnabled: enabled,
      selectedModel: model,
    });
    setConfig(r.config);
    setKey("");
    setMessage("System configuration saved.");
  };
  const searchUsers = async () => setUsers((await api.users(userQ)).users);
  const searchPredictions = async () =>
    setPredictions((await api.predictions(cropQ)).predictions);
  const role = async (id: string, value: "user" | "admin") => {
    await api.updateUser(id, { role: value });
    await searchUsers();
  };
  const removeUser = async (id: string) => {
    if (!confirm("Delete this user and their prediction history?")) return;
    await api.deleteUser(id);
    await searchUsers();
  };
  const removePrediction = async (id: string) => {
    if (!confirm("Delete this prediction log?")) return;
    await api.deletePrediction(id);
    await searchPredictions();
  };
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-[1100px] px-3 py-4 sm:px-5 md:py-7">
        <BrandHeader />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Admin Portal</h1>
            <p className="text-[10px] text-gray-500">
              JWT-protected system and data management
            </p>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-2 text-[10px] text-gray-600"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          <div className="section-card p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold">
              <KeyRound className="h-4 w-4 text-green-600" />
              System Key &amp; AI Management
            </div>
            <label className="label">Current API Key</label>
            <div className="mt-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[10px] text-gray-600">
              {config?.apiKeyMasked || "Loading…"}
            </div>
            <label className="label mt-3 block">
              Replace OpenRouter API Key
            </label>
            <input
              className="field mt-1"
              type="password"
              placeholder="sk-or-v1-…"
              value={key}
              onChange={(e : any) => setKey(e.target.value)}
            />
            <label className="label mt-3 block">Selected model</label>
            <select
              className="field mt-1"
              value={model}
              onChange={(e : any) => setModel(e.target.value)}
            >
              <option value="openrouter/free">
                openrouter/free (free router)
              </option>
              <option value="openai/gpt-oss-20b:free">
                openai/gpt-oss-20b:free
              </option>
              <option value="google/gemma-2-9b-it:free">
                google/gemma-2-9b-it:free
              </option>
              <option value="meta-llama/llama-3.1-8b-instruct:free">
                meta-llama/llama-3.1-8b-instruct:free
              </option>
            </select>
            <button
              onClick={() => setEnabled((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-[10px]"
            >
              AI predictions{" "}
              <span className={enabled ? "text-green-600" : "text-gray-400"}>
                {enabled ? (
                  <ToggleRight className="h-6 w-6" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </span>
            </button>
            <button
              onClick={() => void save()}
              className="mt-3 flex h-9 w-full items-center justify-center gap-1 rounded bg-green-600 text-[11px] font-semibold text-white"
            >
              <Save className="h-3.5 w-3.5" /> Save configuration
            </button>
            {message && (
              <div className="mt-2 rounded bg-green-50 p-2 text-[10px] text-green-700">
                {message}
              </div>
            )}
          </div>
          <div className="section-card overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setTab("users")}
                className={`flex items-center gap-1 px-4 py-3 text-[11px] ${tab === "users" ? "border-b-2 border-green-500 font-semibold text-green-700" : "text-gray-500"}`}
              >
                <Users className="h-3.5 w-3.5" /> User Directory
              </button>
              <button
                onClick={() => setTab("predictions")}
                className={`flex items-center gap-1 px-4 py-3 text-[11px] ${tab === "predictions" ? "border-b-2 border-green-500 font-semibold text-green-700" : "text-gray-500"}`}
              >
                <FileText className="h-3.5 w-3.5" /> Prediction Logs
              </button>
            </div>
            {tab === "users" ? (
              <div className="p-3">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    className="field min-w-0 flex-1"
                    placeholder="Search name or email"
                    value={userQ}
                    onChange={(e : any) => setUserQ(e.target.value)}
                  />
                  <button
                    onClick={() => void searchUsers()}
                    className="rounded border border-gray-200 bg-white px-3"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full min-w-[650px] text-left text-[10px]">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-2">User</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-t border-gray-100">
                          <td className="p-2 font-medium">{u.name}</td>
                          <td className="p-2 text-gray-500">{u.email}</td>
                          <td className="p-2">
                            <span
                              className={`rounded px-2 py-1 ${u.role === "admin" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  void role(
                                    u._id,
                                    u.role === "admin" ? "user" : "admin",
                                  )
                                }
                                className="rounded border border-gray-200 px-2 py-1"
                              >
                                {u.role === "admin"
                                  ? "Make user"
                                  : "Make admin"}
                              </button>
                              <button
                                onClick={() => void removeUser(u._id)}
                                className="rounded border border-red-200 px-2 py-1 text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    className="field min-w-0 flex-1"
                    placeholder="Filter by crop"
                    value={cropQ}
                    onChange={(e : any) => setCropQ(e.target.value)}
                  />
                  <button
                    onClick={() => void searchPredictions()}
                    className="rounded border border-gray-200 bg-white px-3"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full min-w-[760px] text-left text-[10px]">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">User</th>
                        <th className="p-2">Crop</th>
                        <th className="p-2">Confidence</th>
                        <th className="p-2">Location</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((p) => (
                        <tr key={p._id} className="border-t border-gray-100">
                          <td className="p-2">
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                          <td className="p-2">{p.userId?.email || "—"}</td>
                          <td className="p-2 font-semibold text-green-700">
                            {p.recommendedCrop}
                          </td>
                          <td className="p-2">{p.confidenceScore}%</td>
                          <td className="p-2 max-w-[180px] truncate">
                            {p.inputs?.location}
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => void removePrediction(p._id)}
                              className="rounded border border-red-200 p-1 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[9px] text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin actions are server-authorized; the UI alone does not grant
          privileges.
        </div>
      </div>
    </div>
  );
}
