// ─── Info cards data, injection, and per-frame opacity updates ────────────────

export interface CardDef {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  stat: string;
  statLabel: string;
  stat2?: string;
  stat2Label?: string;
  tags: string[];
  extra?: string; // raw HTML for unique visual element (chart, etc.)
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
    body: "A next-generation Mars analog robot competing at international university robotics challenges. Built entirely by students — software, hardware, science.",
    stat: "2025",
    statLabel: "Active . Competition Season",
    tags: ["URC · Utah", "IRC · Global", "CRC · Canada"],
    startProgress: 0.04,
    endProgress: 0.2,
    side: "right",
    top: 24,
  },
  {
    id: 2,
    title: "6-Wheel Drive",
    subtitle: "Mobility System",
    body: "Rocker-bogie suspension gives each wheel independent travel, keeping all six in contact with uneven terrain. No differential needed.",
    stat: "6",
    statLabel: "Motors . Independent",
    stat2: "350",
    stat2Label: "Nm · Peak Torque",
    tags: ["Rocker-Bogie", "Brushless DC", "All-Terrain"],
    startProgress: 0.19,
    endProgress: 0.36,
    side: "left",
    top: 24,
  },
  {
    id: 3,
    title: "Autonomous Navigation",
    subtitle: "AI-Powered Systems",
    body: "SLAM-based mapping and real-time computer vision let the rover traverse unknown terrain without continuous human input.",
    stat: "30",
    statLabel: "Hz · Obstacle Detection",
    stat2: "12",
    stat2Label: "ms · Reaction Latency",
    tags: ["SLAM", "Computer Vision", "ROS 2", "LiDAR"],
    startProgress: 0.35,
    endProgress: 0.52,
    side: "right",
    top: 32,
  },
  {
    id: 4,
    title: "Science Payload",
    subtitle: "Research Instruments",
    body: "Spectrometer, soil sampler, and multi-spectral cameras enable geological analysis and biosignature detection in simulated Martian environments.",
    stat: "5",
    statLabel: "Instruments . Onboard",
    tags: [
      "Spectroscopy",
      "Soil Sampling",
      "UV / IR Imaging",
      "Multi-spectral",
    ],
    startProgress: 0.51,
    endProgress: 0.67,
    side: "left",
    top: 38,
  },
  {
    id: 5,
    title: "Competition Ready",
    subtitle: "IRC & URC",
    body: "Pushing limits alongside top engineering teams worldwide, year after year.",
    stat: "Top 10",
    statLabel: "Global Ranking Target",
    extra: `<div class="card-chart">
      <div class="chart-bars">
        <div class="chart-col"><div class="chart-bar" style="--h:52%"></div><span>URC'23</span></div>
        <div class="chart-col"><div class="chart-bar" style="--h:71%"></div><span>IRC'23</span></div>
        <div class="chart-col chart-col--hi"><div class="chart-bar" style="--h:100%"></div><span>URC'24</span></div>
        <div class="chart-col"><div class="chart-bar" style="--h:84%"></div><span>IRC'24</span></div>
      </div>
      <div class="chart-label">Score Progression</div>
    </div>`,
    tags: ["URC · Utah", "IRC · India", "CRC · Canada"],
    startProgress: 0.66,
    endProgress: 0.82,
    side: "right",
    top: 42,
  },
  {
    id: 6,
    title: "Join the Team",
    subtitle: "Open Recruitment",
    body: "Open to all UWindsor students. Real engineering experience across every discipline.",
    stat: "12+",
    statLabel: "Sub-teams . Open",
    stat2: "50+",
    stat2Label: "Members · Active",
    tags: ["Mechanical", "Software", "Electronics", "Science", "Business"],
    startProgress: 0.81,
    endProgress: 1.0,
    side: "left",
    top: 34,
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

function buildCardHTML(card: CardDef): string {
  const metrics =
    card.stat2 !== undefined
      ? `<div class="card-metrics">
          <div class="card-metric">
            <div class="card-stat">${card.stat}</div>
            <div class="card-stat-label">${card.statLabel}</div>
          </div>
          <div class="card-metric-divider"></div>
          <div class="card-metric">
            <div class="card-stat card-stat--dim">${card.stat2}</div>
            <div class="card-stat-label">${card.stat2Label}</div>
          </div>
        </div>`
      : `<div class="card-metric">
          <div class="card-stat">${card.stat}</div>
          <div class="card-stat-label">${card.statLabel}</div>
        </div>`;

  const tags = card.tags
    .map((t) => `<span class="card-tag">${t}</span>`)
    .join("");

  return `
    ${metrics}
    <div class="card-rule"></div>
    <div class="card-subtitle">${card.subtitle}</div>
    <h3 class="card-title">${card.title}</h3>
    <p class="card-body">${card.body}</p>
    ${card.extra ?? ""}
    <div class="card-tags">${tags}</div>
  `;
}

let cardEls: HTMLElement[] = [];

export function injectCards(): void {
  const container = document.getElementById("cards-container")!;
  cardEls = CARDS.map((card) => {
    const el = document.createElement("div");
    el.className = `info-card info-card-${card.side}`;
    el.id = `card-${card.id}`;
    el.style.top = `${card.top}%`;
    el.innerHTML = buildCardHTML(card);
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
    const dir = card.side === "left" ? "-32px" : "32px";
    el.style.opacity = `${op}`;
    el.style.transform =
      op > 0.01 ? "translateX(0) scale(1)" : `translateX(${dir}) scale(0.96)`;
  });
  return activeIdx;
}
