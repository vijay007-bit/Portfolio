const content = require("../../src/content");
const {
  DEFAULT_MODEL,
  MAX_HISTORY_ITEMS,
  MAX_MESSAGE_LENGTH,
  buildSystemPrompt,
  sanitizeHistory,
  extractAssistantReply,
  createOpenRouterPayload,
  createDigitalTwinService,
} = require("../../src/services/digitalTwin");

describe("digital twin service", () => {
  it("builds a system prompt from profile content", () => {
    const prompt = buildSystemPrompt(content);

    expect(prompt).toContain("Digital Twin");
    expect(prompt).toContain("Vijay Vikram Singh");
    expect(prompt).toContain("Career Journey");
  });

  it("sanitizes and limits history", () => {
    const history = sanitizeHistory([
      { role: "assistant", content: "  hello " },
      { role: "user", content: "" },
      { role: "invalid", content: "question" },
      null,
    ]);

    expect(history).toEqual([
      { role: "assistant", content: "hello" },
      { role: "user", content: "question" },
    ]);

    const manyItems = Array.from({ length: MAX_HISTORY_ITEMS + 3 }).map((_, index) => ({
      role: "user",
      content: `m-${index}`,
    }));
    expect(sanitizeHistory(manyItems)).toHaveLength(MAX_HISTORY_ITEMS);
  });

  it("extracts assistant reply safely", () => {
    expect(
      extractAssistantReply({
        choices: [{ message: { content: "  focused answer  " } }],
      })
    ).toBe("focused answer");

    expect(extractAssistantReply({ choices: [] })).toBe("");
    expect(extractAssistantReply({})).toBe("");
  });

  it("creates payload with system, history and user message", () => {
    const payload = createOpenRouterPayload({
      model: DEFAULT_MODEL,
      systemPrompt: "system",
      history: [{ role: "assistant", content: "prev" }],
      message: "next",
    });

    expect(payload.model).toBe(DEFAULT_MODEL);
    expect(payload.messages).toEqual([
      { role: "system", content: "system" },
      { role: "assistant", content: "prev" },
      { role: "user", content: "next" },
    ]);
  });

  it("validates missing message", async () => {
    const service = createDigitalTwinService({
      profileContent: content,
      apiKey: "test-key",
      fetchImpl: vi.fn(),
    });

    await expect(service.askCareerQuestion({ message: "  " })).rejects.toMatchObject({
      statusCode: 400,
      message: "Message is required.",
    });
  });

  it("validates oversized message", async () => {
    const service = createDigitalTwinService({
      profileContent: content,
      apiKey: "test-key",
      fetchImpl: vi.fn(),
    });

    await expect(
      service.askCareerQuestion({ message: "a".repeat(MAX_MESSAGE_LENGTH + 1) })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Message is too long.",
    });
  });

  it("returns configured error when api key is missing", async () => {
    const service = createDigitalTwinService({
      profileContent: content,
      apiKey: "",
      fetchImpl: vi.fn(),
    });

    await expect(service.askCareerQuestion({ message: "hello" })).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it("calls openrouter and returns assistant response", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Career answer" } }],
      }),
    }));

    const service = createDigitalTwinService({
      profileContent: content,
      apiKey: "test-key",
      fetchImpl,
    });

    const result = await service.askCareerQuestion({
      message: "Tell me about your skills",
      history: [{ role: "assistant", content: "previous" }],
    });

    expect(result).toEqual({
      reply: "Career answer",
      model: DEFAULT_MODEL,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toContain("openrouter.ai/api/v1/chat/completions");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer test-key");
  });

  it("surfaces upstream openrouter failures", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 429,
      text: async () => "rate limited",
    }));

    const service = createDigitalTwinService({
      profileContent: content,
      apiKey: "test-key",
      fetchImpl,
    });

    await expect(service.askCareerQuestion({ message: "hi" })).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("handles missing assistant answer in response", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [] }),
    }));

    const service = createDigitalTwinService({
      profileContent: content,
      apiKey: "test-key",
      fetchImpl,
    });

    await expect(service.askCareerQuestion({ message: "hi" })).rejects.toMatchObject({
      statusCode: 502,
    });
  });
});
