/**
 * Where a European instrument turns into something a reader can act on in one country.
 *
 * A European record says what the EU sets; on a country's page the reader's next question is what their own
 * country made of it. "CAP Strategic Plans by country" is the Commission's door to every plan, and Spain's
 * ministry page on the CAP measures for generational renewal is the Spanish plan itself: two records that
 * are not the same thing, with nothing on the page leading from one to the other (founder, 18 Nov 2026).
 *
 * Each entry names, per country, the national records that put the European one into practice there. It is
 * an editorial link between two sourced records and adds no fact; a test checks that every record it
 * names exists, so a renamed or withdrawn record cannot leave a dead link on a country page.
 */
export const EU_COUNTERPARTS: Readonly<Record<string, Readonly<Partial<Record<string, readonly string[]>>>>> = {
  "eu-cap-strategic-plans": { ES: ["es-medidas-pac-relevo-generacional"] },
  "eu-cap-young-farmers": { ES: ["es-medidas-pac-relevo-generacional"] },
};

/** The national records that apply a European one in this country, in the order written above. */
export const counterpartsIn = (euId: string, country: string): readonly string[] => EU_COUNTERPARTS[euId]?.[country] ?? [];
