import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { CtaSection as CtaSectionType } from "../types";

const styles = `
.cta {
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #0f85c9 0%, #1e90ff 100%);
  color: #fff;
}

.inner {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

p {
  margin: 0.9rem auto 2rem;
  max-width: 760px;
  opacity: 0.95;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  border-radius: 12px;
  padding: 0.9rem 1.15rem;
  text-decoration: none;
  font-weight: 700;
}

.primary {
  color: #0f85c9;
  background: #fff;
}

.secondary {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.65);
}
`;

type CtaSectionProps = {
  section: CtaSectionType;
};

export const CtaSection = component$<CtaSectionProps>(({ section }) => {
  useStylesScoped$(styles);

  return (
    <section class="cta" id="kontakt">
      <div class="inner">
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
        <div class="actions">
          <a class="btn primary" href={section.primaryCta.href}>
            {section.primaryCta.label}
          </a>
          <a class="btn secondary" href={section.secondaryCta.href}>
            {section.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
});
