import { useEffect } from "react";

import { SITE_ORIGIN } from "../config/pageDefinitions";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

export default function SEO({ definition, page }) {
  useEffect(() => {
    const title = definition.title || page.title;
    const description = definition.description || page.description;
    const url = `${SITE_ORIGIN}${definition.path === "/" ? "/" : definition.path}`;

    document.documentElement.lang = "vi";
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image"
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description
    });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: url });

    let ldJson = document.head.querySelector("#luyennoi-page-schema");
    if (!ldJson) {
      ldJson = document.createElement("script");
      ldJson.id = "luyennoi-page-schema";
      ldJson.type = "application/ld+json";
      document.head.appendChild(ldJson);
    }

    ldJson.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      inLanguage: "vi-VN",
      isPartOf: {
        "@type": "WebSite",
        name: "OPIC",
        url: SITE_ORIGIN
      }
    });
  }, [definition, page]);

  return null;
}
