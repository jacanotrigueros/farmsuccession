/**
 * The containing territory remains visible beside the documented area the record actually serves.
 *
 * The separator comes from the language rather than from here: French puts a space before a colon and
 * this template has no way of knowing which language it is writing in.
 *
 * @param {string} place @param {string | undefined} area @param {string} label
 * @param {string} [separator] the language's own way of introducing a value
 */
export const resourcePlace = (place, area, label, separator = ": ") => (area ? `${place} · ${label}${separator}${area}` : place);
