// ─── DOM shell injection and HUD updates ─────────────────────────────────────
import { CARDS } from "./cards";

export function buildDOM(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav class="nav">
  <div class="nav-brand">UWR</div>
  <ul class="nav-links">
    <li><a href="#about">About</a></li>
    <li><a href="/teams.html">Teams</a></li>
    <li><a href="#contact">Sponsors</a></li>
    <li><a href="#contact">Join Us</a></li>
  </ul>
</nav>

<!-- ─── Fixed Three.js scene (rover) ──────────────────────────────── -->
<div class="scene" id="rover-scene">
  <canvas id="main-canvas"></canvas>
  <div id="cards-container"></div>
  <div class="hud">
    <div class="scroll-hint" id="scroll-hint">
      <div class="bounce-arrow">↓</div>
      <span>Scroll to explore</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
    <div class="section-counter" id="section-counter">· · ·</div>
  </div>
</div>

<!-- scroll height for rover snap sections -->
<div class="scroll-space">
  <div class="snap-section"></div>
  <div class="snap-section"></div>
  <div class="snap-section"></div>
  <div class="snap-section"></div>
  <div class="snap-section"></div>
</div>

<!-- ─── About ──────────────────────────────────────────────────────── -->
<section id="about" class="page-section about-section">
  <div class="section-inner">
    <p class="section-label">Who We Are</p>
    <h2 class="section-heading">University of Windsor<br>Rover Team</h2>
    <p class="section-body-wide">
      UWR is a multidisciplinary student engineering team designing and building Mars analog rovers
      for international competition. We compete at the University Rover Challenge in Utah, the
      International Rover Challenge in India, and the Canadian Rover Challenge — pushing what
      student engineers can build, year after year.
    </p>

    <div class="stat-row">
      <div class="page-stat">
        <div class="page-stat-num">50+</div>
        <div class="page-stat-label">Active Members</div>
      </div>
      <div class="stat-divider"></div>
      <div class="page-stat">
        <div class="page-stat-num">12+</div>
        <div class="page-stat-label">Sub-teams</div>
      </div>
      <div class="stat-divider"></div>
      <div class="page-stat">
        <div class="page-stat-num">3</div>
        <div class="page-stat-label">Competitions</div>
      </div>
      <div class="stat-divider"></div>
      <div class="page-stat">
        <div class="page-stat-num">Top 10</div>
        <div class="page-stat-label">Global Target</div>
      </div>
    </div>

    <div class="subteams-grid">
      <div class="subteam-card">
        <div class="subteam-icon">⚙</div>
        <div class="subteam-name">Mechanical</div>
        <p class="subteam-body">Chassis, rocker-bogie suspension, robotic arm, and precision tooling design.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-icon">💻</div>
        <div class="subteam-name">Software</div>
        <p class="subteam-body">ROS 2, SLAM navigation, computer vision, and full-stack mission control UI.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-icon">⚡</div>
        <div class="subteam-name">Electronics</div>
        <p class="subteam-body">Custom PCBs, motor controllers, power distribution, and communication systems.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-icon">🔬</div>
        <div class="subteam-name">Science</div>
        <p class="subteam-body">Spectrometry, soil sampling, UV/IR imaging, and biosignature detection.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-icon">📊</div>
        <div class="subteam-name">Business</div>
        <p class="subteam-body">Sponsorship, outreach, documentation, and competition deliverables.</p>
      </div>
      <div class="subteam-card">
        <div class="subteam-icon">🎨</div>
        <div class="subteam-name">Design</div>
        <p class="subteam-body">CAD models, branding, web presence, and competition presentation materials.</p>
      </div>
    </div>
  </div>
</section>

<!-- ─── Contact / Apply ────────────────────────────────────────────── -->
<section id="contact" class="page-section contact-section">
  <div class="section-inner">
    <p class="section-label">Get Involved</p>
    <h2 class="section-heading">Join the Mission</h2>
    <p class="section-body-wide">
      Whether you want to fund the future of student engineering, get hands-on rover experience,
      or just say hello — we'd love to hear from you.
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
        <a href="mailto:sponsorship@uwrover.ca" class="cta-btn">Sponsor Us →</a>
      </div>

      <div class="contact-card contact-card--primary">
        <div class="contact-badge contact-badge--blue">Students</div>
        <h3 class="contact-card-title">Join the Team</h3>
        <p class="contact-card-body">
          Open to all University of Windsor students — no prior experience required.
          Work on real hardware, ship real software, and compete on an international stage.
        </p>
        <ul class="contact-perks">
          <li>Hands-on rover engineering</li>
          <li>12+ sub-teams to choose from</li>
          <li>International competition travel</li>
          <li>Industry connections + co-op support</li>
        </ul>
        <a href="mailto:recruitment@uwrover.ca" class="cta-btn cta-btn--primary">Apply Now →</a>
      </div>

      <div class="contact-card">
        <div class="contact-badge">General</div>
        <h3 class="contact-card-title">Get in Touch</h3>
        <p class="contact-card-body">
          Media inquiries, collaboration proposals, or just want to know more about
          what we build and where we compete — reach out any time.
        </p>
        <ul class="contact-perks">
          <li>Media + press inquiries</li>
          <li>Research partnerships</li>
          <li>Demo + outreach events</li>
          <li>General questions</li>
        </ul>
        <a href="mailto:info@uwrover.ca" class="cta-btn">Contact Us →</a>
      </div>
    </div>

    <footer class="site-footer">
      <div class="footer-brand">UWR — University of Windsor Rover Team</div>
      <div class="footer-links">
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>
      <div class="footer-copy">© 2025 UWR. All rights reserved.</div>
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

export function initHud(): void {
  progressFill = document.getElementById("progress-fill")!;
  sectionCounter = document.getElementById("section-counter")!;
  scrollHint = document.getElementById("scroll-hint")!;
  roverScene = document.getElementById("rover-scene")!;
}

export function updateHud(prog: number, activeCardIdx: number): void {
  progressFill.style.width = `${prog * 100}%`;
  sectionCounter.textContent =
    activeCardIdx >= 0 ? `0${activeCardIdx + 1} / 0${N}` : "· · ·";
  scrollHint.style.opacity = prog < 0.05 ? `${1 - prog * 20}` : "0";
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
