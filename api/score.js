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
  const transcript = String(payload.transcript || "").trim();
  const words = transcript
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const unique = new Set(words);
  const durationSec = Number(payload.durationSeconds) || 0;
  const wpm = durationSec > 0 ? Math.round((words.length / durationSec) * 60) : Math.round(words.length * 1.5);
  const overall = Math.max(35, Math.min(88, Math.round(38 + words.length * 0.7 + unique.size * 0.35)));
  const level = overall >= 78 ? "IH" : overall >= 64 ? "IM3" : overall >= 52 ? "IM1-IM2" : "IL";

  // Dynamic error feedback generated specifically from the learner's ACTUAL transcript text
  const dynamicErrors = [];

  if (transcript.length > 0) {
    if (words.length <= 8) {
      const firstWord = words[0] || transcript;
      dynamicErrors.push({
        original: transcript,
        highlightWord: firstWord,
        explanation: `Câu trả lời khá ngắn (chỉ có ${words.length} từ: "${transcript}"). Trong kỳ thi OPIc, bạn nên phát triển câu trả lời thành câu hoàn chỉnh có chủ ngữ - vị ngữ (ví dụ: "It is located in downtown...") và bổ sung thêm 2-3 câu chi tiết để đạt band điểm IM/IH.`
      });
    } else {
      const lower = transcript.toLowerCase();
      if (lower.includes("it make ") || lower.includes("he make ") || lower.includes("she make ")) {
        dynamicErrors.push({
          original: "it make",
          highlightWord: "make",
          explanation: "Chủ ngữ ngôi thứ ba số ít (it/he/she) đi với động từ hiện tại đơn cần thêm 's' -> 'makes'."
        });
      } else if (lower.includes("i is ") || lower.includes("you is ")) {
        dynamicErrors.push({
          original: lower.includes("i is ") ? "I is" : "you is",
          highlightWord: "is",
          explanation: "Chia sai động từ to be. 'I' đi với 'am', 'you' đi với 'are'."
        });
      } else if (lower.includes(" i ")) {
        dynamicErrors.push({
          original: "i",
          highlightWord: "i",
          explanation: "Đại từ xưng hô 'I' (tôi) trong tiếng Anh luôn luôn phải viết hoa."
        });
      } else {
        const sentences = transcript.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
        const targetSentence = sentences[0] || transcript;
        const targetWord = words[0] || "word";
        dynamicErrors.push({
          original: targetSentence,
          highlightWord: targetWord,
          explanation: `Ý nói "${targetSentence}" của bạn đã đúng hướng. Để đạt trình độ OPIc cao hơn (IH/AL), hãy sử dụng thêm các liên từ mở rộng (như "Furthermore", "In addition") và giải thích chi tiết lý do.`
        });
      }
    }
  }

  return {
    provider: "local-fallback",
    level,
    overall,
    wordsPerMinute: wpm,
    rubric: rubricKeys.map((name, index) => ({
      name,
      score: Math.max(30, Math.min(95, overall - 6 + index * 3)),
      feedback: `Đánh giá dựa trên bài nói thực tế: "${transcript.slice(0, 35)}${transcript.length > 35 ? "..." : ""}"`
    })),
    strengths: [
      `Bài nói đã được ghi nhận: "${transcript.slice(0, 60)}${transcript.length > 60 ? "..." : ""}".`,
      "Có phản xạ nói tiếng Anh trực tiếp."
    ],
    improvements: [
      "Mở rộng thêm chi tiết và ví dụ thực tế bám sát câu hỏi OPIc.",
      "Sử dụng thêm các liên từ (linking words) để liên kết câu mạch lạc hơn."
    ],
    sampleUpgrade: transcript
      ? `For example: "To elaborate on ${transcript}, I usually enjoy this because it helps me relax after work."`
      : "Try answering with a clear point, one personal example, and one short explanation.",
    proofread: transcript
      ? transcript.charAt(0).toUpperCase() + transcript.slice(1)
      : transcript,
    errors: dynamicErrors,
    rawProvider: "local-fallback"
  };
}

function buildPrompt(payload) {
  let learnerContent = "";
  if (Array.isArray(payload.details) && payload.details.length > 0) {
    learnerContent = payload.details
      .filter((d) => d && d.answer && d.answer.trim())
      .map((d) => `[Question ${d.questionNumber || ""}]: ${d.question}\n[Learner Answer]: "${d.answer}"`)
      .join("\n\n");
  }

  if (!learnerContent) {
    learnerContent = `[Question]: ${payload.question || "OPIC Speaking Question"}\n[Learner Answer]: "${payload.transcript || ""}"`;
  }

  return [
    "You are a strict, expert OPIC speaking examiner and coach.",
    "Evaluate the learner's actual responses against the OPIC rubric criteria.",
    "CRITICAL REQUIREMENT: For the 'errors' array, you MUST ONLY extract actual incorrect phrases or weaknesses directly from the learner's provided answers. Do NOT invent or use generic example sentences.",
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
    '  "strengths": ["Vietnamese bullet analyzing learner performance"],',
    '  "improvements": ["Vietnamese bullet advising improvements"],',
    '  "sampleUpgrade": "A high-scoring sample English answer tailored to the test questions (80-120 words)",',
    '  "proofread": "A corrected, polished version of the learner\'s actual transcript",',
    '  "errors": [',
    "    {",
    '      "original": "The exact sentence or phrase from the learner\'s actual answer",',
    '      "highlightWord": "The specific word from original to highlight",',
    '      "explanation": "Detailed Vietnamese feedback explaining why it is weak/incorrect and how to say it better in OPIC"',
    "    }",
    "  ]",
    "}",
    "",
    `Target Level: ${payload.level || "OPIC Test"}`,
    `Total Duration: ${payload.durationSeconds || 900} seconds`,
    "",
    "=== LEARNER RESPONSES TO EVALUATE ===",
    learnerContent
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
