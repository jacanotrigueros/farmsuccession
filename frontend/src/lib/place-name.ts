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
