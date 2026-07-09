import { useEffect, useMemo, useRef } from "react";

const routeByExactText = new Map([
  ["Trang chủ", "/"],
  ["⌂ Trang chủ", "/"],
  ["Thi thử", "/thi-thu/part-1"],
  ["▤ Thi thử", "/thi-thu/part-1"],
  ["Luyện OPIC", "/luyen-forecast"],
  ["Luyện OPIC", "/luyen-forecast"],
  ["⛗ Luyện OPIC", "/luyen-forecast"],
  ["⛗ Luyện OPIC", "/luyen-forecast"],
  ["Mua Xịn", "/nang-cap"],
  ["Dành cho giáo viên", "/giao-vien"],
  ["🗨 Dành cho giáo viên", "/giao-vien"],
  ["Sổ từ vựng", "/so-tu-vung"],
  ["Học sửa lỗi", "/hoc-sua-loi"],
  ["🔧 Học sửa lỗi", "/hoc-sua-loi"],
  ["Khóa học phát âm", "/pronunciation"],
  ["Luyện S/es", "/hoc-sua-loi/s-es"],
  ["Luyện đuôi -ed", "/hoc-sua-loi/duoi-ed"],
  ["Hiện tại hoàn thành", "/hoc-sua-loi/hien-tai-hoan-thanh"],
  ["Hiện tại tiếp diễn", "/hoc-sua-loi/hien-tai-tiep-dien"],
  ["Thì tương lai", "/hoc-sua-loi/tuong-lai"],
  ["Luyện phát âm", "/pronunciation"],
  ["Về trang chủ", "/"],
  ["Xem điều khoản đầy đủ ›", "/dieu-khoan"],
  ["Xem điều khoản đầy đủ", "/dieu-khoan"],
  ["Câu hỏi khác", "/question-answer/part1"]
]);

function cleanText(element) {
  return element.textContent.replace(/\s+/g, " ").trim();
}

function scopeLegacyStyles(styles) {
  return styles
    .replace(/:root\s*\{/g, ".legacy-page{")
    .replace(/body\s*\{/g, ".legacy-page{")
    .replace(/\*\s*\{/g, ".legacy-page *{")
    .replace(/#5012e6/gi, "#0f172a")
    .replace(/#ec268f/gi, "#0f172a")
    .replace(/#16c5b0/gi, "#0f172a")
    .replace(/#1ba7e6/gi, "#0f172a")
    .replace(/#f3eefe/gi, "#f1f5f9")
    .replace(/rgba\(80,\s*18,\s*230,\s*(0\.\d+|\d+)\)/gi, "rgba(15,23,42,0.18)")
    .concat(`
.legacy-page .brand {
  color: #001c46 !important;
  font-size: 20px !important;
  font-weight: 800 !important;
  gap: 10px !important;
  letter-spacing: 0.5px !important;
  display: flex !important;
  align-items: center !important;
}
.legacy-page .brand .logo {
  display: none !important;
}
.legacy-page .fbtn {
  color: #0f172a !important;
}
.legacy-page .divider-v {
  background: #cbd5e1 !important;
}
`);
}

function lessonKeyFromPath(path) {
  if (path.includes("hien-tai-hoan-thanh")) return "present-perfect";
  if (path.includes("hien-tai-tiep-dien")) return "present-continuous";
  if (path.includes("tuong-lai")) return "future";
  return "ed-tail";
}

function prepareScript(pageId, path, script) {
  if (!pageId.startsWith("exercise")) return script;
  window.__LUYENNOI_LESSON__ = lessonKeyFromPath(path);
  return script.replace(
    /const\s+LESSON\s*=\s*["']ed-tail["'];/,
    'const LESSON = window.__LUYENNOI_LESSON__ || "ed-tail";'
  );
}

function exportedFunctionNames(script) {
  return [...script.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(
    (match) => match[1]
  );
}

function routeFromHref(href) {
  if (!href || href === "#") return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return undefined;

  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) return url.href;

  if (url.pathname.startsWith("/alphafeature/pronun/")) {
    return "/pronunciation";
  }

  return url.pathname + url.search + url.hash;
}

function routeFromElement(element, pageId) {
  const text = cleanText(element);
  const tag = element.tagName.toLowerCase();

  if (element.classList.contains("brand")) return "/";
  if (element.classList.contains("back")) return -1;
  if (element.classList.contains("btn-buy")) return "/nang-cap";

  if (tag === "a") {
    const hrefRoute = routeFromHref(element.getAttribute("href"));
    if (hrefRoute) return hrefRoute;
    if (hrefRoute === undefined) return undefined;
  }

  if (pageId === "hocSuaLoi" && element.classList.contains("card")) {
    if (text.includes("Khóa học phát âm")) return "/pronunciation";
    if (text.includes("Luyện S/es")) return "/hoc-sua-loi/s-es";
    if (text.includes("Luyện đuôi -ed")) return "/hoc-sua-loi/duoi-ed";
    if (text.includes("Hiện tại hoàn thành")) return "/hoc-sua-loi/hien-tai-hoan-thanh";
    if (text.includes("Hiện tại tiếp diễn")) return "/hoc-sua-loi/hien-tai-tiep-dien";
    if (text.includes("Thì tương lai")) return "/hoc-sua-loi/tuong-lai";
  }

  if (routeByExactText.has(text)) return routeByExactText.get(text);
  if (text.includes("2 phút kiểm tra nhanh Part 1")) return "/thi-thu/part-1";
  if (text.includes("Thi thử và nhận điểm ngay")) return "/thi-thu/part-1";
  if (text === "PART 1 ›") return "/question-answer/part1";
  if (text === "PART 2 ›") return "/question-answer/part2";
  if (text === "PART 3 ›") return "/question-answer/part3";
  if (text === "Luyện câu này") {
    return "/question-answer/PART%201~Do%20you%20like%20your%20work%20or%20studies%3F";
  }
  if (text === "Part 2" || text === "Part 3" || text === "Full Test") return "/thi-thu/part-1";
  if (text.includes("Thi thử Full Test")) return "/thi-thu/part-1";
  if (text.includes("Thanh toán") && tag === "button") return "/thanh-toan";
  if (text === "Thoát" && !element.getAttribute("onclick")) return "/thi-thu";

  return undefined;
}

export default function LegacyPage({ page, path, onNavigate }) {
  const containerRef = useRef(null);
  const scopedStyles = useMemo(() => scopeLegacyStyles(page.styles), [page.styles]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const handleClick = (event) => {
      const target = event.target.closest("a, button, .card, .back, .brand, .logout, .account");
      if (!target || !node.contains(target)) return;

      if (target.classList.contains("logout") || target.classList.contains("account")) {
        event.preventDefault();
        onNavigate("/utils/login");
        return;
      }

      const route = routeFromElement(target, page.id);
      if (route === undefined) return;

      event.preventDefault();
      onNavigate(route);
    };

    node.addEventListener("click", handleClick);
    return () => node.removeEventListener("click", handleClick);
  }, [onNavigate, page.id]);

  useEffect(() => {
    const timers = [];
    const previousSetInterval = window.setInterval;
    const previousSetTimeout = window.setTimeout;
    const exportedNames = new Set();

    window.setInterval = (...args) => {
      const id = previousSetInterval(...args);
      timers.push(["interval", id]);
      return id;
    };
    window.setTimeout = (...args) => {
      const id = previousSetTimeout(...args);
      timers.push(["timeout", id]);
      return id;
    };

    try {
      for (const originalScript of page.scripts) {
        const script = prepareScript(page.id, path, originalScript);
        const names = exportedFunctionNames(script);
        const exports = names
          .map((name) => {
            exportedNames.add(name);
            return `if (typeof ${name} === "function") window[${JSON.stringify(name)}] = ${name};`;
          })
          .join("\n");

        const runnable = `${script}\n${exports}\n//# sourceURL=legacy-${page.id}.js`;
        new Function("window", "document", runnable)(window, document);
      }
    } finally {
      window.setInterval = previousSetInterval;
      window.setTimeout = previousSetTimeout;
    }

    return () => {
      for (const [type, id] of timers) {
        if (type === "interval") window.clearInterval(id);
        else window.clearTimeout(id);
      }
      for (const name of exportedNames) {
        delete window[name];
      }
      delete window.__LUYENNOI_LESSON__;
    };
  }, [page, path]);

  const processedBody = useMemo(() => {
    const logoHtml = `
<div class="brand" style="display:flex !important;align-items:center !important;gap:10px !important;margin-bottom:34px !important;cursor:pointer !important;border:none !important;background:transparent !important;padding:0 !important;color:#001c46 !important;font-size:20px !important;font-weight:800 !important;letter-spacing:0.5px !important;">
  <svg viewBox="0 0 200 200" width="28" height="28" style="flex-shrink:0;">
    <path d="M 35,90 L 35,35 L 165,35 L 165,90" fill="none" stroke="#00a896" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"></path>
    <path d="M 35,110 L 35,155 L 85,155 L 100,175 L 115,155 L 165,155 L 165,110" fill="none" stroke="#001c46" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"></path>
    <path d="M 25,100 L 55,100 C 65,100 70,50 80,50 C 90,50 95,150 105,150 C 115,150 120,50 130,50 C 140,50 145,100 155,100 L 175,100" fill="none" stroke="#00a896" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
  <span style="font-family:'Inter',sans-serif;">LUYENOPIC</span>
</div>
    `;
    return page.body.replace(/<div\s+class=["']brand["'][^>]*>[\s\S]*?<\/div>/gi, logoHtml);
  }, [page.body]);

  return (
    <>
      <style>{scopedStyles}</style>
      <div
        ref={containerRef}
        className="legacy-page"
        dangerouslySetInnerHTML={{ __html: processedBody }}
      />
    </>
  );
}
