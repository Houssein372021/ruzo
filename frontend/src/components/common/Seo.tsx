import { useEffect } from "react";

const SITE_URL = "https://www.rüzo.com";
const DEFAULT_TITLE = "RÜZO | Women's Activewear at rüzo";
const DEFAULT_DESCRIPTION =
  "Shop RÜZO activewear at rüzo: sculpting sets, sport bras, and leggings designed for confident everyday movement.";
const DEFAULT_IMAGE = "/site-icon-512.png";

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "product";
  robots?: string;
  jsonLd?: Record<string, unknown>;
};

export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  robots = "index,follow",
  jsonLd,
}: SeoProps) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const canonicalUrl = new URL(path ?? window.location.pathname, SITE_URL).toString();
    const imageUrl = new URL(image, SITE_URL).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "author", "RÜZO");
    upsertMeta("name", "creator", "RÜZO");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:site_name", "Rüzo");
    upsertMeta("name", "twitter:card", image === DEFAULT_IMAGE ? "summary" : "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertCanonical(canonicalUrl);

    const scriptId = "page-json-ld";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!jsonLdString) {
      existingScript?.remove();
      return;
    }

    const script = existingScript ?? document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = jsonLdString;
    if (!existingScript) {
      document.head.append(script);
    }
  }, [description, image, jsonLdString, path, robots, title, type]);

  return null;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }

  element.href = url;
}
