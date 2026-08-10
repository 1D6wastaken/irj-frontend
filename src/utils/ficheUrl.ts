// Types de fiches (== segments d'URL). Contrat public partagé avec le backend
// pour générer des liens directs depuis les emails/notifications.
export type FicheSource =
    | "monuments_lieux"
    | "mobiliers_images"
    | "personnes_morales"
    | "personnes_physiques";

export const FICHE_SOURCES: FicheSource[] = [
    "monuments_lieux",
    "mobiliers_images",
    "personnes_morales",
    "personnes_physiques",
];

export function isFicheSource(v: string | null | undefined): v is FicheSource {
    return !!v && (FICHE_SOURCES as string[]).includes(v);
}

/**
 * URL publique d'une fiche : /fiches/:source/:id
 */
export function ficheUrl(source: FicheSource, id: string | number): string {
    return `/fiches/${source}/${encodeURIComponent(String(id))}`;
}

export function ficheEditUrl(source: FicheSource, id: string | number): string {
    return `/fiches/${source}/${encodeURIComponent(String(id))}/edit`;
}

export function draftEditUrl(source: FicheSource, id: string | number): string {
    return `/mes-brouillons/${source}/${encodeURIComponent(String(id))}/edit`;
}

export function validateFormDetailUrl(source: FicheSource, id: string | number): string {
    return `/admin/validation-fiches/${source}/${encodeURIComponent(String(id))}`;
}

/**
 * Parse un identifiant hérité au format "source:id" en {source, id}.
 * Utile pour absorber d'anciens IDs combinés (ex: liens sauvegardés,
 * SearchItem.source + SearchItem.id).
 */
export function splitLegacyFicheId(combined: string): {source: FicheSource; id: string} | null {
    if (!combined.includes(":")) return null;
    const [maybeSource, ...rest] = combined.split(":");
    if (!isFicheSource(maybeSource)) return null;
    return {source: maybeSource, id: rest.join(":")};
}
