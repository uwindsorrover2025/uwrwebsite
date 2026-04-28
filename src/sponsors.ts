/** Logos live in `public/sponsors/` and are served as `/sponsors/<filename>`. */

export type Sponsor = {
  name: string;
  /** e.g. `/sponsors/acme.png` */
  logo: string;
  href?: string;
};

/** Encode filenames with spaces etc. for valid URLs */
function sponsorLogo(filename: string): string {
  return `/sponsors/${encodeURIComponent(filename)}`;
}

export const SPONSORS: Sponsor[] = [
  { name: "ABC Technologies", logo: sponsorLogo("ABC TECNOLOGIES.png") },
  { name: "Altura", logo: sponsorLogo("alturalogo.png") },
  { name: "DragonPlate", logo: sponsorLogo("DRAGONPLATE.png") },
  { name: "ENWIN", logo: sponsorLogo("ENWIN.png") },
  { name: "Engineering Society", logo: sponsorLogo("EngSocLogo.png") },
  { name: "Essex Power", logo: sponsorLogo("EssexPower.png") },
  { name: "Industrial", logo: sponsorLogo("indsutrial_transparent.png") },
  { name: "JAS", logo: sponsorLogo("JasLogo.png") },
  { name: "Machine Shop", logo: sponsorLogo("MachineShopLogo.png") },
  { name: "Mouser", logo: sponsorLogo("Mouserlogo.webp") },
  { name: "Protocase", logo: sponsorLogo("ProtocaseLogo.png") },
  { name: "PTR", logo: sponsorLogo("PTRLOGO.png") },
  { name: "SOLIDWORKS", logo: sponsorLogo("SOLIDWORKS.png") },
  { name: "University of Windsor", logo: sponsorLogo("UWINDSOR.png") },
  { name: "Valiant TMS", logo: sponsorLogo("VALIANT.png") },
  { name: "VGMS", logo: sponsorLogo("VGMSVGLOGO.svg") },
  { name: "VSC", logo: sponsorLogo("vsc_transparent.png") },
  { name: "Watt & Volt", logo: sponsorLogo("WATT N VOLT.png") },
];

export function buildSponsorsMarkup(): string {
  if (SPONSORS.length === 0) {
    return `
    <p class="sponsors-empty">Partner logos will appear here as we finalize this season’s supporters.</p>`;
  }

  const items = SPONSORS.map((s) => {
    const safeName = escapeAttr(s.name);
    const img = `<img src="${escapeAttr(s.logo)}" alt="${safeName}" class="sponsors-logo" loading="lazy" decoding="async" width="200" height="80" />`;
    if (s.href) {
      return `<li class="sponsors-item"><a class="sponsors-link" href="${escapeAttr(s.href)}" target="_blank" rel="noopener noreferrer">${img}</a></li>`;
    }
    return `<li class="sponsors-item"><span class="sponsors-link sponsors-link--static">${img}</span></li>`;
  }).join("\n");

  return `<ul class="sponsors-grid" role="list">${items}</ul>`;
}

function escapeAttr(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
