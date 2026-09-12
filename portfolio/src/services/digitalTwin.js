const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_HISTORY_ITEMS = 8;
const MAX_MESSAGE_LENGTH = 1200;

function toSafeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildSystemPrompt(profileContent) {
  const profile = profileContent?.profile || {};
  const strengths = Array.isArray(profileContent?.strengths)
    ? profileContent.strengths.join(", ")
    : "";

  const journey = Array.isArray(profileContent?.careerJourney)
    ? profileContent.careerJourney
        .map((item) => {
          const period = item?.period?.present
            ? `${item?.period?.start || ""} - Present`
            : `${item?.period?.start || ""} - ${item?.period?.end || ""}`;
          return `${item?.title || ""} at ${item?.company || ""} (${period})`;
        })
        .join("; ")
    : "";

  return [
    "You are Vijay Vikram Singh's Digital Twin on his portfolio website.",
    "Your mission is to answer questions about Vijay's career with confidence, precision, and professionalism.",
    "Use only the provided profile context and do not invent achievements, employers, or credentials.",
    "If a question is outside available context, say so clearly and suggest contacting Vijay directly.",
    "Use concise paragraphs or bullets where useful.",
    "Profile Context:",
    `Name: ${profile.name || "Vijay Vikram Singh"}`,
    `Role: ${profile.role || "Senior iOS Developer"}`,
    `Location: ${profile.location || "India"}`,
    `Summary: ${profile.summary || ""}`,
    `Strengths: ${strengths}`,
    `Career Journey: ${journey}`,
  ].join("\n");
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const role = item.role === "assistant" ? "assistant" : "user";
      const content = toSafeString(item.content).slice(0, MAX_MESSAGE_LENGTH);
      return { role, content };
    })
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_ITEMS);
}

function extractAssistantReply(payload) {
  const reply = payload?.choices?.[0]?.message?.content;

  if (typeof reply === "string" && reply.trim()) {
    return reply.trim();
  }

  return "";
}

function createOpenRouterPayload({ model, systemPrompt, history, message }) {
  return {
    model,
    temperature: 0.35,
    max_tokens: 400,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
  };
}

function createDigitalTwinService(options = {}) {
  const profileContent = options.profileContent || {};
  const apiKey =
    options.apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENROUTES_API_KEY || "";
  const model = options.model || DEFAULT_MODEL;
  const openRouterUrl = options.openRouterUrl || DEFAULT_OPENROUTER_URL;
  const fetchImpl = options.fetchImpl || global.fetch;

  const systemPrompt = buildSystemPrompt(profileContent);

  function isConfigured() {
    return Boolean(apiKey && typeof fetchImpl === "function");
  }

  async function askCareerQuestion({ message, history }) {
    const cleanMessage = toSafeString(message);
    if (!cleanMessage) {
      const error = new Error("Message is required.");
      error.statusCode = 400;
      throw error;
    }

    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      const error = new Error("Message is too long.");
      error.statusCode = 400;
      throw error;
    }

    if (!isConfigured()) {
      const error = new Error("Digital Twin chat is not configured.");
      error.statusCode = 503;
      throw error;
    }

    const payload = createOpenRouterPayload({
      model,
      systemPrompt,
      history: sanitizeHistory(history),
      message: cleanMessage,
    });

    const response = await fetchImpl(openRouterUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": "Vijay Vikram Singh Portfolio",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = toSafeString(await response.text());
      const error = new Error(`OpenRouter request failed (${response.status}). ${details}`.trim());
      error.statusCode = 502;
      throw error;
    }

    const data = await response.json();
    const reply = extractAssistantReply(data);

    if (!reply) {
      const error = new Error("OpenRouter response did not include an assistant reply.");
      error.statusCode = 502;
      throw error;
    }

    return {
      reply,
      model,
    };
  }

  return {
    isConfigured,
    askCareerQuestion,
    model,
  };
}

module.exports = {
  DEFAULT_MODEL,
  MAX_HISTORY_ITEMS,
  MAX_MESSAGE_LENGTH,
  buildSystemPrompt,
  sanitizeHistory,
  extractAssistantReply,
  createOpenRouterPayload,
  createDigitalTwinService,
};
