import type { DocumentHeadValue } from "@builder.io/qwik-city";
import { getPublicRuntimeEnv } from "../env/public";
import type { SeoInput } from "./types";

const localeToOg = (locale: SeoInput["locale"]) => {
  if (locale === "pl") return "pl_PL";
  if (locale === "en") return "en_GB";
  if (locale === "ru") return "ru_RU";
  return "be_BY";
};

const localePath = (locale: SeoInput["locale"]) => {
  if (locale === "pl") return "";
  return `/${locale}`;
};

export const buildSeoHead = (input: SeoInput): DocumentHeadValue => {
  const env = getPublicRuntimeEnv();
  const siteUrl = (env.siteUrl || "https://brightwaw.pl").replace(/\/$/, "");
  const canonical = `${siteUrl}${input.pathname}`;
  const image = input.image || `${siteUrl}/public/og_image.jpg`;

  const languages = [
    { locale: "pl", href: `${siteUrl}/` },
    { locale: "en", href: `${siteUrl}/en/` },
    { locale: "by", href: `${siteUrl}/by/` },
    { locale: "ru", href: `${siteUrl}/ru/` },
  ] as const;

  return {
    title: input.title,
    meta: [
      { name: "description", content: input.description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: input.title },
      { property: "og:description", content: input.description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: image },
      { property: "og:locale", content: localeToOg(input.locale) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: input.title },
      { name: "twitter:description", content: input.description },
      { name: "twitter:image", content: image },
      ...(input.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    links: [
      { rel: "canonical", href: canonical },
      ...languages.map((item) => ({
        rel: "alternate",
        hrefLang: item.locale,
        href: item.href,
      })),
      { rel: "alternate", hrefLang: "x-default", href: `${siteUrl}/` },
      { rel: "alternate", hrefLang: input.locale, href: `${siteUrl}${localePath(input.locale)}${input.pathname}`.replace(/\/+/g, "/").replace(":/", "://") },
    ],
  };
};

