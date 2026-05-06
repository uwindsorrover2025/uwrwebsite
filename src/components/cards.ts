// ─── Info cards data, injection, and per-frame opacity updates ────────────────

import jadnizamUrl from "../assets/jadnizam.png?url";
import yousefUrl from "../assets/yousef.jpg?url";
import ranaUrl from "../assets/rana.png?url";
import yajurUrl from "../assets/yajur.png?url";
import alihasanUrl from "../assets/alihasan.png?url";

export type CardDef =
  | {
      kind: "default";
      id: number;
      title: string;
      subtitle: string;
      body: string;
      stat: string;
      statLabel: string;
      stat2?: string;
      stat2Label?: string;
      tags: string[];
      extra?: string;
      startProgress: number;
      endProgress: number;
      side: "left" | "right";
      top: number;
    }
  | {
      kind: "team";
      id: number;
      title: string;
      subtitle: string;
      photoUrl: string;
      linkedInUrl?: string;
      startProgress: number;
      endProgress: number;
      side: "left" | "right";
      top: number;
    };

type HomeCard = Extract<CardDef, { kind: "default" }>;

export const CARDS: HomeCard[] = [
  {
    kind: "default",
    id: 1,
    title: "UWR Rover",
    subtitle: "University of Windsor Robotics",
    body: "A student-built Mars-analog rover aimed at Canadian International Rover Challenge courses — software, structures, electrons, and payloads in one tight loop.",
    stat: "2025",
    statLabel: "Build season",
    tags: ["CIRC · Canada", "CSTAG", "Field robotics"],
    startProgress: 0.04,
    endProgress: 0.2,
    side: "right",
    top: 24,
  },
  {
    kind: "default",
    id: 2,
    title: "6-Wheel Drive",
    subtitle: "Mobility System",
    body: "Rocker-bogie suspension gives each wheel independent travel, keeping all six in contact with uneven terrain. Drive corners run Neo Motor BLDC units — no differential needed.",
    stat: "6",
    statLabel: "Motors · Independent",
    stat2: "Neo Motor",
    stat2Label: "BLDC · Drive",
    tags: ["Rocker-Bogie", "Neo Motor BLDC", "All-Terrain"],
    startProgress: 0.19,
    endProgress: 0.36,
    side: "left",
    top: 24,
  },
  {
    kind: "default",
    id: 3,
    title: "Autonomous Navigation",
    subtitle: "Autonomy stack",
    body: "SLAM-based mapping, perception, and ROS 2 integration are underway — autonomy capability is still being brought up with bench and field testing.",
    stat: "—",
    statLabel: "Development in progress",
    tags: ["SLAM", "Computer Vision", "ROS 2", "LiDAR"],
    startProgress: 0.35,
    endProgress: 0.52,
    side: "right",
    top: 32,
  },
  {
    kind: "default",
    id: 4,
    title: "Science Payload",
    subtitle: "Research instruments",
    body: "Spectrometry, sampling, and imaging instruments are being scoped and integrated — competition-ready payload workflows are still under development.",
    stat: "—",
    statLabel: "Development in progress",
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
    kind: "default",
    id: 5,
    title: "Competition Ready",
    subtitle: "CIRC",
    body: "In the 2024 CIRC season we placed 1st in Ontario, 3rd in Canada, and 6th internationally.",
    stat: "1st",
    statLabel: "Ontario · 2024",
    stat2: "6th",
    stat2Label: "International · 2024",
    extra: `<div class="card-chart">
      <div class="chart-bars">
        <div class="chart-col chart-col--hi"><div class="chart-bar" style="--h:100%"></div><span>Ontario</span></div>
        <div class="chart-col"><div class="chart-bar" style="--h:72%"></div><span>Canada</span></div>
        <div class="chart-col"><div class="chart-bar" style="--h:52%"></div><span>International</span></div>
      </div>
      <div class="chart-label">2024 season placements</div>
    </div>`,
    tags: ["CIRC", "CSTAG", "Iteration"],
    startProgress: 0.66,
    endProgress: 0.82,
    side: "right",
    top: 42,
  },
  {
    kind: "default",
    id: 6,
    title: "Join the Team",
    subtitle: "Open Recruitment",
    body: "Open to all UWindsor students. Real engineering experience across every discipline.",
    stat: "3",
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

export const TEAM_CARDS: Extract<CardDef, { kind: "team" }>[] = [
  {
    kind: "team",
    id: 2,
    title: "Rana Usman Ali Nasir",
    subtitle: "President & Team Lead",
    photoUrl: ranaUrl,
    linkedInUrl: "https://www.linkedin.com/in/rana-usman-ali-nasir/",
    startProgress: 0.02,
    endProgress: 0.24,
    side: "left",
    top: 28,
  },
  {
    kind: "team",
    id: 1,
    title: "Jad Nizam",
    subtitle: "Vice President & Team Lead",
    photoUrl: jadnizamUrl,
    linkedInUrl: "https://www.linkedin.com/in/jad-nizam-967354299/",
    startProgress: 0.2,
    endProgress: 0.42,
    side: "right",
    top: 26,
  },
  {
    kind: "team",
    id: 4,
    title: "Ali Hasan",
    subtitle: "Mechanical Lead",
    photoUrl: alihasanUrl,
    linkedInUrl: "https://www.linkedin.com/in/alialz/",
    startProgress: 0.38,
    endProgress: 0.6,
    side: "left",
    top: 32,
  },
  {
    kind: "team",
    id: 5,
    title: "Yousef Al-Wahami",
    subtitle: "Software Lead",
    photoUrl: yousefUrl,
    linkedInUrl: "https://www.linkedin.com/in/yousef-al-wahami/",
    startProgress: 0.56,
    endProgress: 0.78,
    side: "right",
    top: 34,
  },
  {
    kind: "team",
    id: 3,
    title: "Yajur Chaturvedi",
    subtitle: "Vice President Finance & Operations",
    photoUrl: yajurUrl,
    linkedInUrl: "https://www.linkedin.com/in/yajur-chaturvedi-0a3598263/",
    startProgress: 0.74,
    endProgress: 1.0,
    side: "left",
    top: 30,
  },
];

const FADE = 0.04;

let activeCards: CardDef[] = CARDS;

function cardOpacity(card: CardDef, prog: number): number {
  if (prog < card.startProgress || prog > card.endProgress) return 0;
  if (prog < card.startProgress + FADE)
    return (prog - card.startProgress) / FADE;
  if (prog > card.endProgress - FADE) return (card.endProgress - prog) / FADE;
  return 1;
}

function buildCardHTML(card: CardDef): string {
  if (card.kind === "team") {
    return `
    <div class="card-team-photo-wrap">
      <img class="card-team-photo" src="${card.photoUrl}" alt="${card.title}" />
    </div>
    <div class="card-rule"></div>
    <h3 class="card-title">${card.title}</h3>
    <div class="card-subtitle">${card.subtitle}</div>
    ${
      card.linkedInUrl
        ? `<a class="card-team-in" href="${card.linkedInUrl}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
        : `<span class="card-team-in-placeholder">LinkedIn · TBD</span>`
    }
  `;
  }

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

export function injectCards(list: CardDef[] = CARDS): void {
  const container = document.getElementById("cards-container")!;
  activeCards = list;
  cardEls = list.map((card) => {
    const el = document.createElement("div");
    const team = card.kind === "team" ? " info-card--team" : "";
    el.className = `info-card${team} info-card-${card.side}`;
    el.id = `card-${card.id}`;
    el.style.top = `${card.top}%`;
    el.innerHTML = buildCardHTML(card);
    container.appendChild(el);
    return el;
  });
}

export function updateCards(prog: number): number {
  const ops = activeCards.map((card) => cardOpacity(card, prog));
  let activeIdx = -1,
    bestOpacity = 0;
  ops.forEach((op, i) => {
    if (op > bestOpacity) {
      bestOpacity = op;
      activeIdx = i;
    }
  });

  activeCards.forEach((card, i) => {
    const op = ops[i];
    const el = cardEls[i];
    const dir = card.side === "left" ? "-32px" : "32px";
    el.style.opacity = `${op}`;
    el.style.transform =
      op > 0.01 ? "translateX(0) scale(1)" : `translateX(${dir}) scale(0.96)`;
    if (card.kind === "team") {
      el.style.pointerEvents =
        activeIdx === i && op > 0.01 ? "auto" : "none";
    }
  });
  return activeIdx;
}
