import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { HomePage } from "../features/home/components/home-page";
import { getHomePageDataForPath } from "../features/home/loaders";
import { getSiteI18nVars } from "../lib/i18n/site-vars";
import { loadLegacyPage } from "../lib/legacy-page";

export const useIndexPayload = routeLoader$(async (event) => {
  const page = await loadLegacyPage(event.url.pathname);
  const i18n = getSiteI18nVars(event.url.pathname);
  const useNative = event.url.searchParams.get("native") === "1";
  const homeData = getHomePageDataForPath(event.url.pathname);
  return { page, i18n, useNative, homeData };
});

export const useSendLeadAction = routeAction$(async (data, event) => {
  const name = String(data.name ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const address = String(data.address ?? "").trim();
  const comment = String(data.message ?? "").trim();

  if (!name || !phone || !address) {
    return { ok: false, error: "Missing required fields" };
  }

  const telegramMessage = [
    "<b>Nowa prośba (Qwik native)</b>",
    `Imię: ${name}`,
    `Telefon: ${phone}`,
    `Adres: ${address}`,
    `Komentarz: ${comment || "-"}`,
    `Strona: ${event.url.pathname}`,
  ].join("\n");

  const response = await event.fetch(new URL("/api/telegram_proxy", event.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: telegramMessage }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    return { ok: false, error: payload?.message || `HTTP ${response.status}` };
  }

  return { ok: true };
});

export default component$(() => {
  const payload = useIndexPayload();

  if (payload.value.useNative) {
    const action = useSendLeadAction();
    return <HomePage data={payload.value.homeData} sendLeadAction={action} />;
  }

  if (!payload.value.page) return null;
  const i18nInline = `window.BW_I18N=${JSON.stringify(payload.value.i18n).replace(/</g, "\\u003c")};`;

  return (
    <>
      <script dangerouslySetInnerHTML={i18nInline} />
      <div dangerouslySetInnerHTML={payload.value.page.bodyHtml} />
      {payload.value.page.scripts.map((script, index) => {
        if (script.src) {
          return (
            <script
              key={`legacy-script-src-${index}`}
              src={script.src}
              defer={script.defer}
              type={script.type}
            />
          );
        }

        if (script.content) {
          return (
            <script
              key={`legacy-script-inline-${index}`}
              type={script.type}
              dangerouslySetInnerHTML={script.content}
            />
          );
        }

        return null;
      })}
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const payload = resolveValue(useIndexPayload);
  if (payload?.useNative) {
    return {
      title: `${payload.homeData.seo.title} [Qwik Native Preview]`,
      meta: [{ name: "description", content: payload.homeData.seo.description }],
      links: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
        },
        { rel: "stylesheet", href: "/index.css?ver11" },
      ],
    };
  }
  return payload?.page?.head ?? { title: "BrightHouse Cleaning" };
};
