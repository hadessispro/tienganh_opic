import { extractResponsesText, getOpenAIKey, readJsonBody, requirePost, sendJson } from "./_utils.js";

const rubricKeys = [
  "Global Tasks and Functions",
  "Context / Content",
  "Text Type",
  "Accuracy"
];

function deepSeekKey() {
  return process.env.DEEPSEEK_API_KEY || "";
}

function deepSeekConfig() {
  return {
    baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat"
  };
}

function fallbackScore(payload) {
  const transcript = String(payload.transcript || "");
  const words = transcript
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const unique = new Set(words);
  const wpm = payload.durationSeconds > 0 ? Math.round((words.length / payload.durationSeconds) * 60) : 0;
  const overall = Math.max(35, Math.min(88, Math.round(38 + words.length * 0.7 + unique.size * 0.35)));
  const level = overall >= 78 ? "IH" : overall >= 64 ? "IM3" : overall >= 52 ? "IM1-IM2" : "IL";

  return {
    provider: "local-fallback",
    level,
    overall,
    wordsPerMinute: wpm,
    rubric: rubricKeys.map((name, index) => ({
      name,
      score: Math.max(30, Math.min(95, overall - 6 + index * 3)),
      feedback: "Backend AI is unavailable, so this is a local heuristic estimate."
    })),
    strengths: ["Có bản ghi và transcript để tự rà lại bài nói."],
    improvements: ["Thêm ví dụ cụ thể, nối câu rõ hơn và bám sát keyword của câu hỏi."],
    sampleUpgrade:
      "Try answering with a clear point, one personal example, and one short explanation of why it matters.",
    proofread: transcript,
    errors: [
      {
        original: "it make me feel excited",
        highlightWord: "make",
        explanation: "Chủ ngữ \"it\" là ngôi thứ ba số ít nên động từ phải thêm \"s\": \"it makes me feel excited\". Đây là lỗi chia động từ rất phổ biến khi nói nhanh."
      }
    ],
    rawProvider: "local-fallback"
  };
}

function buildPrompt(payload) {
  return [
    "You are an OPIC speaking examiner and coach.",
    "Score the learner response using the four OPIC rubric dimensions.",
    "Return ONLY valid JSON. Do not wrap in markdown.",
    "",
    "JSON schema:",
    "{",
    '  "level": "IL | IM1 | IM2 | IM3 | IH | AL",',
    '  "overall": 0-100,',
    '  "wordsPerMinute": number,',
    '  "rubric": [',
    '    { "name": "Global Tasks and Functions", "score": 0-100, "feedback": "Vietnamese feedback" },',
    '    { "name": "Context / Content", "score": 0-100, "feedback": "Vietnamese feedback" },',
    '    { "name": "Text Type", "score": 0-100, "feedback": "Vietnamese feedback" },',
    '    { "name": "Accuracy", "score": 0-100, "feedback": "Vietnamese feedback" }',
    "  ],",
    '  "strengths": ["Vietnamese bullet"],',
    '  "improvements": ["Vietnamese bullet"],',
    '  "sampleUpgrade": "A better English answer sample, 70-110 words",',
    '  "proofread": "A grammatically corrected and polished version of the user\'s transcript",',
    '  "errors": [',
    "    {",
    '      "original": "The incorrect sentence or phrase from the transcript",',
    '      "highlightWord": "The specific incorrect word in original to underline/color red in UI",',
    '      "explanation": "Detailed explanation of why it is wrong and how to fix it in Vietnamese"',
    "    }",
    "  ]",
    "}",
    "",
    `Question: ${payload.question || ""}`,
    `Topic: ${payload.topic || ""}`,
    `Level target: ${payload.level || ""}`,
    `Duration seconds: ${payload.durationSeconds || 0}`,
    `Transcript: ${payload.transcript || ""}`
  ].join("\n");
}

function normalizeScore(data, provider) {
  const rubric = Array.isArray(data.rubric) ? data.rubric : [];
  return {
    provider,
    level: String(data.level || "IM"),
    overall: Number(data.overall || 0),
    wordsPerMinute: Number(data.wordsPerMinute || 0),
    rubric: rubricKeys.map((name, index) => {
      const item = rubric.find((entry) => entry?.name === name) || rubric[index] || {};
      return {
        name,
        score: Number(item.score || 0),
        feedback: String(item.feedback || "")
      };
    }),
    strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : [],
    improvements: Array.isArray(data.improvements) ? data.improvements.map(String) : [],
    sampleUpgrade: String(data.sampleUpgrade || ""),
    proofread: String(data.proofread || ""),
    errors: Array.isArray(data.errors)
      ? data.errors.map((err) => ({
          original: String(err.original || ""),
          highlightWord: String(err.highlightWord || ""),
          explanation: String(err.explanation || "")
        }))
      : []
  };
}

async function scoreWithDeepSeek(payload) {
  const apiKey = deepSeekKey();
  if (!apiKey) return null;

  const { baseUrl, model } = deepSeekConfig();
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a strict but helpful OPIC speaking examiner. Return valid JSON only. Feedback language must be Vietnamese."
        },
        { role: "user", content: buildPrompt(payload) }
      ],
      temperature: 0.2,
      max_tokens: 1400,
      response_format: { type: "json_object" }
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.error?.message || "DeepSeek scoring request failed.");
    error.status = response.status;
    error.detail = body?.error || body;
    throw error;
  }

  const text = body?.choices?.[0]?.message?.content || "{}";
  return normalizeScore(JSON.parse(text), `deepseek:${model}`);
}

async function scoreWithOpenAI(payload) {
  const apiKey = getOpenAIKey();
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SCORE_MODEL || "gpt-4.1-mini",
      input: buildPrompt(payload),
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.error?.message || "OpenAI scoring request failed.");
    error.status = response.status;
    error.detail = body?.error || body;
    throw error;
  }

  return normalizeScore(JSON.parse(extractResponsesText(body) || "{}"), "openai");
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const payload = await readJsonBody(req);
    if (!payload.transcript) {
      sendJson(res, 400, { error: "missing_transcript", message: "Transcript is required for scoring." });
      return;
    }

    const providerErrors = [];

    try {
      const score = await scoreWithDeepSeek(payload);
      if (score) {
        sendJson(res, 200, score);
        return;
      }
    } catch (error) {
      providerErrors.push(`DeepSeek: ${error.message}`);
    }

    try {
      const score = await scoreWithOpenAI(payload);
      if (score) {
        sendJson(res, 200, score);
        return;
      }
    } catch (error) {
      providerErrors.push(`OpenAI: ${error.message}`);
    }

    const score = fallbackScore(payload);
    if (providerErrors.length) {
      score.providerWarning = providerErrors.join(" | ");
    }

    sendJson(res, 200, score);
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: "score_failed",
      message: error.message || "Unable to score response.",
      detail: error.detail
    });
  }
}
