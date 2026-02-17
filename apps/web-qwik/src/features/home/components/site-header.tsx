import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const SiteHeader = component$(() => {
  const mobileMenuOpen = useSignal(false);

  useVisibleTask$(({ track }) => {
    const isOpen = track(() => mobileMenuOpen.value);
    document.body.classList.toggle("menu-open", isOpen);
  });

  return (
    <header class="header">
      <div class="navbar">
        <div class="flex">
          <a href="https://brightwaw.pl" title="BrightHouse home page on Poland Language" aria-label="BrightHouse home page on Poland Language">
            <img
              class="logo-icon"
              alt="BrightHouse Cleaning Logo"
              width={232}
              height={80}
              src="/public/logo.svg"
              aria-label="BrightHouse Cleaning Logo"
              decoding="async"
            />
          </a>
        </div>

        <div class="nav-menu">
          <ul>
            <li><a href="https://brightwaw.pl/sprzatanie-mieszkan-warszawa.html" title="Sprzątanie mieszkań">Sprzątanie mieszkań</a></li>
            <li><a href="https://brightwaw.pl/cennik.html" title="Cennik">Cennik</a></li>
            <li><a href="https://brightwaw.pl/pranie.html" title="Pranie">Pranie chemiczne</a></li>
            <li><a href="https://g.page/r/CQmCteFzMdvWEB0" title="Opinie">Opinie</a></li>
          </ul>
        </div>

        <div class="nav-icons">
          <a href="https://facebook.com/BrightHouseWaw" class="icons" data-site-facebook title="Odwiedź naszą stronę na Facebooku" aria-label="Odwiedź naszą stronę na Facebooku">
            <img class="posicon" alt="facebook brighthouse cleaning" width={32} height={32} src="/public/facebook.svg" decoding="async" />
          </a>
          <a href="https://instagram.com/cleaning_bright_house/" class="icons" data-site-instagram title="Odwiedź naszą stronę na Instagramie" aria-label="Odwiedź naszą stronę na Instagramie">
            <img class="posicon" alt="instagram brighthouse cleaning" width={32} height={32} src="/public/insta.svg" decoding="async" />
          </a>
          <a href="https://wa.me/message/B3AQALEBNNLJH1" class="icons" data-site-whatsapp title="Napisz do nas wiadomość na WhatsApp" aria-label="Napisz do nas wiadomość na WhatsApp">
            <img class="posicon" alt="whatsapp brighthouse cleaning" width={32} height={32} src="/public/whatsapp.svg" decoding="async" />
          </a>
          <a href="tel:+48888742534" class="icons tel" data-site-phone-href title="Zadzwoń +48 888 742 534" aria-label="Zadzwoń +48 888 742 534">
            <img class="posicon" alt="Zadzwoń +48 888 742 534" width={32} height={32} src="/public/phone_call.svg" decoding="async" />
          </a>
          <div class="phone" data-site-phone title="Numer telefonu do usług sprzątania: +48 888 742 534" aria-label="Numer telefonu do usług sprzątania: +48 888 742 534">+48 888 742 534</div>
        </div>

        <ul class="langSwitch">
          <li>
            <a href="https://brightwaw.pl" id="pl" title="Język polski" aria-label="Język polski" class="active">
              <b class="lang">PL</b>
            </a>
          </li>
          <li> | </li>
          <li>
            <a href="https://brightwaw.pl/en/" id="en" title="Język angielski" aria-label="Język angielski">
              <b class="lang">EN</b>
            </a>
          </li>
        </ul>

        <button
          class={{ "hamburger-menu": true, active: mobileMenuOpen.value }}
          type="button"
          aria-label="Otwórz menu nawigacji"
          aria-expanded={mobileMenuOpen.value}
          aria-controls="mobile-menu"
          onClick$={() => {
            mobileMenuOpen.value = !mobileMenuOpen.value;
          }}
        >
          <span class="hamburger-icon">
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
          </span>
        </button>
      </div>

      <div class={{ overlay: true, active: mobileMenuOpen.value }} id="mobile-menu" aria-hidden={!mobileMenuOpen.value}>
        <div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Menu nawigacji mobilnej">
          <div class="mobile-menu-header">
            <img src="/public/logo.svg" class="mobile-menu-logo" alt="BrightHouse" width={156} height={54} loading="lazy" decoding="async" />
            <button
              class="mobile-menu-close"
              type="button"
              aria-label="Zamknij menu"
              onClick$={() => {
                mobileMenuOpen.value = false;
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <ul class="mobile-langSwitch">
            <li>
              <a href="https://brightwaw.pl" id="pl-mobile" title="Język polski" aria-label="Język polski" class="active">
                <b class="lang">PL</b>
              </a>
            </li>
            <li>
              <a href="https://brightwaw.pl/en/" id="en-mobile" title="Język angielski" aria-label="Język angielski">
                <b class="lang">EN</b>
              </a>
            </li>
          </ul>

          <div class="mobile-nav-menu">
            <ul>
              <li><a class="nav-home" href="https://brightwaw.pl/cennik.html" title="Cennik" aria-label="Cennik">Cennik</a></li>
              <li><a class="nav-pranie" href="https://brightwaw.pl/pranie.html" title="Pranie" aria-label="Pranie chemiczne">Pranie chemiczne</a></li>
              <li><a class="nav-opinie" href="https://g.page/r/CQmCteFzMdvWEB0" title="Opinie" aria-label="Opinie">Opinie</a></li>
            </ul>
          </div>

          <a href="tel:+48888742534" data-site-phone-href class="mobile-menu-cta" aria-label="Zadzwoń do BrightHouse">
            Zadzwoń: <span data-site-phone>+48 888 742 534</span>
          </a>

          <div class="mobile-nav-icons">
            <a href="https://facebook.com/BrightHouseWaw" class="icons" data-site-facebook title="Odwiedź naszą stronę na Facebooku" aria-label="Odwiedź naszą stronę na Facebooku">
              <img class="posicon" alt="facebook brighthouse cleaning" width={32} height={32} src="/public/facebook.svg" decoding="async" />
            </a>
            <a href="https://instagram.com/cleaning_bright_house/" class="icons" data-site-instagram title="Odwiedź naszą stronę na Instagramie" aria-label="Odwiedź naszą stronę na Instagramie">
              <img class="posicon" alt="instagram brighthouse cleaning" width={32} height={32} src="/public/insta.svg" decoding="async" />
            </a>
            <a href="https://wa.me/message/B3AQALEBNNLJH1" class="icons" data-site-whatsapp title="Napisz do nas wiadomość na WhatsApp" aria-label="Napisz do nas wiadomość na WhatsApp">
              <img class="posicon" alt="whatsapp brighthouse cleaning" width={32} height={32} src="/public/whatsapp.svg" decoding="async" />
            </a>
            <a href="tel:+48888742534" class="icons tel" data-site-phone-href title="Zadzwoń +48 888 742 534" aria-label="Zadzwoń +48 888 742 534">
              <img class="posicon" alt="Zadzwoń +48 888 742 534" width={32} height={32} src="/public/phone_call.svg" decoding="async" />
            </a>
          </div>

          <div class="contact-info">
            <p><a href="mailto:sales@brightwaw.pl" data-site-email-href><span data-site-email>sales@brightwaw.pl</span></a></p>
            <p><span data-site-hours>Pn-Nd: 08:00-20:00</span></p>
          </div>
        </div>
      </div>
    </header>
  );
});
