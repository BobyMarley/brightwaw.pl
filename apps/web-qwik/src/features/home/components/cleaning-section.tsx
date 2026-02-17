import { component$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import type { CleaningSection as CleaningSectionType } from "../types";

const styles = `
.wrap {
  padding: 4rem 1rem;
  background: #fff;
}
.inner { max-width: 1100px; margin: 0 auto; }
h2 { margin: 0; text-align: center; color: #2c3e50; }
.subtitle { text-align: center; color: #6e8193; margin: 0.75rem 0 1.5rem; }

.mode-tabs, .room-tabs {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tab {
  border: 1px solid #d7e3ec;
  background: #fff;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
}

.tab.active {
  background: #0f85c9;
  color: #fff;
  border-color: #0f85c9;
}

.card {
  border: 1px solid #e3edf4;
  border-radius: 12px;
  padding: 1rem;
  background: #f9fcfe;
}

.room-title {
  margin: 0 0 0.8rem;
  color: #2c3e50;
  font-weight: 700;
}

ul {
  margin: 0;
  padding-left: 1rem;
  color: #5f7488;
}
li { margin-bottom: 0.45rem; }
`;

type CleaningSectionProps = {
  section: CleaningSectionType;
};

type CleaningUiState = {
  modeId: "standard" | "deep";
  roomId: string;
};

export const CleaningSection = component$<CleaningSectionProps>(({ section }) => {
  useStylesScoped$(styles);

  const defaultMode = section.modes[0];
  const ui = useStore<CleaningUiState>({
    modeId: defaultMode.id,
    roomId: defaultMode.rooms[0]?.id || "",
  });

  const currentMode = section.modes.find((m) => m.id === ui.modeId) || section.modes[0];
  const currentRoom = currentMode.rooms.find((r) => r.id === ui.roomId) || currentMode.rooms[0];

  return (
    <section class="wrap">
      <div class="inner">
        <h2>{section.title}</h2>
        <p class="subtitle">{section.subtitle}</p>

        <div class="mode-tabs">
          {section.modes.map((mode) => (
            <button
              type="button"
              key={mode.id}
              class={{ tab: true, active: ui.modeId === mode.id }}
              onClick$={() => {
                ui.modeId = mode.id;
                ui.roomId = mode.rooms[0]?.id || "";
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div class="room-tabs">
          {currentMode.rooms.map((room) => (
            <button
              type="button"
              key={room.id}
              class={{ tab: true, active: ui.roomId === room.id }}
              onClick$={() => {
                ui.roomId = room.id;
              }}
            >
              {room.label}
            </button>
          ))}
        </div>

        {currentRoom ? (
          <article class="card">
            <h3 class="room-title">{currentRoom.label}</h3>
            <ul>
              {currentRoom.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
});
