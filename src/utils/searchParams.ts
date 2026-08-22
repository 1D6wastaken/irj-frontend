// ============================================================================
// Contrat de sérialisation URL <-> AdvancedFilters pour la page /search
// ============================================================================
// Toute clé listée ici est un élément public de l'URL — renommer une clé casse
// les liens partagés/bookmarkés. Ajouter une nouvelle clé = ajouter une entrée
// dans FILTER_KEYS et supporter sa désérialisation dans parseSearchParams.
// Les valeurs multiples sont sérialisées en query params répétés (ex: cat=a&cat=b),
// ce qui matche URLSearchParams.getAll().
// ============================================================================

import {AdvancedFilters} from "../App";

type ArrayFilterKey = Exclude<keyof AdvancedFilters, "location">;

// Mapping AdvancedFilters (interne, camelCase) -> URL (courtes, stables)
const FILTER_KEYS: Record<ArrayFilterKey, string> = {
    centuries: "century",
    themes: "theme",
    naturesMonu: "natureMonu",
    naturesMob: "natureMob",
    naturesOrg: "natureOrg",
    conservationStatesMonu: "consMonu",
    conservationStatesMob: "consMob",
    materialsMonu: "matMonu",
    materialsMob: "matMob",
    techniques: "technique",
    professions: "profession",
    transportModes: "transport",
};

const LOCATION_KEYS = {
    countries: "country",
    regions: "region",
    departments: "dept",
    communes: "commune",
} as const;

export interface ParsedSearch {
    query: string;
    categories: string[];
    filters: AdvancedFilters;
    page: number;
    perPage: number;
}

const DEFAULT_PER_PAGE = 20;
const ALLOWED_PER_PAGE = [10, 20, 50] as const;

export function parseSearchParams(sp: URLSearchParams): ParsedSearch {
    const filters: AdvancedFilters = {};

    // Location group
    const location: NonNullable<AdvancedFilters["location"]> = {};
    for (const [intKey, urlKey] of Object.entries(LOCATION_KEYS) as Array<[keyof typeof LOCATION_KEYS, string]>) {
        const values = sp.getAll(urlKey);
        if (values.length > 0) {
            location[intKey] = values;
        }
    }
    if (Object.keys(location).length > 0) {
        filters.location = location;
    }

    // Array filters
    for (const [intKey, urlKey] of Object.entries(FILTER_KEYS) as Array<[ArrayFilterKey, string]>) {
        const values = sp.getAll(urlKey);
        if (values.length > 0) {
            (filters as Record<string, string[]>)[intKey] = values;
        }
    }

    const rawPage = Number(sp.get("page") ?? "1");
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

    const rawPer = Number(sp.get("per") ?? DEFAULT_PER_PAGE);
    const perPage = ALLOWED_PER_PAGE.includes(rawPer as (typeof ALLOWED_PER_PAGE)[number])
        ? rawPer
        : DEFAULT_PER_PAGE;

    return {
        query: sp.get("q") ?? "",
        categories: sp.getAll("cat"),
        filters,
        page,
        perPage,
    };
}

export interface BuildSearchOpts {
    query?: string;
    categories?: string[];
    filters?: AdvancedFilters;
    page?: number;
    perPage?: number;
}

/**
 * Construit un objet URLSearchParams pour /search.
 * `page === 1` et `perPage === 20` sont omis pour garder des URLs propres.
 */
export function buildSearchParams({
    query = "",
    categories = [],
    filters = {},
    page = 1,
    perPage = DEFAULT_PER_PAGE,
}: BuildSearchOpts): URLSearchParams {
    const sp = new URLSearchParams();

    if (query.trim()) sp.set("q", query.trim());
    for (const cat of categories) sp.append("cat", cat);

    if (filters.location) {
        for (const [intKey, urlKey] of Object.entries(LOCATION_KEYS) as Array<[keyof typeof LOCATION_KEYS, string]>) {
            const values = filters.location[intKey];
            if (values && values.length > 0) {
                for (const v of values) sp.append(urlKey, v);
            }
        }
    }

    for (const [intKey, urlKey] of Object.entries(FILTER_KEYS) as Array<[ArrayFilterKey, string]>) {
        const values = filters[intKey];
        if (Array.isArray(values) && values.length > 0) {
            for (const v of values) sp.append(urlKey, v);
        }
    }

    if (page > 1) sp.set("page", String(page));
    if (perPage !== DEFAULT_PER_PAGE) sp.set("per", String(perPage));

    return sp;
}

export function buildSearchUrl(opts: BuildSearchOpts): string {
    const sp = buildSearchParams(opts);
    const qs = sp.toString();
    return qs ? `/search?${qs}` : "/search";
}
