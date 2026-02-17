import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { HomePage } from "../../features/home/components/home-page";
import { getHomePageDataForPath } from "../../features/home/loaders";

export const useHomeData = routeLoader$(({ url }) => {
  return getHomePageDataForPath(url.pathname);
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
    "<b>Nowa prośba (Qwik preview)</b>",
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
  const data = useHomeData();
  const action = useSendLeadAction();
  return <HomePage data={data.value} sendLeadAction={action} />;
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useHomeData);
  return {
    title: `${data.seo.title} [Qwik Preview]`,
    meta: [{ name: "description", content: data.seo.description }],
    links: [
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
      },
      { rel: "stylesheet", href: "/index.css?ver11" },
    ],
  };
};
