import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
import type { ContactSection as ContactSectionType } from "../types";

const styles = `
.contact {
  padding: 4rem 1rem;
  background: #fff;
}

.inner {
  max-width: 840px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin: 0;
  color: #2c3e50;
}

.subtitle {
  text-align: center;
  color: #6d7f90;
  margin: 0.8rem 0 1.6rem;
}

form {
  display: grid;
  gap: 0.9rem;
  background: #f9fcfe;
  border: 1px solid #e3edf3;
  border-radius: 14px;
  padding: 1rem;
}

label {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cfdee8;
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
  font: inherit;
  box-sizing: border-box;
}

button {
  border: 0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #0f85c9 0%, #1e90ff 100%);
  cursor: pointer;
}

.ok {
  color: #1b8b3f;
  font-size: 0.9rem;
  font-weight: 600;
}

.err {
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 600;
}
`;

type ContactSectionProps = {
  section: ContactSectionType;
  action: any;
};

export const ContactSection = component$<ContactSectionProps>(({ section, action }) => {
  useStylesScoped$(styles);

  const actionValue = action.value as { ok?: boolean; error?: string } | undefined;

  return (
    <section class="contact" id="kontakt">
      <span id="contact" />
      <div class="inner">
        <h2>{section.title}</h2>
        <p class="subtitle">{section.subtitle}</p>
        <Form action={action}>
          <label>
            {section.nameLabel}
            <input name="name" required />
          </label>
          <label>
            {section.phoneLabel}
            <input name="phone" required />
          </label>
          <label>
            {section.addressLabel}
            <input name="address" required />
          </label>
          <label>
            {section.messageLabel}
            <textarea name="message" rows={4} />
          </label>
          <button type="submit">{section.submitLabel}</button>
          {actionValue?.ok ? <div class="ok">{section.successMessage}</div> : null}
          {actionValue?.error ? <div class="err">{section.errorMessage}: {actionValue.error}</div> : null}
        </Form>
      </div>
    </section>
  );
});
