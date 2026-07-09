import { readFile } from "node:fs/promises";

import formidable from "formidable";

import { getOpenAIKey, publicConfigError, requirePost, sendJson } from "./_utils.js";

export const config = {
  api: {
    bodyParser: false
  }
};

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function parseMultipart(req) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_AUDIO_BYTES,
    keepExtensions: true
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ fields, files });
    });
  });
}

function firstFile(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const apiKey = getOpenAIKey();
  if (!apiKey) {
    sendJson(res, 500, publicConfigError());
    return;
  }

  try {
    const { fields, files } = await parseMultipart(req);
    const file = firstFile(files.audio || files.file);

    if (!file) {
      sendJson(res, 400, { error: "missing_audio", message: "Upload an audio file with field name `audio`." });
      return;
    }

    const buffer = await readFile(file.filepath);
    const filename = file.originalFilename || "opic-recording.webm";
    const mimeType = file.mimetype || "audio/webm";
    const model = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe";
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language || "en";

    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: mimeType }), filename);
    formData.append("model", model);
    formData.append("language", language);
    formData.append("response_format", "json");

    const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      sendJson(res, upstream.status, {
        error: "transcription_failed",
        message: data?.error?.message || "OpenAI transcription request failed.",
        detail: data?.error || data
      });
      return;
    }

    sendJson(res, 200, {
      text: data.text || "",
      model,
      durationHintSeconds: Number(fields.durationSeconds || 0) || undefined
    });
  } catch (error) {
    sendJson(res, 500, {
      error: "transcription_server_error",
      message: error.message || "Unable to transcribe audio."
    });
  }
}
