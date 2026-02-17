import { component$ } from "@builder.io/qwik";
import type { HeroSection as HeroSectionType } from "../types";

type HeroSectionProps = {
  hero: HeroSectionType;
};

export const HeroSection = component$<HeroSectionProps>(({ hero }) => {
  return (
    <section class="hero">
      <div class="hero-text">
        <div class="sprztanie-mieszka-warszawa-container">
          <h1>{hero.title}</h1>
        </div>
        <div class="profesjonalnie-bezpiecznie-s">{hero.subtitle}</div>
      </div>

      <div class="zamowlenie-btn">
        <div class="change-block">
          <a class="zamow-btn" href={hero.primaryCta.href}>
            <b class="zamw-sprztanie">{hero.primaryCta.label}</b>
          </a>
        </div>
      </div>

      <div class="hero-stats">
        {hero.stats.map((item) => (
          <div class="hero-stat-item" key={item.label}>
            <div class="hero-stat-value">{item.value}</div>
            <div class="hero-stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
});
