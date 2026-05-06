// ─── DOM shell injection and HUD updates ─────────────────────────────────────
import { CARDS } from "./cards";
import { buildSponsorsMarkup } from "../sponsors";

export function buildDOM(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav class="nav">
  <a href="./" class="nav-brand">
    <img src="./logo.png" alt="" width="44" height="44" class="nav-logo" />
    <span class="nav-brand-text">UWR</span>
  </a>
  <ul class="nav-links">
    <li><a href="#app">Home</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#sponsors">Sponsors</a></li>
    <li><a href="./partnerships">Partnerships</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="./teams">Team</a></li>
  </ul>
</nav>

<!-- ─── Fixed Three.js scene (rover) ──────────────────────────────── -->
<div class="scene" id="rover-scene">
  <canvas id="main-canvas"></canvas>
  <div class="hero-splash" id="hero-splash">
    <p class="hero-eyebrow">University of Windsor Rover</p>
    <h1 class="hero-headline">
      <span class="hero-headline-lead">Exploring Mars &amp; Beyond:</span>
      <span class="hero-headline-body">
        Dynamic space enthusiasts shaping the future with robotics, engineering, &amp; innovation.
      </span>
    </h1>
    <div class="hero-actions">
      <a href="#about" class="hero-btn hero-btn--primary">About the Team</a>
      <a href="#contact" class="hero-btn hero-btn--ghost">Get in Touch</a>
    </div>
  </div>
  <div id="cards-container"></div>
  <div class="hud">
    <div class="scroll-hint" id="scroll-hint">
      <div class="bounce-arrow">↓</div>
      <span>Scroll to Explore</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
    <div class="section-counter" id="section-counter">· · ·</div>
  </div>
</div>

<!-- scroll height for rover section -->
<div class="scroll-space"></div>

<!-- ─── About ──────────────────────────────────────────────────────── -->
<section id="about" class="page-section about-section">
  <div class="section-inner">
    <p class="section-label section-label--center">Where we compete</p>
    <h2 class="section-heading section-heading--center">Built for CIRC</h2>
    <p class="section-lede">
      We are the University of Windsor Rover Team, building and testing Mars analog rovers for the Canadian International Rover Challenge. Our work brings together hands on hardware, embedded systems, autonomy, and science payloads, with every subsystem tested against real courses, real constraints, and real competition timing at the
      <a href="https://circ.cstag.ca/" class="inline-link" target="_blank" rel="noopener noreferrer">Canadian International Rover Challenge</a>
      (CIRC), organized by CSTAG.
    </p>

    <div class="circ-panel">
      <div class="circ-panel-copy">
        <h3 class="circ-panel-title">Canadian International Rover Challenge</h3>
        <p class="circ-panel-body">
          CIRC brings university teams together under demanding field conditions 
          across mobility, autonomy, manipulation, and science tasks. The rules 
          and missions evolve each season, keeping teams focused on building 
          reliable rover systems that can perform in real terrain and real 
          competition environments. Past events have taken place near 
          Drumheller, Alberta, and future competitions continue to build on that 
          same Canadian rover tradition.
        </p>
        <a href="https://circ.cstag.ca/" class="circ-panel-link" target="_blank" rel="noopener noreferrer">
          circ.cstag.ca →
        </a>
      </div>
      <div class="circ-panel-aside">
        <span class="circ-panel-tag">CSTAG</span>
        <p class="circ-panel-aside-text">
          Competition schedules, rule updates, and volunteer opportunities are 
          usually posted on the official CIRC site first, making it a good place 
          to follow Canadian planetary robotics.
        </p>
      </div>
    </div>

    <div class="stat-row">
      <div class="page-stat">
        <div class="page-stat-num">50+</div>
        <div class="page-stat-label">Active Members</div>
      </div>
      <div class="stat-divider"></div>
      <div class="page-stat">
        <div class="page-stat-num">6</div>
        <div class="page-stat-label">Sub-teams</div>
      </div>
      <div class="stat-divider"></div>
      <div class="page-stat">
        <div class="page-stat-num">CIRC</div>
        <div class="page-stat-label">Arena</div>
      </div>
      <div class="stat-divider"></div>
      <div class="page-stat">
        <div class="page-stat-num">∞</div>
        <div class="page-stat-label">Iteration</div>
      </div>
    </div>

    <p class="section-label section-label--spaced">How we're organized</p>
    <h3 class="section-subheading">Disciplines Across One Rover</h3>

    <div class="subteams-grid">
      <div class="subteam-card">
        <div class="subteam-mark">Mech</div>
        <div class="subteam-name">Mechanical</div>
        <p class="subteam-body">Chassis design, rocker bogie suspension, arm kinematics, and fixturing, built to handle dust, vibration, uneven terrain, and close inspection from judges.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-mark">Soft</div>
        <div class="subteam-name">Software</div>
        <p class="subteam-body">ROS&nbsp;2 stacks, navigation, perception, and operator UX, developed through real commits, testing, and iteration.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-mark">Elec</div>
        <div class="subteam-name">Electronics</div>
        <p class="subteam-body">Power systems, motor control, and sensing interfaces, built and tested around real constraints like watts, timing, and reliability.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-mark">Sci</div>
        <div class="subteam-name">Science</div>
        <p class="subteam-body">Instruments and protocols that connect rover telemetry to geology-focused questions, with competition scoring rewarding payloads that work as a complete system.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-mark">Ops</div>
        <div class="subteam-name">Business</div>
        <p class="subteam-body">Sponsors, outreach, budgets, and logistics, managed with the same urgency and discipline as the technical work.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-mark">Vis</div>
        <div class="subteam-name">Design</div>
        <p class="subteam-body">CAD visuals, renders, kit graphics, and design details that help communicate the rover clearly when judges review the system.</p>
      </div>
    </div>
  </div>
</section>

<!-- ─── Sponsors ───────────────────────────────────────────────────── -->
<section id="sponsors" class="page-section sponsors-section">
  <div class="section-inner section-inner--sponsors">
    <p class="section-label section-label--center">Support</p>
    <h2 class="section-heading section-heading--center">Our Sponsors</h2>
    <p class="section-lede section-lede--narrow sponsors-lede">
      The teams and companies below help us machine parts, travel to competitions, 
      and keep the rover testing when it matters most.
    </p>
    ${buildSponsorsMarkup()}
    <p class="sponsors-cta"><a href="./partnerships" class="inline-link">Become a Partner →</a></p>
  </div>
</section>

<!-- ─── Contact / Apply ────────────────────────────────────────────── -->
<section id="contact" class="page-section contact-section">
  <div class="section-inner">
    <p class="section-label section-label--center">Get Involved</p>
    <h2 class="section-heading section-heading--center">Join the Mission</h2>
    <p class="section-lede section-lede--narrow">
      Sponsor hardware that makes it to competition, connect with students who 
      build under pressure, or reach out with a question.
    </p>

    <div class="contact-grid">
      <div class="contact-card">
        <div class="contact-badge">Sponsors</div>
        <h3 class="contact-card-title">Partner With Us</h3>
        <p class="contact-card-body">
          Support student innovation and gain direct visibility with the next generation of
          engineers. Your logo on the rover, competition exposure, and recruitment pipeline.
        </p>
        <ul class="contact-perks">
          <li>Brand placement on rover + kit</li>
          <li>Recruitment access to 50+ engineers</li>
          <li>Competition day recognition</li>
          <li>Social media + web presence</li>
        </ul>
        <a href="./partnerships" class="cta-btn">Sponsor Us →</a>
      </div>

      <div class="contact-card contact-card--primary">
        <div class="contact-badge contact-badge--blue">Students</div>
        <h3 class="contact-card-title">Join the Team</h3>
        <p class="contact-card-body">
          Open to all University of Windsor students, with no prior experience 
          required. Build real hardware, ship real software, and compete on an 
          international stage.
        </p>
        <ul class="contact-perks">
          <li>Hands-on rover engineering</li>
          <li>6 sub-teams to choose from</li>
          <li>International competition travel</li>
          <li>Industry connections + co-op support</li>
        </ul>
        <a href="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=szP5EmE9GUuaTWiQId6MyQM_C2GlxKxGh_0vIdWrtoRUNElZSFdRUDZWQkFWTEY1RDlGMjhHQlkxOS4u" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn--primary">Apply Now →</a>
      </div>

      <div class="contact-card">
        <div class="contact-badge">General</div>
        <h3 class="contact-card-title">Get in Touch</h3>
        <p class="contact-card-body">
          For media inquiries, collaboration proposals, or questions about what we 
          build and where we compete, feel free to reach out any time.
        </p>
        <ul class="contact-perks">
          <li>Media + press inquiries</li>
          <li>Research partnerships</li>
          <li>Demo + outreach events</li>
          <li>General questions</li>
        </ul>
        <a href="mailto:uwr@uwindsor.ca" class="cta-btn">Contact Us →</a>
      </div>
    </div>

    <footer class="site-footer">
      <div class="footer-brand">UWR - University of Windsor Rover Team</div>
      <div class="footer-links">
        <a href="https://www.instagram.com/uwr.team/" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://www.linkedin.com/company/uwrteam/posts/?feedView=all" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/uwindsorrover2025" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
      <div class="footer-copy">© 2026 UWR. All rights reserved.</div>
    </footer>
  </div>
</section>
`;
}

const N = CARDS.length;
let progressFill: HTMLElement;
let sectionCounter: HTMLElement;
let scrollHint: HTMLElement;
let roverScene: HTMLElement;
let heroSplash: HTMLElement | null;

export function initHud(): void {
  progressFill = document.getElementById("progress-fill")!;
  sectionCounter = document.getElementById("section-counter")!;
  scrollHint = document.getElementById("scroll-hint")!;
  roverScene = document.getElementById("rover-scene")!;
  heroSplash = document.getElementById("hero-splash");
}

export function updateHud(prog: number, activeCardIdx: number): void {
  progressFill.style.width = `${prog * 100}%`;
  sectionCounter.textContent =
    activeCardIdx >= 0 ? `0${activeCardIdx + 1} / 0${N}` : "· · ·";
  scrollHint.style.opacity = prog < 0.05 ? `${1 - prog * 20}` : "0";
  if (heroSplash) {
    const heroOp = prog < 0.12 ? `${1 - prog * 8}` : "0";
    heroSplash.style.opacity = heroOp;
    heroSplash.style.pointerEvents = prog < 0.08 ? "auto" : "none";
  }
}

// Fade the rover scene out once the user scrolls into the About section
export function updateSceneVisibility(
  scrollY: number,
  scrollSpaceH: number,
): void {
  const fadeStart = scrollSpaceH * 0.9;
  const fadeEnd = scrollSpaceH + 80;
  const t = Math.max(
    0,
    Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)),
  );
  roverScene.style.opacity = `${1 - t}`;
  roverScene.style.pointerEvents = t > 0.5 ? "none" : "auto";
}
