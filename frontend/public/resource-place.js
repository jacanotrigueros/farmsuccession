/** The containing territory remains visible beside the documented area the record actually serves. */
/** @param {string} place @param {string | undefined} area @param {string} label */
export const resourcePlace = (place, area, label) => (area ? `${place} · ${label}: ${area}` : place);
