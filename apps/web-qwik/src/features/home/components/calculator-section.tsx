import { component$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import type { CalculatorSection as CalculatorSectionType } from "../types";

const styles = `
.calc {
  padding: 4rem 1rem;
  background: #f8fbfd;
}

.inner {
  max-width: 1000px;
  margin: 0 auto;
}

h2 {
  margin: 0;
  text-align: center;
  color: #2c3e50;
}

.subtitle {
  margin: 0.75rem auto 1.75rem;
  text-align: center;
  color: #6e8193;
}

.grid {
  display: grid;
  gap: 0.8rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 0.75rem;
  background: #fff;
  border: 1px solid #e3edf3;
  border-radius: 12px;
  padding: 0.8rem;
}

.name {
  font-weight: 600;
  color: #2c3e50;
}

.price {
  color: #5f7386;
  font-size: 0.9rem;
}

button {
  width: 34px;
  height: 34px;
  border: 1px solid #cddbe5;
  background: #fff;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.qty {
  min-width: 20px;
  text-align: center;
  font-weight: 700;
}

.summary {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border: 1px solid #deebf3;
  border-radius: 12px;
  padding: 0.95rem 1rem;
}

.total {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f85c9;
}

.note {
  color: #6a7d90;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .row {
    grid-template-columns: 1fr auto auto;
  }
  .price {
    grid-column: 1 / -1;
  }
}
`;

type CalculatorSectionProps = {
  section: CalculatorSectionType;
};

type CalcState = {
  qty: Record<string, number>;
};

export const CalculatorSection = component$<CalculatorSectionProps>(({ section }) => {
  useStylesScoped$(styles);

  const state = useStore<CalcState>({
    qty: Object.fromEntries(section.items.map((item) => [item.id, 0])),
  });

  const total = section.items.reduce((acc, item) => acc + (state.qty[item.id] || 0) * item.unitPrice, 0);

  return (
    <section class="calc">
      <div class="inner">
        <h2>{section.title}</h2>
        <p class="subtitle">{section.subtitle}</p>
        <div class="grid">
          {section.items.map((item) => (
            <div class="row" key={item.id}>
              <div class="name">{item.label}</div>
              <div class="price">{item.unitPrice} {section.unitLabel}</div>
              <button
                type="button"
                onClick$={() => {
                  state.qty[item.id] = Math.max(0, (state.qty[item.id] || 0) - 1);
                }}
              >
                -
              </button>
              <div class="qty">{state.qty[item.id] || 0}</div>
              <button
                type="button"
                onClick$={() => {
                  state.qty[item.id] = (state.qty[item.id] || 0) + 1;
                }}
              >
                +
              </button>
            </div>
          ))}
        </div>

        <div class="summary">
          <div class="note">{section.minOrderLabel}: {section.minOrder} zł</div>
          <div class="total">{section.totalLabel}: {total} zł</div>
        </div>
      </div>
    </section>
  );
});
