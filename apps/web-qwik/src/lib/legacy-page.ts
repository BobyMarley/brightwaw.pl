import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { DocumentHeadValue } from "@builder.io/qwik-city";

const LEGACY_ROOT = fileURLToPath(new URL("../../../legacy-static/", import.meta.url));

export type LegacyScript = {
  src?: string;
  defer?: boolean;
  type?: string;
  content?: string;
};

export type LegacyPagePayload = {
  bodyHtml: string;
  scripts: LegacyScript[];
  head: DocumentHeadValue;
};

const parseAttributes = (attrsRaw: string): Record<string, string | boolean> => {
  const attrs: Record<string, string | boolean> = {};
  const attrRegex = /([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

  let match = attrRegex.exec(attrsRaw);
  while (match) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4];
    attrs[key] = value ?? true;
    match = attrRegex.exec(attrsRaw);
  }

  return attrs;
};

const normalizeMeta = (meta: Record<string, string | boolean>) => {
  const normalized: Record<string, string> = {};
  Object.entries(meta).forEach(([k, v]) => {
    if (typeof v !== "string") return;
    if (k === "charset") {
      normalized.charSet = v;
      return;
    }
    if (k === "http-equiv") {
      normalized.httpEquiv = v;
      return;
    }
    normalized[k] = v;
  });
  return normalized;
};

const normalizeLink = (link: Record<string, string | boolean>) => {
  const normalized: Record<string, string> = {};
  Object.entries(link).forEach(([k, v]) => {
    if (typeof v !== "string") return;
    if (k === "crossorigin") {
      normalized.crossOrigin = v;
      return;
    }
    if (k === "fetchpriority") {
      normalized.fetchPriority = v;
      return;
    }
    normalized[k] = v;
  });
  return normalized;
};

const normalizeScript = (script: Record<string, string | boolean>) => {
  const normalized: Record<string, string | boolean> = {};
  Object.entries(script).forEach(([k, v]) => {
    if (k === "crossorigin") {
      normalized.crossOrigin = v;
      return;
    }
    normalized[k] = v;
  });
  return normalized;
};

const fileExists = async (path: string) => {
  try {
    await readFile(path, "utf-8");
    return true;
  } catch {
    return false;
  }
};

const resolveLegacyPath = async (pathname: string): Promise<string | null> => {
  const clean = pathname.split("?")[0].split("#")[0];
  const trimmed = clean === "/" ? "/" : clean.replace(/\/+$/, "");
  const base = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  const candidates = [
    base === "" ? `${LEGACY_ROOT}index.html` : `${LEGACY_ROOT}${base}`,
    base === "" ? `${LEGACY_ROOT}index.html` : `${LEGACY_ROOT}${base}.html`,
    base === "" ? `${LEGACY_ROOT}index.html` : `${LEGACY_ROOT}${base}/index.html`,
  ];

  for (const candidate of candidates) {
    if (candidate.includes("..")) continue;
    if (await fileExists(candidate)) return candidate;
  }
  return null;
};

export const loadLegacyPage = async (pathname: string): Promise<LegacyPagePayload | null> => {
  const filePath = await resolveLegacyPath(pathname);
  if (!filePath) return null;

  const html = await readFile(filePath, "utf-8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "BrightHouse Cleaning";

  const metas: Record<string, string>[] = [];
  const links: Record<string, string>[] = [];
  const styles: { style: string }[] = [];
  const scripts: LegacyScript[] = [];

  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headRaw = headMatch?.[1] ?? "";

  headRaw.replace(/<meta\b([^>]*)>/gi, (_, attrsRaw: string) => {
    metas.push(normalizeMeta(parseAttributes(attrsRaw)));
    return "";
  });

  headRaw.replace(/<link\b([^>]*)>/gi, (_, attrsRaw: string) => {
    const parsed = normalizeLink(parseAttributes(attrsRaw));
    if (Object.keys(parsed).length) links.push(parsed);
    return "";
  });

  headRaw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, content: string) => {
    styles.push({ style: content });
    return "";
  });

  headRaw.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrsRaw: string, contentRaw: string) => {
    const attrs = normalizeScript(parseAttributes(attrsRaw));
    scripts.push({
      src: typeof attrs.src === "string" ? attrs.src : undefined,
      type: typeof attrs.type === "string" ? attrs.type : undefined,
      defer: attrs.defer === true,
      content: contentRaw.trim() || undefined,
    });
    return "";
  });

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyRaw = bodyMatch?.[1] ?? "";
  const bodyHtml = bodyRaw.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_, attrsRaw: string, contentRaw: string) => {
      const attrs = normalizeScript(parseAttributes(attrsRaw));
      scripts.push({
        src: typeof attrs.src === "string" ? attrs.src : undefined,
        type: typeof attrs.type === "string" ? attrs.type : undefined,
        defer: attrs.defer === true,
        content: contentRaw.trim() || undefined,
      });
      return "";
    },
  );

  return {
    bodyHtml,
    scripts,
    head: {
      title,
      meta: metas,
      links,
      styles,
    },
  };
};
