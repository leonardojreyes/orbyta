/** Convierte una marca de tiempo de PostgreSQL ("2026-10-30 17:22:13.175061-05") en Date, también en navegadores estrictos. */
export const parsePgDate = (s: string) => new Date(s.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00"));
