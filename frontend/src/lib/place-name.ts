/**
 * Whether a text already names a territory, by any of the names its official name joins — "Araba / Álava",
 * "Bolzano/Bozen — Alto Adige/Südtirol" — or by the last word of one, which is the word a reader types:
 * "Asturias" for "Principado de Asturias", "Navarra" for "Comunidad Foral de Navarra". Accents and the
 * two apostrophes are ignored, because a source and a catalogue rarely agree on either.
 */
export function namesPlace(text: string, place: string): boolean {
  const fold = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").replaceAll("’", "'").toLowerCase();
  const haystack = fold(text);
  const names = place
    .split(/\s*[/—]\s*/u)
    .map((name) => name.trim())
    .filter(Boolean);
  return names.some((name) => {
    const last = name.split(/\s+/u).at(-1) ?? name;
    return haystack.includes(fold(name)) || (last.length > 3 && haystack.includes(fold(last)));
  });
}

/** The shortest title a result can show and still say what and where. */
export const SHORT_TITLE = 30;

/**
 * A title under {@link SHORT_TITLE} characters, completed with the country when it does not name it, and
 * then with the operator while it is still that short. A title that is long enough, or a European record (no country), is
 * returned as it is.
 */
export function shortTitleTail(title: string, country: string | undefined, operator: string): string {
  if (title.length >= SHORT_TITLE || country === undefined) return title;
  const placed = namesPlace(title, country) ? title : `${title} — ${country}`;
  // An operator is added only while the title is still that short and the operator's name is short too:
  // a long body's full name would push the record's own name out of the result.
  if (placed.length >= SHORT_TITLE || operator.length > SHORT_TITLE || placed.toLocaleLowerCase().includes(operator.toLocaleLowerCase())) {
    return placed;
  }
  return `${placed} · ${operator}`;
}
