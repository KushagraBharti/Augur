export function cleanText(value: unknown, max = 260) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function statusClass(status?: string | null) {
  if (status === "failed") {
    return "fail";
  }
  if (status === "completed" || status === "success") {
    return "pass";
  }
  return "warn";
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not started";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function confidenceConsequence(toolCall: { status?: string | null; tool_name?: string | null }) {
  if (toolCall.status !== "failed") {
    return "";
  }
  return `${toolCall.tool_name ?? "This source"} failed; Augur must treat that source as unavailable and reduce confidence where it affects the recommendation.`;
}
