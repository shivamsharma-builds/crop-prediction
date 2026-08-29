export function parseJsonObject<T>(content: unknown): T {
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const fenced = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return JSON.parse(fenced) as T; } catch {
    const start = fenced.indexOf("{");
    const end = fenced.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(fenced.slice(start, end + 1)) as T;
    throw new Error("AI returned invalid JSON");
  }
}
