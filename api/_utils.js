export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function requirePost(req, res) {
  if (req.method === "POST") return true;
  res.setHeader("Allow", "POST");
  sendJson(res, 405, { error: "method_not_allowed" });
  return false;
}

export function getOpenAIKey() {
  return process.env.OPENAI_API_KEY || "";
}

export function publicConfigError() {
  return {
    error: "missing_openai_key",
    message: "Server is missing OPENAI_API_KEY. Add it in Vercel Environment Variables."
  };
}

export async function readJsonBody(req, limitBytes = 1024 * 1024) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > limitBytes) {
      const error = new Error("JSON body too large");
      error.code = "body_too_large";
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function extractResponsesText(data) {
  if (typeof data?.output_text === "string") return data.output_text;

  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.value === "string") return part.value;
    }
  }

  return "";
}
