/**
 * One Lucide icon per concept, reused everywhere so an icon always means the
 * same thing. Icons are rendered to inline SVG at build time (astro-icon):
 * no icon font, no request, no JavaScript. They are always aria-hidden and
 * never carry meaning on their own: the text next to them does.
 */
export const KIND_ICON: Record<string, string> = {
  LAND_BANK: "lucide:land-plot",
  SUCCESSION_SERVICE: "lucide:handshake",
  FINANCIAL_SUPPORT: "lucide:hand-coins",
  TRAINING: "lucide:graduation-cap",
  ADVICE: "lucide:messages-square",
  OFFICIAL_PORTAL: "lucide:globe",
  POLICY: "lucide:scale",
  NETWORK: "lucide:network",
  OTHER: "lucide:file-text",
};

export const kindIcon = (kind: string) => KIND_ICON[kind] ?? KIND_ICON.OTHER!;

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
  territory: "lucide:map-pin",
  operator: "lucide:building-2",
  external: "lucide:external-link",
  evidence: "lucide:quote",
  date: "lucide:calendar-check",
  limits: "lucide:circle-alert",
  draft: "lucide:triangle-alert",
  profile: "lucide:user-round",
  scope: "lucide:layers",
  status: "lucide:activity",
  kind: "lucide:shapes",
  filters: "lucide:sliders-horizontal",
  europe: "lucide:earth",
  note: "lucide:info",
  found: "lucide:search-check",
  checked: "lucide:shield-check",
  open: "lucide:unlock",
  resources: "lucide:file-text",
  sources: "lucide:database",
  chevron: "lucide:chevron-right",
} as const;
