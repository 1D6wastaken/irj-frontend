// ============================================================================
// SearchResults — état intégralement dans l'URL via useSearchParams
// ============================================================================
// L'état applicable (query, catégories, filtres, page, per) est sérialisé
// via `buildSearchParams`/`parseSearchParams` (src/utils/searchParams.ts).
// L'état d'UI pré-submit (pendingCategories, pendingFilters, showFilters) reste
// en useState local — il ne survit pas à la navigation ni au deep-link.
// L'effet de fetch dépend de `searchParams.toString()` (primitive stable),
// jamais de l'objet URLSearchParams (identité changeante = boucle infinie).
// ============================================================================

import {useState, useEffect, useMemo, useRef} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {
    Search, ArrowLeft, Filter, MapPin, Users, Trophy, Church, Calendar,
    ChevronUp, ChevronDown, User,
} from "lucide-react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Badge} from "./ui/badge";
import {Card, CardContent} from "./ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {ImageWithFallback} from "./ImageWithFallback.tsx";
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "./ui/pagination";
import {LocationFilter, LocationFilterRef} from "./filters/LocationFilter";
import {DynamicFilters} from "./filters/DynamicFilters";
import {AdvancedFilters} from "../App";
import {categories} from "../constants/filters";
import {apiService, SearchItem} from "../config/api";
import {transformFiltersToApiFormat, getMediaImageUrl, SOURCE_LABELS} from "../utils/searchUtils";
import {buildSearchParams, parseSearchParams} from "../utils/searchParams";
import {ficheUrl, isFicheSource} from "../utils/ficheUrl";

export function SearchResults() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Snapshot dérivé de l'URL. Toute mise à jour passe par setSearchParams.
    const parsed = useMemo(() => parseSearchParams(searchParams), [searchParams]);

    const {
        query: currentQuery,
        categories: selectedCategories,
        filters: appliedFilters,
        page: currentPage,
        perPage: resultsPerPage,
    } = parsed;

    // Etats UI pré-submit — vidés au démontage, jamais dans l'URL.
    const [searchInput, setSearchInput] = useState(currentQuery);
    const [pendingCategories, setPendingCategories] = useState<string[]>(selectedCategories);
    const [pendingFilters, setPendingFilters] = useState<AdvancedFilters>(appliedFilters);
    // Panneau filtres ouvert par défaut si l'URL en contient (deep-link/back button).
    const hasFiltersInUrl = selectedCategories.length > 0 || Object.keys(appliedFilters).length > 0;
    const [showFilters, setShowFilters] = useState(hasFiltersInUrl);

    // Re-sync UI locale si l'URL change de l'extérieur (browser back, deep-link).
    useEffect(() => {
        setSearchInput(currentQuery);
        setPendingCategories(selectedCategories);
        setPendingFilters(appliedFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const locationFilterRef = useRef<LocationFilterRef>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [results, setResults] = useState<SearchItem[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Fetch à chaque changement d'URL (query, filtres, page, per).
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setSearchError(null);
            try {
                const body = await transformFiltersToApiFormat(selectedCategories, appliedFilters);
                const response = await apiService.search(currentQuery, body, resultsPerPage, currentPage);
                if (cancelled) return;
                setResults(response.items);
                setTotalResults(response.total);
            } catch (error) {
                if (cancelled) return;
                console.error("Erreur lors de la recherche:", error);
                setSearchError("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
                setResults([]);
                setTotalResults(0);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const totalPages = Math.ceil(totalResults / resultsPerPage);

    const applyUrl = (opts: {
        query?: string;
        categories?: string[];
        filters?: AdvancedFilters;
        page?: number;
        perPage?: number;
    }) => {
        const next = buildSearchParams({
            query: opts.query ?? currentQuery,
            categories: opts.categories ?? selectedCategories,
            filters: opts.filters ?? appliedFilters,
            page: opts.page ?? 1,
            perPage: opts.perPage ?? resultsPerPage,
        });
        setSearchParams(next);
    };

    const toggleCategory = (categoryId: string) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];
        setPendingCategories(newCategories);
        applyUrl({categories: newCategories, page: 1});
    };

    const handleSearch = () => {
        applyUrl({query: searchInput.trim(), page: 1});
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleLocationChange = (locationFilters: {
        countries?: string[];
        regions?: string[];
        departments?: string[];
        communes?: string[];
    }) => {
        setPendingFilters((prev) => ({...prev, location: locationFilters}));
    };

    const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
        setPendingFilters((prev) => {
            const currentArray = (prev[key] as string[]) || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((item) => item !== value)
                : [...currentArray, value];
            return {...prev, [key]: newArray.length > 0 ? newArray : undefined};
        });
    };

    const applyFilters = () => {
        applyUrl({filters: pendingFilters, categories: pendingCategories, page: 1});
    };

    const clearFilters = () => {
        setPendingCategories([]);
        setPendingFilters({});
        if (locationFilterRef.current) locationFilterRef.current.clearAll();
        applyUrl({categories: [], filters: {}, page: 1});
    };

    const getCategoryInfo = (categoryId: string) => categories.find((cat) => cat.id === categoryId);

    const hasActiveFilters = selectedCategories.length > 0 || Object.keys(appliedFilters).some((key) => {
        const value = appliedFilters[key as keyof AdvancedFilters];
        if (key === "location") {
            if (typeof value === "object" && value) {
                return Object.values(value).some((v) => (Array.isArray(v) ? v.length > 0 : v));
            }
            return false;
        }
        return Array.isArray(value) && value.length > 0;
    });

    const hasPendingFilters = pendingCategories.length > 0 || Object.keys(pendingFilters).some((key) => {
        const value = pendingFilters[key as keyof AdvancedFilters];
        if (key === "location") {
            if (typeof value === "object" && value) {
                return Object.values(value).some((v) => (Array.isArray(v) ? v.length > 0 : v));
            }
            return false;
        }
        return Array.isArray(value) && value.length > 0;
    });

    const countActiveFilters = () => {
        let count = 0;
        count += pendingCategories.length;
        if (pendingFilters.location) {
            const loc = pendingFilters.location;
            if (loc.countries && loc.countries.length > 0) count++;
            if (loc.regions && loc.regions.length > 0) count++;
            if (loc.departments && loc.departments.length > 0) count++;
            if (loc.communes && loc.communes.length > 0) count++;
        }
        Object.keys(pendingFilters).forEach((key) => {
            if (key !== "location") {
                const value = pendingFilters[key as keyof AdvancedFilters];
                if (Array.isArray(value) && value.length > 0) count++;
            }
        });
        return count;
    };

    const activeFiltersCount = countActiveFilters();

    const hasPendingChanges =
        JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters) ||
        JSON.stringify(pendingCategories) !== JSON.stringify(selectedCategories);

    const handleCardClick = (result: SearchItem) => {
        if (isFicheSource(result.source)) {
            navigate(ficheUrl(result.source, result.id));
        }
    };

    const handlePageChange = (page: number) => {
        applyUrl({page});
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleResultsPerPageChange = (value: string) => {
        applyUrl({perPage: parseInt(value, 10), page: 1});
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Barre de recherche et navigation */}
            <div className="bg-secondary border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4">
                        {/* Bouton retour */}
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                <span className="hidden sm:inline">Retour à l'accueil</span>
                                <span className="sm:hidden">Retour</span>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                                    <Input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Rechercher des monuments, objets, personnes... (optionnel)"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="pl-12 py-4 text-lg border-input bg-input-background rounded-xl"
                                    />
                                </div>
                                <Button onClick={handleSearch} className="w-full sm:w-auto sm:px-6" disabled={isLoading}>
                                    {isLoading ? "Recherche..." : "Rechercher"}
                                </Button>
                            </div>

                            <Button
                                variant={showFilters ? "secondary" : "outline"}
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-between gap-2 py-6"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5"/>
                                    <span>
                                        {activeFiltersCount > 0
                                            ? `Mettre à jour les filtres (${activeFiltersCount} filtre${activeFiltersCount > 1 ? "s" : ""} actif${activeFiltersCount > 1 ? "s" : ""})`
                                            : "Filtrer les résultats"}
                                    </span>
                                </div>
                                {showFilters ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="bg-white rounded-lg p-4 border border-border space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Filtres</h3>
                                    {hasPendingFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <span className="hidden sm:inline">Effacer tous les filtres</span>
                                            <span className="sm:hidden">Effacer tout</span>
                                        </Button>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">Catégories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => {
                                            const IconComponent =
                                                category.id === "monuments_lieux" ? Church :
                                                    category.id === "mobiliers_images" ? Trophy :
                                                        category.id === "personnes_morales" ? Users : User;
                                            const isSelected = pendingCategories.includes(category.id);
                                            return (
                                                <Badge
                                                    key={category.id}
                                                    variant={isSelected ? "default" : "outline"}
                                                    className={`cursor-pointer px-4 py-3 transition-all duration-200 text-xs lg:text-sm ${
                                                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                                                    }`}
                                                    onClick={() => toggleCategory(category.id)}
                                                >
                                                    <IconComponent className="w-4 h-4 mr-2"/>
                                                    {category.name}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border border-border rounded-lg p-4">
                                    <LocationFilter
                                        ref={locationFilterRef}
                                        value={pendingFilters.location || {}}
                                        onChange={handleLocationChange}
                                        showClearButton={false}
                                    />
                                </div>

                                <DynamicFilters
                                    selectedCategories={pendingCategories}
                                    pendingFilters={pendingFilters}
                                    onToggleArrayFilter={toggleArrayFilter}
                                />

                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        onClick={applyFilters}
                                        className={`w-full sm:w-auto ${hasPendingChanges ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                        disabled={!hasPendingChanges || isLoading}
                                    >
                                        <Filter className="w-4 h-4 mr-2"/>
                                        Appliquer les filtres
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Résultats */}
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Résultats de recherche</h1>
                        {isLoading ? (
                            <p className="text-muted-foreground">Recherche en cours...</p>
                        ) : searchError ? (
                            <p className="text-destructive">{searchError}</p>
                        ) : (
                            <div className="text-muted-foreground">
                                {totalResults} résultat{totalResults > 1 ? "s" : ""}{" "}
                                {currentQuery === "" ? "trouvés" : `pour "${currentQuery}"`}
                                {hasActiveFilters && (
                                    <span className="ml-2"><Badge variant="outline">Filtres actifs</Badge></span>
                                )}
                            </div>
                        )}
                    </div>

                    {!isLoading && !searchError && totalResults > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground whitespace-nowrap">Résultats par page :</span>
                                <Select value={resultsPerPage.toString()} onValueChange={handleResultsPerPageChange}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-muted-foreground text-xs sm:text-sm">
                                <div>Page {currentPage} sur {totalPages}</div>
                                <div className="whitespace-nowrap">
                                    Résultats {(currentPage - 1) * resultsPerPage + 1} à {Math.min(currentPage * resultsPerPage, totalResults)} sur {totalResults}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⏳</div>
                        <h3 className="text-xl font-medium text-muted-foreground">Recherche en cours...</h3>
                    </div>
                ) : searchError ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-medium text-destructive mb-2">Erreur de recherche</h3>
                        <p className="text-muted-foreground mb-6">{searchError}</p>
                        <Button onClick={handleSearch}>Réessayer</Button>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {results.map((result) => {
                                if (result.medias) {
                                    result.medias.sort((a, b) => a.title.localeCompare(b.title));
                                }
                                const categoryInfo = getCategoryInfo(result.source);
                                const k = result.source + result.id;
                                return (
                                    <Card
                                        key={k}
                                        className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                        onClick={() => handleCardClick(result)}
                                    >
                                        <div className="w-full h-48 relative bg-muted">
                                            {result.medias && result.medias.length > 0 ? (
                                                <>
                                                    <ImageWithFallback
                                                        src={getMediaImageUrl(result.medias[0].id)}
                                                        alt={result.medias[0].title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Badge variant="outline" className={`absolute top-3 left-3 ${categoryInfo?.color}`}>
                                                        <MapPin className="w-3 h-3 mr-1"/>
                                                        {SOURCE_LABELS[result.source]}
                                                    </Badge>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                                        <Search className="w-12 h-12 text-muted-foreground"/>
                                                    </div>
                                                    <Badge variant="outline" className={`absolute top-3 left-3 ${categoryInfo?.color}`}>
                                                        <MapPin className="w-3 h-3 mr-1"/>
                                                        {SOURCE_LABELS[result.source]}
                                                    </Badge>
                                                </>
                                            )}
                                        </div>

                                        <CardContent className="p-4 space-y-3">
                                            {result.medias && result.medias.length > 0 && (
                                                <div className="border-b pb-3">
                                                    <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                                                        {result.medias[0].title}
                                                    </p>
                                                </div>
                                            )}

                                            <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
                                                {result.title}
                                            </h3>

                                            <div className="flex flex-wrap gap-2">
                                                {result.natures?.slice(0, 2).map((nature) => (
                                                    <Badge key={nature} variant="secondary" className="text-xs">
                                                        {nature}
                                                    </Badge>
                                                ))}
                                                {result.centuries?.slice(0, 1).map((century) => (
                                                    <Badge key={century} variant="outline" className="text-xs">
                                                        <Calendar className="w-3 h-3 mr-1"/>
                                                        {century}
                                                    </Badge>
                                                ))}
                                                {result.professions?.slice(0, 1).map((profession) => (
                                                    <Badge key={profession} variant="outline" className="text-xs">
                                                        {profession}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <Pagination className="justify-center">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {(() => {
                                        const pages = [];
                                        const showEllipsis = totalPages > 7;
                                        if (!showEllipsis) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(i)}
                                                            isActive={currentPage === i}
                                                            className="cursor-pointer"
                                                        >
                                                            {i}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            }
                                        } else {
                                            pages.push(
                                                <PaginationItem key={1}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(1)}
                                                        isActive={currentPage === 1}
                                                        className="cursor-pointer"
                                                    >
                                                        1
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                            if (currentPage > 4) {
                                                pages.push(
                                                    <PaginationItem key="ellipsis1">
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                );
                                            }
                                            const start = Math.max(2, currentPage - 1);
                                            const end = Math.min(totalPages - 1, currentPage + 1);
                                            for (let i = start; i <= end; i++) {
                                                pages.push(
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(i)}
                                                            isActive={currentPage === i}
                                                            className="cursor-pointer"
                                                        >
                                                            {i}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            }
                                            if (currentPage < totalPages - 3) {
                                                pages.push(
                                                    <PaginationItem key="ellipsis2">
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                );
                                            }
                                            if (totalPages > 1) {
                                                pages.push(
                                                    <PaginationItem key={totalPages}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(totalPages)}
                                                            isActive={currentPage === totalPages}
                                                            className="cursor-pointer"
                                                        >
                                                            {totalPages}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            }
                                        }
                                        return pages;
                                    })()}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-medium text-muted-foreground mb-2">Aucun résultat trouvé</h3>
                        <p className="text-muted-foreground mb-6">
                            Essayez de modifier vos critères de recherche ou d'utiliser des termes différents.
                        </p>
                        <Button variant="outline" onClick={clearFilters}>Effacer tous les filtres</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
