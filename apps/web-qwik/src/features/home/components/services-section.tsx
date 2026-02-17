import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { ServicesSection as ServicesSectionType } from "../types";

const styles = `
.services {
  padding: 4rem 1rem;
  background: #fff;
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin: 0;
  text-align: center;
  color: #2c3e50;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

p {
  margin: 0.8rem auto 2rem;
  text-align: center;
  color: #6d7f90;
  max-width: 760px;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
}

.card {
  border-radius: 14px;
  border: 1px solid #e4edf3;
  background: #fff;
  box-shadow: 0 8px 18px rgba(15, 133, 201, 0.06);
  padding: 1rem;
  display: grid;
  gap: 0.65rem;
}

.card-title {
  font-weight: 700;
  color: #2c3e50;
}

.card-text {
  color: #607385;
  font-size: 0.93rem;
  line-height: 1.45;
}

.card a {
  color: #0f85c9;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 1080px) {
  .grid {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
`;

type ServicesSectionProps = {
  section: ServicesSectionType;
};

export const ServicesSection = component$<ServicesSectionProps>(({ section }) => {
  useStylesScoped$(styles);

  return (
    <section class="services">
      <div class="inner">
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
        <div class="grid">
          {section.cards.map((card) => (
            <article class="card" key={card.title}>
              <div class="card-title">{card.title}</div>
              <div class="card-text">{card.description}</div>
              <a href={card.href}>Zobacz szczegóły</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
