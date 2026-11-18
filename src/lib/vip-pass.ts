export type VipPassDetails = {
  name: string;
  rank: number;
  interests: string[];
  joinedAt: string;
  kind?: "shopper" | "vendor";
};

export function passMeta(details: VipPassDetails) {
  const vendor = details.kind === "vendor";
  return {
    title: vendor ? "Founding vendor pass" : "VIP shopper pass",
    prefix: vendor ? "VV" : "VE",
    fallback: vendor ? "Marketplace vendor" : "Marketplace shopper",
    file: vendor ? "vendor-pass" : "vip-pass",
  };
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character] ?? character;
  });
}

function fitText(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${Array.from(value)
    .slice(0, Math.max(0, limit - 1))
    .join("")}…`;
}

export function buildVipPassSvg(details: VipPassDetails, palette: Record<string, string>) {
  const meta = passMeta(details);
  const name = escapeXml(fitText(details.name, 26));
  const categories = escapeXml(fitText(details.interests.join(" · ") || meta.fallback, 68));
  const joined = new Date(details.joinedAt).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const rank = String(details.rank).padStart(5, "0");
  const cardStart = palette["--vip-card-start"] ?? "oklch(0.2 0.06 155)";
  const cardEnd = palette["--vip-card-end"] ?? "oklch(0.29 0.08 160)";
  const goldStart = palette["--vip-gold-start"] ?? "oklch(0.9 0.13 90)";
  const goldEnd = palette["--vip-gold-end"] ?? "oklch(0.72 0.16 76)";
  const goldMuted = palette["--vip-gold-muted"] ?? "oklch(0.84 0.12 91)";
  const cardMuted = palette["--vip-card-muted"] ?? "oklch(0.84 0.025 150)";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
  <defs>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${cardStart}"/><stop offset="1" stop-color="${cardEnd}"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${goldStart}"/><stop offset=".48" stop-color="${goldEnd}"/><stop offset=".72" stop-color="${goldStart}"/><stop offset="1" stop-color="${goldEnd}"/></linearGradient>
    <pattern id="lines" width="38" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V38" stroke="${goldStart}" stroke-opacity=".07" stroke-width="2"/></pattern>
  </defs>
  <rect x="16" y="16" width="1168" height="688" rx="38" fill="url(#card)"/>
  <rect x="16" y="16" width="1168" height="688" rx="38" fill="url(#lines)"/>
  <rect x="34" y="34" width="1132" height="652" rx="27" fill="none" stroke="${goldStart}" stroke-opacity=".42" stroke-width="2"/>
  <circle cx="1032" cy="364" r="220" fill="none" stroke="${goldStart}" stroke-opacity=".08" stroke-width="2"/>
  <circle cx="1032" cy="364" r="172" fill="none" stroke="${goldStart}" stroke-opacity=".1" stroke-width="2"/>
  <text x="76" y="108" fill="url(#gold)" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="2">VENDEMPIREMARKETPLACE</text>
  <text x="78" y="159" fill="${goldStart}" fill-opacity=".76" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="5">${meta.title.toUpperCase()}</text>
  <path d="M78 194H1122" stroke="${goldStart}" stroke-opacity=".28" stroke-width="2"/>
  <text x="78" y="274" fill="${goldStart}" fill-opacity=".68" font-family="Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="4">PASS HOLDER</text>
  <text x="76" y="354" textLength="810" lengthAdjust="spacingAndGlyphs" fill="${goldStart}" font-family="Arial, sans-serif" font-size="54" font-weight="700">${name}</text>
  <text x="78" y="414" fill="${goldStart}" fill-opacity=".7" font-family="Arial, sans-serif" font-size="18">${categories}</text>
  <path d="M78 486H742" stroke="${goldStart}" stroke-opacity=".24" stroke-width="2"/>
  <text x="78" y="538" fill="${goldStart}" fill-opacity=".66" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="3">MEMBER NUMBER</text>
  <text x="78" y="591" fill="${goldStart}" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="3">${meta.prefix}-${rank}</text>
  <text x="470" y="538" fill="${goldStart}" fill-opacity=".66" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="3">JOINED</text>
  <text x="470" y="591" fill="${goldStart}" font-family="Arial, sans-serif" font-size="26" font-weight="600">${escapeXml(joined)}</text>
  <circle cx="1014" cy="362" r="100" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="1014" cy="362" r="82" fill="none" stroke="${goldStart}" stroke-opacity=".4" stroke-width="2"/>
  <text x="1014" y="353" text-anchor="middle" fill="url(#gold)" font-family="Arial, sans-serif" font-size="54" font-weight="700">VE</text>
  <text x="1014" y="389" text-anchor="middle" fill="${goldStart}" fill-opacity=".76" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3">EARLY ACCESS</text>
  <text x="78" y="654" fill="${goldStart}" fill-opacity=".5" font-family="Arial, sans-serif" font-size="13" letter-spacing="3">YOUR MARKET. YOUR PASS.</text>
</svg>`;
}

export function downloadVipPass(details: VipPassDetails) {
  const palette = getComputedStyle(document.documentElement);
  const svg = buildVipPassSvg(details, {
    "--vip-card-start": palette.getPropertyValue("--vip-card-start").trim(),
    "--vip-card-end": palette.getPropertyValue("--vip-card-end").trim(),
    "--vip-gold-start": palette.getPropertyValue("--vip-gold-start").trim(),
    "--vip-gold-end": palette.getPropertyValue("--vip-gold-end").trim(),
    "--vip-gold-muted": palette.getPropertyValue("--vip-gold-muted").trim(),
    "--vip-card-muted": palette.getPropertyValue("--vip-card-muted").trim(),
  });
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `vendempire-${passMeta(details).file}-${String(details.rank).padStart(5, "0")}.svg`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
