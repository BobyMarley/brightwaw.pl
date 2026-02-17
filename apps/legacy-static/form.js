const form = document.querySelector("form");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const adresInput = document.getElementById("adres");
const sendButton = document.getElementById("send");

let isSubmitting = false;
const I18N = (typeof window !== "undefined" && window.BW_I18N && window.BW_I18N.ui) ? window.BW_I18N.ui : {};
const MSG = {
  fillRequired: I18N.fillRequired || "Prosze wypelnic wszystkie pola.",
  invalidPhone: I18N.invalidPhone || "Prosze podac poprawny numer telefonu.",
  sending: I18N.sending || "Wysylanie...",
  sendErrorPrefix: I18N.submitErrorPrefix || "Wystapil blad wysylania.",
  sendRetry: I18N.sendRetry || "Sprobuj ponownie.",
};

function resolveApiEndpoint() {
  const runtimeConfig = (typeof window !== "undefined" && window.BRIGHTWAW_ENV) ? window.BRIGHTWAW_ENV : {};
  const explicitEndpoint = runtimeConfig.TELEGRAM_PROXY_URL || localStorage.getItem("BW_TELEGRAM_ENDPOINT");
  if (explicitEndpoint) return explicitEndpoint;

  const metaBase = document.querySelector('meta[name="bw:api-base-url"]')?.content || "";
  const runtimeBase = runtimeConfig.API_BASE_URL || localStorage.getItem("BW_API_BASE_URL") || metaBase;
  const fallbackBase = "";
  const base = (runtimeBase || fallbackBase).replace(/\/$/, "");
  return base ? `${base}/api/telegram_proxy` : "/api/telegram_proxy";
}

if (form && nameInput && phoneInput && adresInput && sendButton) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!nameInput.value.trim() || !adresInput.value.trim() || !phoneInput.value.trim()) {
      alert(MSG.fillRequired);
      return;
    }

    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (phoneDigits.length < 11) {
      alert(MSG.invalidPhone);
      return;
    }

    isSubmitting = true;
    sendButton.disabled = true;
    const originalText = sendButton.textContent;
    sendButton.textContent = MSG.sending;
    sendButton.style.opacity = "0.7";
    sendButton.style.cursor = "not-allowed";

    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const localTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const cleaningTypeText = vm.cleaningType === "generalna" ? "Generalne sprzatanie" : "Standardowe sprzatanie";
    const selectedItemsText = vm.selectedItems.map((item) => `${item.title} - ${item.count}`).join(" | ") || "Nie wybrano";

    const message = [
      "Nowe zamowienie sprzatania",
      `Imie: ${nameInput.value}`,
      `Telefon: ${phoneInput.value}`,
      `Adres: ${adresInput.value}`,
      `Typ sprzatania: ${cleaningTypeText}`,
      `Wybrano: ${selectedItemsText}`,
      `Data: ${localDate}`,
      `Czas: ${localTime}`
    ].join("\n");

    try {
      const response = await fetch(resolveApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `HTTP ${response.status}`);
      }

      if (typeof gtag_report_conversion === "function") {
        gtag_report_conversion();
      }

      modalContainer.classList.remove("active");
      successModalContainer.style.display = "block";

      form.reset();
      vm.selectedItems = [];
      window.dispatchEvent(new CustomEvent("reset-button-counter"));
    } catch (error) {
      console.error("Blad wysylania:", error);
      alert(`${MSG.sendErrorPrefix} ${error?.message || MSG.sendRetry}`);
    } finally {
      isSubmitting = false;
      sendButton.disabled = false;
      sendButton.textContent = originalText;
      sendButton.style.opacity = "1";
      sendButton.style.cursor = "pointer";
    }
  });
}


