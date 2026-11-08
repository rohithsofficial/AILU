// Named steps for the rooms of the AILU World.
// Inside a room the generated engine only shows the stop's title and "2 of 5". Visitors could not see what the
// steps were, or what came next. This adds a step bar to the room card: every stop has a short name, the current
// one is marked, and each can be tapped. engine.ts is generated, so the bar follows the card's title from outside.
// `title` must match the engine's stop title exactly; worldSteps.test.ts checks this against engine.ts.

export type Step = { title: string; label: string };
export type Room = { name: string; steps: Step[] };

const s = (title: string, label: string): Step => ({ title, label });

export const ROOMS: Record<string, Room> = {
  events: { name: "Events hall", steps: [s("Every occasion.", "The hall"), s("The wedding door", "Wedding"), s("The birthday door", "Birthday"), s("The corporate door", "Corporate"), s("The stage night door", "Stage night"), s("The community door", "Community")] },
  wedding: { name: "Wedding", steps: [s("Grand entrance", "Entrance"), s("The aisle", "Aisle"), s("The mandap", "Mandap"), s("Reception dinner", "Dinner"), s("Sangeet", "Sangeet")] },
  birthday: { name: "Birthday", steps: [s("The surprise entrance", "Surprise"), s("The cake", "Cake"), s("Gifts and games", "Games"), s("Your host", "Host"), s("Up among the balloons", "Balloons")] },
  corporate: { name: "Corporate", steps: [s("From your seat", "Your seat"), s("Award moments", "Awards"), s("On your stage", "The stage")] },
  stagenight: { name: "Stage night", steps: [s("In the crowd", "Crowd"), s("Front row", "Front row"), s("On the stage", "Stage"), s("Sound and lighting", "Sound & light")] },
  community: { name: "Community", steps: [s("Under the open sky", "Open sky"), s("Cultural programme", "Culture"), s("Reunions", "Reunions"), s("Association meet", "Meet")] },
  people: { name: "People", steps: [s("On stage", "Dance & vocals"), s("Music and hosting", "Music & hosting"), s("The makers", "Makers"), s("Behind the scenes", "Backstage")] },
  culture: { name: "Culture", steps: [s("Coastal Karnataka", "Coastal Karnataka"), s("Kerala", "Kerala"), s("South Indian classical", "Classical"), s("North and West India", "North & West"), s("Contemporary and fusion", "Fusion")] },
  about: { name: "About AILU", steps: [s("Starting small. Caring deeply.", "Who we are"), s("Why AILU", "Why AILU"), s("How it works", "How it works"), s("What does it cost?", "Cost"), s("Outside Udupi?", "Where"), s("Creating Moments. Delivering Smiles.", "Our promise")] },
  dreams: { name: "Dreams", steps: [s("A dream starts small.", "A dream"), s("Share it privately", "Share"), s("We listen with care", "We listen"), s("Build a possibility", "A plan"), s("The Donation Box", "Donation Box")] },
};

/** The room and step number for a stop title shown on the card, or null if the title is not known. */
export function findStep(title: string): { room: Room; index: number } | null {
  for (const room of Object.values(ROOMS)) {
    const index = room.steps.findIndex((step) => step.title === title.trim());
    if (index >= 0) return { room, index };
  }
  return null;
}

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The step bar's markup: room name and step number, then one numbered chip per stop. */
export function stepBarHtml(room: Room, index: number) {
  const chips = room.steps
    .map((step, i) => {
      const state = i === index ? ' aria-current="step"' : "";
      const done = i < index ? " done" : "";
      return `<li><button type="button" class="step-chip${done}" data-step="${i}"${state}><b>${i + 1}</b>${esc(step.label)}</button></li>`;
    })
    .join("");
  return `<p class="step-room">${esc(room.name)} <span>· Step ${index + 1} of ${room.steps.length}</span></p><ol class="step-chips">${chips}</ol>`;
}

/** The "next" button's text: it names the next stop. */
export function nextLabel(room: Room, index: number) {
  const next = room.steps[index + 1];
  return next ? `Next: ${next.label}` : "Last stop";
}

/** Call before the engine starts. Returns a function that removes everything. */
export function worldSteps(root: HTMLElement) {
  let rendering = false;

  const render = () => {
    const card = root.querySelector<HTMLElement>("#subCard");
    const title = root.querySelector<HTMLElement>("#subTitle");
    const nextBtn = root.querySelector<HTMLButtonElement>("#stopNext");
    if (!card || !title || !nextBtn) return;
    let bar = card.querySelector<HTMLElement>("#stepBar");
    const found = findStep(title.textContent ?? "");
    rendering = true;
    if (!found || found.room.steps.length < 2) {
      bar?.remove();
      if (card.classList.contains("has-steps")) nextBtn.innerHTML = 'Keep going <span aria-hidden="true">→</span>';
      card.classList.remove("has-steps");
    } else {
      if (!bar) {
        bar = document.createElement("nav");
        bar.id = "stepBar";
        bar.setAttribute("aria-label", "Stops in this room");
        title.before(bar);
      }
      bar.innerHTML = stepBarHtml(found.room, found.index);
      bar.querySelector('[aria-current="step"]')?.scrollIntoView({ block: "nearest", inline: "center" });
      nextBtn.innerHTML = `${esc(nextLabel(found.room, found.index))} <span aria-hidden="true">→</span>`;
      card.classList.add("has-steps");
    }
    rendering = false;
  };

  // A chip jumps to its stop by pressing the engine's own next or previous button as many times as needed.
  const onClick = (event: MouseEvent) => {
    const chip = (event.target as Element | null)?.closest?.<HTMLElement>("#stepBar .step-chip");
    if (!chip) return;
    const found = findStep(root.querySelector("#subTitle")?.textContent ?? "");
    if (!found) return;
    const diff = Number(chip.dataset.step) - found.index;
    const button = root.querySelector<HTMLButtonElement>(diff > 0 ? "#stopNext" : "#stopPrev");
    for (let i = 0; i < Math.abs(diff) && button && !button.disabled; i++) button.click();
  };

  const observer = new MutationObserver(() => { if (!rendering) render(); });
  const watch = () => {
    const title = root.querySelector("#subTitle");
    if (title) observer.observe(title, { childList: true, characterData: true, subtree: true });
  };
  watch();
  root.addEventListener("click", onClick);
  return () => {
    observer.disconnect();
    root.removeEventListener("click", onClick);
  };
}
