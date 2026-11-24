/**
 * One icon per concept, reused everywhere so an icon always means the same
 * thing. The concepts a reader meets first (kinds, figures, navigation) use the
 * project's own two-tone set in src/icons/farm (drawn for it, Nov 2026); the
 * rest stay Lucide. Icons are rendered to inline SVG at build time (astro-icon):
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
  instrumentType: "lucide:banknote",
  purposes: "lucide:target",
  assetTypes: "lucide:tractor",
  sectors: "lucide:wheat",
  trainingFormats: "lucide:presentation",
  accessCostType: "lucide:receipt",
  languages: "lucide:languages",
};

export const ICON = {
  search: "lucide:search",
  territory: "farm/territories",
  operator: "lucide:building-2",
  planCode: "lucide:hash",
  law: "lucide:scale",
  area: "lucide:map-pin",
  body: "lucide:landmark",
  external: "lucide:external-link",
  evidence: "lucide:quote",
  date: "lucide:calendar-check",
  limits: "lucide:circle-alert",
  profile: "lucide:user-round",
  scope: "lucide:layers",
  status: "lucide:activity",
  kind: "lucide:shapes",
  filters: "lucide:sliders-horizontal",
  europe: "farm/countries",
  note: "lucide:info",
  found: "lucide:search-check",
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
