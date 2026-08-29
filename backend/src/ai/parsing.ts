export function parseJsonObject<T>(content: unknown): T {
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const fenced = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return JSON.parse(fenced) as T; } catch {
    const start = fenced.indexOf("{");
    const end = fenced.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(fenced.slice(start, end + 1)) as T;

function parseAIJson<T>(raw: unknown): T {
  if (typeof raw !== "string") {
    throw new Error("AI response was not text");
  }

  let text = raw.trim();

  // Remove markdown fences such as ```json ... ```
  text = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // First try the complete response.
  try {
    return parseAIJson(text) as T;
  } catch {
    // Continue below: some models add a short explanation around the JSON.
  }

  // Extract the outermost JSON object/array from surrounding prose.
  const starts = [text.indexOf("{"), text.indexOf("[")].filter((n) => n >= 0);
  if (!starts.length) {
    throw new Error("AI returned invalid JSON");
  }

  const start = Math.min(...starts);
  const objectEnd = text.lastIndexOf("}");
  const arrayEnd = text.lastIndexOf("]");
  const end = Math.max(objectEnd, arrayEnd);

  if (end <= start) {
    throw new Error("AI returned invalid JSON");
  }

  const candidate = text.slice(start, end + 1);

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // A common model failure is trailing commas.
    const cleaned = candidate
      .replace(/,\s*([}\]])/g, "$1")
      .trim();

    return JSON.parse(cleaned) as T;
  }
}

    throw new Error("AI returned invalid JSON");
  }
}
