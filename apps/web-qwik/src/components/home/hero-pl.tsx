import { component$, useStylesScoped$ } from "@builder.io/qwik";

const styles = `
.hero {
  min-height: 78vh;
  padding: 5rem 1.5rem 4rem;
  display: grid;
  place-items: center;
  text-align: center;
  background:
    linear-gradient(180deg, rgba(68, 112, 133, 0) 58.65%, rgba(68, 112, 133, 0.7) 86.77%, #447085 100%),
    linear-gradient(180deg, #fff 0, rgba(255, 255, 255, 0.5) 66.98%, rgba(255, 255, 255, 0) 100%),
    url('/public/bg.webp') center top / cover no-repeat;
}

.hero-inner {
  width: 100%;
  max-width: 1080px;
}

.title {
  margin: 0 0 1rem;
  color: #0f85c9;
  font-weight: 800;
  font-size: clamp(1.9rem, 5vw, 3.1rem);
  line-height: 1.15;
}

.subtitle {
  margin: 0 auto 2rem;
  max-width: 900px;
  color: #6c757d;
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  font-weight: 500;
}

.cta-row {
  display: flex;
  justify-content: center;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-bottom: 2.2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 190px;
  padding: 0.9rem 1.4rem;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: transform .2s ease, box-shadow .2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #0f85c9 0%, #1e90ff 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(15, 133, 201, .25);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border: 1px solid rgba(15, 133, 201, 0.25);
}

.btn:hover {
  transform: translateY(-2px);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 1rem;
  max-width: 780px;
  margin: 0 auto;
}

.stat {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 133, 201, 0.15);
  border-radius: 14px;
  padding: 0.9rem;
}

.value {
  color: #0f85c9;
  font-size: clamp(1.3rem, 4vw, 2rem);
  font-weight: 800;
  line-height: 1.1;
}

.label {
  color: #2c3e50;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

@media (max-width: 700px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
`;

export const HeroPl = component$(() => {
  useStylesScoped$(styles);

  return (
    <section class="hero">
      <div class="hero-inner">
        <h1 class="title">Sprzątanie mieszkań w Warszawie od 160 zł</h1>
        <p class="subtitle">
          Ocena 4.9/5, ponad 2500 zadowolonych klientów, profesjonalny sprzęt Kärcher i szybki dojazd.
        </p>

        <div class="cta-row">
          <a href="#kontakt" class="btn btn-primary">Sprawdź cenę</a>
          <a href="tel:+48888742534" class="btn btn-secondary">Zadzwoń</a>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="value">2500+</div>
            <div class="label">Zadowolonych klientów</div>
          </div>
          <div class="stat">
            <div class="value">4.9/5</div>
            <div class="label">Średnia ocena</div>
          </div>
          <div class="stat">
            <div class="value">280+</div>
            <div class="label">Opinii w Google</div>
          </div>
        </div>
      </div>
    </section>
  );
});
