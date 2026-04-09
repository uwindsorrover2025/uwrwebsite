// ─── Info cards data, injection, and per-frame opacity updates ────────────────

export interface CardDef {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  icon: string;
  startProgress: number;
  endProgress: number;
  side: "left" | "right";
  top: number; // viewport %
}

export const CARDS: CardDef[] = [
  {
    id: 1,
    title: "UWR Rover",
    subtitle: "University of Windsor Robotics",
    body: "The UWindsor Rover is a next-generation Mars analog robot engineered by a multidisciplinary team of students competing at international university robotics challenges.",
    icon: "🚀",
    startProgress: 0.04,
    endProgress: 0.2,
    side: "right",
    top: 28,
  },
  {
    id: 2,
    title: "6-Wheel Drive",
    subtitle: "Mobility System",
    body: "Independent rocker-bogie suspension across all six wheels delivers superior traversal over rocky terrain. Each wheel is powered by a high-torque brushless motor.",
    icon: "⚙️",
    startProgress: 0.19,
    endProgress: 0.36,
    side: "left",
    top: 28,
  },
  {
    id: 3,
    title: "Autonomous Navigation",
    subtitle: "AI-Powered Systems",
    body: "SLAM algorithms and real-time computer vision enable the rover to map unknown terrain without continuous human intervention. Obstacle avoidance runs at 30 Hz.",
    icon: "🤖",
    startProgress: 0.35,
    endProgress: 0.52,
    side: "right",
    top: 36,
  },
  {
    id: 4,
    title: "Science Payload",
    subtitle: "Research Instruments",
    body: "Onboard spectrometer, soil sampler, and multi-spectral cameras allow geological analysis and detection of potential biosignatures in simulated Martian environments.",
    icon: "🔬",
    startProgress: 0.51,
    endProgress: 0.67,
    side: "left",
    top: 42,
  },
  {
    id: 5,
    title: "Competition Ready",
    subtitle: "IRC & URC",
    body: "Competing at the University Rover Challenge in Utah and the International Rover Challenge, pushing limits alongside top engineering student teams worldwide.",
    icon: "🏆",
    startProgress: 0.66,
    endProgress: 0.82,
    side: "right",
    top: 46,
  },
  {
    id: 6,
    title: "Join the Team",
    subtitle: "Open Recruitment",
    body: "Open to all UWindsor students. Gain real hands-on experience in robotics, software engineering, mechanical design, embedded systems, and systems integration.",
    icon: "👥",
    startProgress: 0.81,
    endProgress: 1.0,
    side: "left",
    top: 38,
  },
];

const FADE = 0.04;

function cardOpacity(card: CardDef, prog: number): number {
  if (prog < card.startProgress || prog > card.endProgress) return 0;
  if (prog < card.startProgress + FADE)
    return (prog - card.startProgress) / FADE;
  if (prog > card.endProgress - FADE) return (card.endProgress - prog) / FADE;
  return 1;
}

let cardEls: HTMLElement[] = [];

export function injectCards(): void {
  const container = document.getElementById("cards-container")!;
  cardEls = CARDS.map((card) => {
    const el = document.createElement("div");
    el.className = `info-card info-card-${card.side}`;
    el.id = `card-${card.id}`;
    el.style.top = `${card.top}%`;
    el.innerHTML = `
      <div class="card-icon">${card.icon}</div>
      <div class="card-text-wrap">
        <div class="card-subtitle">${card.subtitle}</div>
        <h3 class="card-title">${card.title}</h3>
        <p class="card-body">${card.body}</p>
      </div>
    `;
    container.appendChild(el);
    return el;
  });
}

// Returns the index of the most-visible card (-1 = none)
export function updateCards(prog: number): number {
  let activeIdx = -1,
    bestOpacity = 0;
  CARDS.forEach((card, i) => {
    const op = cardOpacity(card, prog);
    if (op > bestOpacity) {
      bestOpacity = op;
      activeIdx = i;
    }
    const el = cardEls[i];
    const dir = card.side === "left" ? "-24px" : "24px";
    el.style.opacity = `${op}`;
    el.style.transform =
      op > 0.01 ? "translateX(0) scale(1)" : `translateX(${dir}) scale(0.97)`;
  });
  return activeIdx;
}
