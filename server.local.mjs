import { createReadStream, existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 3000);

function loadEnvFile(filename) {
  const envPath = path.join(rootDir, filename);
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const scoreHandler = (await import(pathToFileURL(path.join(rootDir, "api", "score.js")))).default;
const transcribeHandler = (await import(pathToFileURL(path.join(rootDir, "api", "transcribe.js")))).default;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

function sendStatic(res, filepath) {
  const ext = path.extname(filepath).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", mimeTypes.get(ext) || "application/octet-stream");
  if (filepath.includes(`${path.sep}assets${path.sep}`)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  createReadStream(filepath).pipe(res);
}

function safeDistPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const filepath = path.resolve(distDir, relative);
  if (!filepath.startsWith(distDir)) return null;
  return filepath;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/api/health") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true, deepseek: Boolean(process.env.DEEPSEEK_API_KEY) }));
      return;
    }

    if (url.pathname === "/api/score") {
      await scoreHandler(req, res);
      return;
    }

    if (url.pathname === "/api/transcribe") {
      await transcribeHandler(req, res);
      return;
    }

    const filepath = safeDistPath(url.pathname);
    if (filepath && existsSync(filepath)) {
      sendStatic(res, filepath);
      return;
    }

    const indexPath = path.join(distDir, "index.html");
    const html = await readFile(indexPath, "utf8");
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "local_server_error", message: error.message }));
  }
});

server.listen(port, () => {
  console.log(`OPIC local app + API: http://localhost:${port}`);
  console.log(`DeepSeek configured: ${process.env.DEEPSEEK_API_KEY ? "yes" : "no"}`);
});
