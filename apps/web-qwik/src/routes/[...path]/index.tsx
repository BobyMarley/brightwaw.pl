import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { loadLegacyPage } from "../../lib/legacy-page";
import { getSiteI18nVars } from "../../lib/i18n/site-vars";

export const useLegacyPage = routeLoader$(async (event) => {
  const page = await loadLegacyPage(event.url.pathname);
  const i18n = getSiteI18nVars(event.url.pathname);
  if (!page) {
    event.status(404);
    return null;
  }
  return { page, i18n };
});

export default component$(() => {
  const payload = useLegacyPage();
  if (!payload.value) {
    return <main style={{ padding: "40px" }}>Not found</main>;
  }
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
  const payload = resolveValue(useLegacyPage);
  return payload?.page?.head ?? { title: "Not found" };
};
