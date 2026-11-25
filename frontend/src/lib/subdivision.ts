/**
 * The official codes readers type for a place — a French département's number: "safer 29", "rdi 22".
 *
 * The codes are data, in the territory catalogue, for any country whose readers name places that way; this
 * module only finds which of a region's subdivisions a record names and writes the codes the same way
 * everywhere. It looks only among the record's own region, so "Pays de la Loire" is never read as the
 * Loire département, which lies in another region.
 */
export type Subdivision = { name: string; code: string };

/** Up to this many codes fit after a title; a larger region shows them on the page only. */
export const TITLE_CODES = 6;

const fold = (text: string): string => text.normalize("NFD").replace(/\p{M}/gu, "").replace(/[’']/gu, "'").toLowerCase();

/**
 * The subdivisions a text names, longest name first so "Haute-Loire" is not also read as "Loire". A name
 * joined to another by a hyphen ("Rhône-Alpes", "Bouches-du-Rhône") is part of that other name.
 */
export function namedSubdivisions(text: string | undefined, subdivisions: readonly Subdivision[]): Subdivision[] {
  if (!text) return [];
  let rest = fold(text);
  const found: Subdivision[] = [];
  for (const subdivision of subdivisions.toSorted((a, b) => b.name.length - a.name.length)) {
    const name = fold(subdivision.name).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const at = new RegExp(`(^|[^\\p{L}-])${name}(?![\\p{L}-])`, "u");
    if (at.test(rest)) {
      found.push(subdivision);
      rest = rest.replace(at, "$1 ");
    }
  }
  return found.toSorted((a, b) => a.code.localeCompare(b.code));
}

/** "(22, 29, 35, 56)". */
export const codesInBrackets = (subdivisions: readonly Subdivision[]): string => `(${subdivisions.map(({ code }) => code).join(", ")})`;

/** What a search result shows of a title before it cuts it off. */
export const TITLE_ROOM = 60;

/**
 * A title followed by the codes of its place, when they are not already in it and the whole still fits a
 * result. Appended to a title that is already long, the codes pushed a Provence record to 141 characters:
 * a result cut it before the codes, so they were never seen and the name went with them.
 */
export function titleWithCodes(title: string, subdivisions: readonly Subdivision[]): string {
  if (subdivisions.length === 0 || subdivisions.length > TITLE_CODES) return title;
  if (subdivisions.every(({ code }) => title.includes(code))) return title;
  const coded = `${title} ${codesInBrackets(subdivisions)}`;
  return coded.length <= TITLE_ROOM ? coded : title;
}

/**
 * The codes a record's place carries: the subdivisions its own area names, or, for a record of the whole
 * region, all of the region's. A record below the region that names none carries none.
 */
export function recordSubdivisions(
  scope: { level: string; area?: string },
  name: string,
  subdivisions: readonly Subdivision[],
): Subdivision[] {
  if (subdivisions.length === 0) return [];
  const named = namedSubdivisions(scope.area ?? (scope.level === "REGIONAL" ? undefined : name), subdivisions);
  if (named.length > 0) return named;
  return scope.level === "REGIONAL" ? [...subdivisions] : [];
}
