/**
 * One icon per concept, reused everywhere so an icon always means the same
 * thing. Every concept a reader meets (kinds, figures, navigation, the facts
 * of a record) uses the project's own two-tone set in src/icons/farm, drawn for
 * it in Nov 2026: green draws the shape, ochre only accents it. Lucide is left
 * for controls (search, close, external link, filters) and for the status
 * symbols, which take the colour of their status. Icons are rendered to inline SVG at build time (astro-icon):
 * no icon font, no request, no JavaScript. They are always aria-hidden and
 * never carry meaning on their own: the text next to them does.
 */
export const KIND_ICON: Record<string, string> = {
  LAND_BANK: "farm/land",
  SUCCESSION_SERVICE: "farm/handover",
  FINANCIAL_SUPPORT: "farm/funding",
  TRAINING: "farm/training",
  ADVICE: "farm/advice",
  OFFICIAL_PORTAL: "farm/portal",
  POLICY: "farm/policy",
  NETWORK: "farm/network",
  OTHER: "farm/other",
};

export const kindIcon = (kind: string) => KIND_ICON[kind] ?? KIND_ICON.OTHER!;

/** Status has its own symbol as well as a word and colour. */
const STATUS_ICON: Record<string, string> = {
  ACTIVE: "lucide:circle-check",
  ANNOUNCED_NOT_OPERATING: "lucide:clock-3",
  HISTORICAL: "lucide:archive",
  DISCONTINUED: "lucide:circle-off",
  UNKNOWN: "lucide:circle-help",
};
export const statusIcon = (status: string): string => STATUS_ICON[status] ?? STATUS_ICON.UNKNOWN!;

/** Practical attributes of a record, shown in its facts panel. */
export const PRACTICAL_ICON: Record<string, string> = {
  instrumentType: "farm/support-type",
  purposes: "farm/purpose",
  assetTypes: "farm/assets",
  sectors: "farm/sectors",
  trainingFormats: "farm/format",
  accessCostType: "farm/cost",
  languages: "farm/languages",
};

export const ICON = {
  search: "lucide:search",
  territory: "farm/territories",
  operator: "farm/operator",
  planCode: "farm/code",
  law: "farm/law",
  applies: "farm/applies",
  area: "farm/area",
  body: "lucide:landmark",
  external: "lucide:external-link",
  evidence: "farm/quote",
  date: "farm/date",
  limits: "lucide:circle-alert",
  profile: "farm/profile",
  scope: "farm/scope",
  status: "farm/status",
  kind: "farm/kind",
  filters: "lucide:sliders-horizontal",
  europe: "farm/countries",
  note: "lucide:info",
  found: "farm/needs",
  checked: "lucide:shield-check",
  open: "lucide:unlock",
  resources: "farm/resources",
  sources: "farm/sources",
  chevron: "farm/open",
  chevronDown: "farm/expand",
} as const;

/**
 * The flag of a country, as a file this site ships. It is never a glyph: a flag emoji is a pair of
 * regional indicator letters, and a system with no glyph for the pair draws the letters themselves, so
 * most readers on Windows saw ES where the page meant Spain.
 */
export const flagOf = (country: string): string => `/img/flags/${country.toLowerCase()}.svg`;
