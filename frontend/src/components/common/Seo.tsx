import { useEffect } from "react";

const SITE_URL = "https://www.xn--rzo-hoa.com";
const DEFAULT_TITLE = "RÜZO | Beirut Womenswear";
const DEFAULT_DESCRIPTION =
  "Discover RÜZO, a Beirut-born womenswear label shaped around satin sets, fluid dresses, sharp tops, tailored bottoms, and outerwear made to move from day to night.";
const DEFAULT_IMAGE = "/ruzo-share-logo.jpeg";

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
    upsertMeta("property", "og:image:secure_url", imageUrl);
    upsertMeta("property", "og:image:type", imageUrl.endsWith(".jpeg") || imageUrl.endsWith(".jpg") ? "image/jpeg" : "image/webp");
    upsertMeta("property", "og:image:alt", "RÜZO");
    upsertMeta("property", "og:site_name", "RÜZO");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertMeta("name", "twitter:image:alt", "RÜZO");

    if (image === DEFAULT_IMAGE) {
      upsertMeta("property", "og:image:width", "4500");
      upsertMeta("property", "og:image:height", "4500");
    }

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
