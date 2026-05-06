const DONATE_URL =
  "https://www.uwindsor.ca/supportuwindsor/donate-other?BBFund=4894&BBHideOtherFunds=1";

function benefitRow(label: string, tiers: boolean[]): string {
  const cells = tiers
    .map((on) =>
      on
        ? '<td class="sponsor-matrix-cell sponsor-matrix-cell--yes"><span aria-label="Included">✓</span></td>'
        : '<td class="sponsor-matrix-cell sponsor-matrix-cell--no"><span aria-label="Not included">—</span></td>',
    )
    .join("");
  return `<tr><th scope="row" class="sponsor-matrix-benefit">${label}</th>${cells}</tr>`;
}

export function mountSponsor(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav class="nav">
  <a href="./" class="nav-brand">
    <img src="./logo.png" alt="" width="44" height="44" class="nav-logo" />
    <span class="nav-brand-text">UWR</span>
  </a>
  <ul class="nav-links">
    <li><a href="./">Home</a></li>
    <li><a href="/#about">About</a></li>
    <li><a href="/#sponsors">Sponsors</a></li>
    <li><a href="./partners" class="nav-link--here">Partner</a></li>
    <li><a href="/#contact">Contact</a></li>
    <li><a href="./teams">Team</a></li>
  </ul>
</nav>

<main class="sponsor-main">
  <div class="section-inner sponsor-inner">
    <section id="sponsor-step-tiers" class="sponsor-panel" aria-labelledby="sponsor-tiers-heading">
      <p class="section-label section-label--center">Support</p>
      <h1 id="sponsor-tiers-heading" class="section-heading section-heading--center">
        Partnership opportunities
      </h1>
      <p class="section-lede section-lede--narrow sponsor-tagline">
        Fuel innovation, gain recognition — compare tiers below, then choose how you would like to give.
      </p>

      <div class="sponsor-table-wrap">
        <table class="sponsor-matrix" aria-describedby="sponsor-matrix-desc">
          <caption id="sponsor-matrix-desc" class="visually-hidden">
            Sponsorship benefits by tier: Platinum, Gold, Silver, and Bronze.
          </caption>
          <thead>
            <tr>
              <th scope="col" class="sponsor-matrix-benefit-col">Benefit</th>
              <th scope="col" class="sponsor-tier sponsor-tier--platinum">
                <span class="sponsor-tier-badge">Platinum</span>
                <span class="sponsor-tier-price">$5,000+</span>
              </th>
              <th scope="col" class="sponsor-tier sponsor-tier--gold">
                <span class="sponsor-tier-badge">Gold</span>
                <span class="sponsor-tier-price">$2,500+</span>
              </th>
              <th scope="col" class="sponsor-tier sponsor-tier--silver">
                <span class="sponsor-tier-badge">Silver</span>
                <span class="sponsor-tier-price">$1,000+</span>
              </th>
              <th scope="col" class="sponsor-tier sponsor-tier--bronze">
                <span class="sponsor-tier-badge">Bronze</span>
                <span class="sponsor-tier-price">$500+</span>
              </th>
            </tr>
          </thead>
          <tbody>
            ${benefitRow("Promotional social media post", [true, true, true, true])}
            ${benefitRow("Company logo on team merchandise", [true, true, true, false])}
            ${benefitRow("Invitation to competition", [true, true, false, false])}
            ${benefitRow("Company promotion at event", [true, true, false, false])}
            ${benefitRow("Team roster with resumes", [true, true, false, false])}
            ${benefitRow("Small logo on rover", [false, false, true, true])}
            ${benefitRow("Medium logo on rover", [false, true, false, false])}
            ${benefitRow("Large logo on rover", [true, false, false, false])}
          </tbody>
        </table>
      </div>

      <div class="sponsor-actions">
        <button type="button" class="cta-btn cta-btn--primary sponsor-continue" id="sponsor-btn-continue">
          Continue →
        </button>
      </div>
    </section>

    <section
      id="sponsor-step-methods"
      class="sponsor-panel sponsor-panel--hidden"
      aria-labelledby="sponsor-methods-heading"
      hidden
    >
      <button type="button" class="sponsor-back text-btn" id="sponsor-btn-back-tiers">
        ← Back to tiers
      </button>
      <h2 id="sponsor-methods-heading" class="sponsor-methods-title">
        How would you like to give?
      </h2>
      <p class="sponsor-methods-lede">
        Pick an option below for step-by-step instructions.
      </p>

      <div class="sponsor-option-grid" role="radiogroup" aria-label="Donation method">
        <button type="button" class="sponsor-option-card" role="radio" aria-checked="false" data-method="link">
          <span class="sponsor-option-key">(i)</span>
          <span class="sponsor-option-label">Donate through link</span>
          <span class="sponsor-option-hint">University donation portal</span>
        </button>
        <button type="button" class="sponsor-option-card" role="radio" aria-checked="false" data-method="cheque">
          <span class="sponsor-option-key">(ii)</span>
          <span class="sponsor-option-label">Donate by cheque</span>
          <span class="sponsor-option-hint">Mail payable to UWSA</span>
        </button>
        <button type="button" class="sponsor-option-card" role="radio" aria-checked="false" data-method="inkind">
          <span class="sponsor-option-key">(iii)</span>
          <span class="sponsor-option-label">In-kind donation</span>
          <span class="sponsor-option-hint">Materials, services &amp; equipment</span>
        </button>
      </div>

      <div id="sponsor-method-detail" class="sponsor-detail sponsor-detail--hidden" hidden></div>

      <p class="sponsor-footnote">
        Questions? Reach us at
        <a href="mailto:uwr@uwindsor.ca" class="inline-link">uwr@uwindsor.ca</a>
        or return to <a href="./#contact" class="inline-link">contact</a> on the main site.
      </p>
    </section>
  </div>
</main>
`;

  const stepTiers = document.getElementById("sponsor-step-tiers")!;
  const stepMethods = document.getElementById("sponsor-step-methods")!;
  const btnContinue = document.getElementById("sponsor-btn-continue")!;
  const btnBackTiers = document.getElementById("sponsor-btn-back-tiers")!;
  const detailEl = document.getElementById("sponsor-method-detail")!;
  const optionButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-method]"),
  );

  function showTiers(): void {
    stepTiers.hidden = false;
    stepTiers.classList.remove("sponsor-panel--hidden");
    stepMethods.hidden = true;
    stepMethods.classList.add("sponsor-panel--hidden");
    clearMethodSelection();
  }

  function showMethods(): void {
    stepTiers.hidden = true;
    stepTiers.classList.add("sponsor-panel--hidden");
    stepMethods.hidden = false;
    stepMethods.classList.remove("sponsor-panel--hidden");
    stepMethods.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearMethodSelection(): void {
    for (const b of optionButtons) {
      b.classList.remove("sponsor-option-card--selected");
      b.setAttribute("aria-checked", "false");
    }
    detailEl.innerHTML = "";
    detailEl.hidden = true;
    detailEl.classList.add("sponsor-detail--hidden");
  }

  function selectMethod(btn: HTMLButtonElement, method: string): void {
    clearMethodSelection();
    btn.classList.add("sponsor-option-card--selected");
    btn.setAttribute("aria-checked", "true");
    detailEl.innerHTML = detailMarkup(method);
    detailEl.hidden = false;
    detailEl.classList.remove("sponsor-detail--hidden");
  }

  function detailMarkup(method: string): string {
    if (method === "link") {
      return `
      <div class="sponsor-detail-inner">
        <h3 class="sponsor-detail-heading">1. Donation through the University</h3>
        <p class="sponsor-detail-body">
          Donate to the team through the University of Windsor using the official portal.
        </p>
        <ol class="sponsor-detail-steps">
          <li>
            Open the donation page:
            <a href="${DONATE_URL}" class="inline-link sponsor-detail-link" target="_blank" rel="noopener noreferrer">
              uwindsor.ca donation (Capstone fund) →
            </a>
          </li>
          <li>
            Under <strong>Designation</strong>, choose <strong>MAME Capstone Fundraising</strong>.
          </li>
          <li>
            In <strong>Comments</strong>, write <strong>University of Windsor Rover Team</strong> so the gift is directed to us.
          </li>
        </ol>
        <p class="sponsor-detail-note">
          A tax receipt for your donation will be issued automatically by the University.
        </p>
        <p class="sponsor-detail-note">
          For more information, feel free to <a href="mailto:uwr@uwindsor.ca" class="inline-link">contact us</a>.
        </p>
      </div>`;
    }
    if (method === "cheque") {
      return `
      <div class="sponsor-detail-inner">
        <h3 class="sponsor-detail-heading">2. Donate by cheque</h3>
        <p class="sponsor-detail-body">
          Mail a cheque payable to the <strong>University of Windsor Students' Alliance</strong> and note our team's name
          (<strong>University of Windsor Rover Team</strong>) in the memo.
        </p>
        <p class="sponsor-detail-address">
          <strong>Mailing address</strong><br />
          Faculty of Engineering, University of Windsor<br />
          2285 Wyandotte St. W.<br />
          Windsor ON &nbsp;N9B 1K3
        </p>
        <p class="sponsor-detail-body">
          If your sponsorship includes logo placement, attach a JPEG, PNG, or PDF of your logo to your email when you coordinate with us.
        </p>
        <p class="sponsor-detail-note">
          Email: <a href="mailto:uwr@uwindsor.ca" class="inline-link">uwr@uwindsor.ca</a>
        </p>
      </div>`;
    }
    if (method === "inkind") {
      return `
      <div class="sponsor-detail-inner">
        <h3 class="sponsor-detail-heading">3. In-kind donations</h3>
        <p class="sponsor-detail-heading sponsor-detail-sub">Material, services &amp; equipment</p>
        <p class="sponsor-detail-body">
          Tax receipts are available for equipment or material donations over <strong>$4,500</strong> in value.
          Under CRA rules, gifts of time, labour, or services are not eligible for tax receipts.
        </p>
        <p class="sponsor-detail-note">
          For questions about supporting our team, contact
          <strong>Yajur Chaturvedi</strong> at
          <a href="mailto:uwr@uwindsor.ca" class="inline-link">uwr@uwindsor.ca</a>.
        </p>
      </div>`;
    }
    return "";
  }

  btnContinue.addEventListener("click", () => showMethods());
  btnBackTiers.addEventListener("click", () => showTiers());

  for (const btn of optionButtons) {
    btn.addEventListener("click", () => {
      const method = btn.dataset.method ?? "";
      selectMethod(btn, method);
    });
  }
}
