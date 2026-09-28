// The brand logo, inlined into the header (an <img> would seal off its fills).
// Mirrors docs/src/components/brand-logo.ts: the source is the delivered
// export under public/logo/svg/black/ (a copy of the docs' brand asset), whose
// viewBox keeps the clear space around the mark; in-page use swaps it for the
// tight content box measured off the paths. The black variant carries no fill
// attributes, so `fill: currentColor` re-inks it per surface.
import horizontalRaw from "../public/logo/svg/black/black_Navara_Horizontal_logo.svg?raw";

const HORIZONTAL_TIGHT_VIEWBOX = "59.5 58.9 681.5 118.7";

/** The horizontal lockup as an inline `<svg>` string (fills follow currentColor). */
export const logoHorizontalSvg = horizontalRaw.replace(
  /<svg [^>]*>/,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${HORIZONTAL_TIGHT_VIEWBOX}" role="img" aria-label="Navara">`,
);
