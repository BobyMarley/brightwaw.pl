import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { FaqSection as FaqSectionType } from "../types";

const styles = `
.faq {
  padding: 4rem 1rem;
  background: #f8fbfd;
}
.inner { max-width: 980px; margin: 0 auto; }
h2 { margin: 0; text-align: center; color: #2c3e50; }
.subtitle { text-align: center; color: #6d8092; margin: 0.75rem 0 1.6rem; }
.list { display: grid; gap: 0.75rem; }
details {
  border: 1px solid #dde8ef;
  border-radius: 12px;
  background: #fff;
  padding: 0.75rem 0.9rem;
}
summary {
  cursor: pointer;
  font-weight: 700;
  color: #2c3e50;
}
p {
  margin: 0.7rem 0 0;
  color: #607488;
  line-height: 1.5;
}
`;

type FaqSectionProps = {
  section: FaqSectionType;
};

export const FaqSection = component$<FaqSectionProps>(({ section }) => {
  useStylesScoped$(styles);

  return (
    <section class="faq" itemScope itemType="https://schema.org/FAQPage">
      <div class="inner">
        <h2>{section.title}</h2>
        <p class="subtitle">{section.subtitle}</p>
        <div class="list">
          {section.items.map((item) => (
            <details key={item.question} itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
              <summary itemProp="name">{item.question}</summary>
              <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                <p itemProp="text">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
});
