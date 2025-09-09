import {useState, useEffect, useRef} from "react";
import {Search, ArrowLeft, Filter, MapPin, Users, Trophy, Church, Calendar} from "lucide-react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Badge} from "./ui/badge";
import {Card, CardContent} from "./ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {ImageWithFallback} from "./ImageWithFallback.tsx";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "./ui/pagination";
import {LocationFilter} from "./filters/LocationFilter";
import {DynamicFilters} from "./filters/DynamicFilters";
import {AdvancedFilters} from "../App";
import {categories} from "../constants/filters";
import {apiService, SearchItem} from "../config/api";
import {transformFiltersToApiFormat, debounce, getMediaImageUrl, SOURCE_LABELS} from "../utils/searchUtils";

interface SearchResultsProps {
    searchQuery: string;
    selectedCategories: string[];
    advancedFilters: AdvancedFilters;
    onSearch: (query: string, categories: string[], filters: AdvancedFilters) => void;
    onBackToHome: () => void;
    onViewDetail?: (resultId: string, source?: string) => void;
}

export function SearchResults({
                                  searchQuery: initialQuery,
                                  selectedCategories: initialCategories,
                                  advancedFilters: initialFilters,
                                  onSearch,
                                  onBackToHome,
                                  onViewDetail
                              }: SearchResultsProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
    const [pendingCategories, setPendingCategories] = useState<string[]>(initialCategories);
    const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(initialFilters);
    const [pendingFilters, setPendingFilters] = useState<AdvancedFilters>(initialFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(20); // 20 par page comme spécifié

    // États pour l'autocomplétion
    const [autocompleteResults, setAutocompleteResults] = useState<SearchItem[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
    const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    // États pour les données de l'API
    const [results, setResults] = useState<SearchItem[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Fonction pour effectuer la recherche via l'API
    const performSearch = async (
        query: string,
        categories: string[],
        filters: AdvancedFilters,
        page: number = 1,
        limit: number = 20
    ) => {
        setIsLoading(true);
        setSearchError(null);

        try {
            // Transformer les filtres pour l'API
            const searchBody = await transformFiltersToApiFormat(categories, filters);

            // Effectuer la recherche
            const response = await apiService.search(query, searchBody, limit, page);

            setResults(response.items);
            setTotalResults(response.total);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            setSearchError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
            setResults([]);
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction de recherche autocomplete avec debounce
    const performAutocompleteSearch = debounce(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setAutocompleteResults([]);
            setShowAutocomplete(false);
            return;
        }

        setIsLoadingAutocomplete(true);

        try {
            // Transformer les filtres pour l'API
            const searchBody = await transformFiltersToApiFormat(selectedCategories, pendingFilters);

            // Faire la recherche avec limit=3 pour l'autocomplétion
            const response = await apiService.search(query, searchBody, 3, 1);

            setAutocompleteResults(response.items);
            setShowAutocomplete(response.items.length > 0);
            setSelectedAutocompleteIndex(-1);
        } catch (error) {
            console.error('Erreur lors de la recherche autocomplete:', error);
            setAutocompleteResults([]);
            setShowAutocomplete(false);
        } finally {
            setIsLoadingAutocomplete(false);
        }
    }, 300);

    // Effet pour déclencher l'autocomplétion
    useEffect(() => {
        performAutocompleteSearch(searchQuery);
    }, [searchQuery, selectedCategories]);

    // Gestion des clics en dehors de l'autocomplétion
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Effet pour effectuer la recherche initiale
    useEffect(() => {
        performSearch(initialQuery, initialCategories, initialFilters, 1, resultsPerPage);


    }, []);

    // Effet pour rechercher quand la page ou le nombre de résultats par page change
    useEffect(() => {
        if (currentPage > 1 || resultsPerPage !== 20) {
            performSearch(searchQuery, selectedCategories, appliedFilters, currentPage, resultsPerPage);
        }
    }, [currentPage, resultsPerPage]);

    // Effet delayé pour ne pas afficher l'autocomplete
    useEffect(() => {
        // Scroll vers le haut lors du chargement
        setTimeout(() => {
            setShowAutocomplete(false);
        }, 100);
    })

    const totalPages = Math.ceil(totalResults / resultsPerPage);

    const toggleCategory = (categoryId: string) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];

        setPendingCategories(newCategories)
        setSelectedCategories(newCategories);
        setCurrentPage(1);
        performSearch(searchQuery, newCategories, appliedFilters, 1, resultsPerPage);
        onSearch(searchQuery, newCategories, appliedFilters);
    };

    const handleSearch = () => {
        const query = searchQuery.trim() || "";
        setCurrentPage(1);
        performSearch(query, selectedCategories, appliedFilters, 1, resultsPerPage);
        onSearch(query, selectedCategories, appliedFilters);
    };

    const handleAutocompleteSelect = (item: SearchItem) => {
        setShowAutocomplete(false);
        setSearchQuery('');
        if (onViewDetail) {
            onViewDetail(item.id, item.source);
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (!showAutocomplete) {
            if (e.key === 'Enter') {
                handleSearch();
            }
            return;
        }

        // Navigation dans l'autocomplétion
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedAutocompleteIndex(prev =>
                prev < autocompleteResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedAutocompleteIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < autocompleteResults.length) {
                handleAutocompleteSelect(autocompleteResults[selectedAutocompleteIndex]);
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setShowAutocomplete(false);
            setSelectedAutocompleteIndex(-1);
        }
    };

    // Gestion des filtres de localisation
    const handleLocationChange = (locationFilters: {
        countries?: string[];
        regions?: string[];
        departments?: string[];
        communes?: string[];
    }) => {
        setPendingFilters(prev => ({
            ...prev,
            location: locationFilters
        }));
    };

    const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
        setPendingFilters(prev => {
            const currentArray = (prev[key] as string[]) || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return {
                ...prev,
                [key]: newArray.length > 0 ? newArray : undefined
            };
        });
    };

    const applyFilters = () => {
        setAppliedFilters(pendingFilters);
        setCurrentPage(1);
        performSearch(searchQuery, selectedCategories, pendingFilters, 1, resultsPerPage);
        onSearch(searchQuery, selectedCategories, pendingFilters);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setAppliedFilters({});
        setPendingFilters({});
        setCurrentPage(1);
        performSearch(searchQuery, [], {}, 1, resultsPerPage);
        onSearch(searchQuery, [], {});
    };

    const getCategoryInfo = (categoryId: string) => {
        return categories.find(cat => cat.id === categoryId);
    };

    const hasActiveFilters = selectedCategories.length > 0 || Object.keys(appliedFilters).some(key => {
        const value = appliedFilters[key as keyof AdvancedFilters];
        if (key === 'location') {
            if (typeof value === 'object' && value) {
                return Object.values(value).some(v => Array.isArray(v) ? v.length > 0 : v);
            }
            return false;
        }
        return Array.isArray(value) && value.length > 0;
    });

    const hasPendingChanges = JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters) || JSON.stringify(pendingCategories) !== JSON.stringify(selectedCategories);

    const handleCardClick = (result: SearchItem) => {
        if (onViewDetail) {
            onViewDetail(result.id, result.source);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleResultsPerPageChange = (value: string) => {
        setResultsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Barre de recherche et navigation */}
            <div className="bg-secondary border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4">
                        {/* Bouton retour */}
                        <div className="flex items-center">
                            <Button variant="ghost" onClick={onBackToHome}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-4 h-4"/>
                                <span className="hidden sm:inline">Retour à l'accueil</span>
                                <span className="sm:hidden">Retour</span>
                            </Button>
                        </div>

                        {/* Barre de recherche responsive */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Input de recherche */}
                            <div className="flex-1 relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Rechercher des monuments, objets, personnes... (optionnel)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    onFocus={() => {
                                        if (autocompleteResults.length > 0) {
                                            setShowAutocomplete(true);
                                        }
                                    }}
                                    className="pl-12 py-4 text-lg border-input bg-input-background rounded-xl"
                                />

                                {/* Autocomplétion */}
                                {showAutocomplete && (
                                    <div
                                        ref={autocompleteRef}
                                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-90 overflow-y-auto"
                                    >
                                        {isLoadingAutocomplete ? (
                                            <div className="p-4 text-center text-muted-foreground">
                                                Recherche en cours...
                                            </div>
                                        ) : (
                                            <>
                                                {autocompleteResults.map((item, index) => {
                                                    const categoryInfo = categories.find(cat => cat.id === item.source);

                                                    return <div
                                                        key={item.id}
                                                        className={`p-3 border-b border-border last:border-b-0 cursor-pointer transition-colors ${
                                                            index === selectedAutocompleteIndex
                                                                ? 'bg-accent'
                                                                : 'hover:bg-accent/50'
                                                        }`}
                                                        onClick={() => handleAutocompleteSelect(item)}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline"
                                                                       className={`text-xs ${categoryInfo ? categoryInfo.color : ''}`}>
                                                                    <MapPin className="w-3 h-3 mr-1"/>
                                                                    {SOURCE_LABELS[item.source]}
                                                                </Badge>
                                                            </div>
                                                            <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {item.natures?.slice(0, 2).map((nature) => (
                                                                    <Badge key={nature} variant="outline"
                                                                           className="text-xs">
                                                                        {nature}
                                                                    </Badge>
                                                                ))}
                                                                {item.centuries?.slice(0, 1).map((century) => (
                                                                    <Badge key={century} variant="outline"
                                                                           className="text-xs">
                                                                        {century}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                })}
                                                <div className="p-2 bg-muted/30 text-center">
                                                    <button
                                                        onClick={handleSearch}
                                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                    >
                                                        Voir tous les résultats pour "{searchQuery}"
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex gap-2 sm:gap-3">
                                <Button onClick={handleSearch} className="flex-1 sm:flex-none sm:px-6"
                                        disabled={isLoading}>
                                    {isLoading ? 'Recherche...' : 'Rechercher'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                                >
                                    <Filter className="w-4 h-4"/>
                                    <span className="hidden xs:inline">Filtres</span>
                                    {hasActiveFilters && (
                                        <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
                                            Actifs
                                        </Badge>
                                    )}
                                    {hasActiveFilters && (
                                        <div className="w-2 h-2 bg-primary rounded-full sm:hidden"></div>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Section des filtres */}
                        {showFilters && (
                            <div className="bg-white rounded-lg p-4 border border-border space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Filtres</h3>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <span className="hidden sm:inline">Effacer tous les filtres</span>
                                            <span className="sm:hidden">Effacer tout</span>
                                        </Button>
                                    )}
                                </div>

                                {/* Filtres par catégorie */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Catégories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => {
                                            const IconComponent = category.id === 'monuments' ? Church :
                                                category.id === 'mobiliers' ? Trophy :
                                                    category.id === 'morales' ? Users : MapPin;
                                            const isSelected = selectedCategories.includes(category.id);

                                            return (
                                                <Badge
                                                    key={category.id}
                                                    variant={isSelected ? "default" : "outline"}
                                                    className={`cursor-pointer px-3 py-2 transition-all duration-200 ${
                                                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
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

                                {/* Filtres de localisation */}
                                <div className="border border-border rounded-lg p-4">
                                    <LocationFilter
                                        value={pendingFilters.location || {}}
                                        onChange={handleLocationChange}
                                    />
                                </div>

                                {/* Filtres dynamiques */}
                                <DynamicFilters
                                    selectedCategories={selectedCategories}
                                    pendingFilters={pendingFilters}
                                    onToggleArrayFilter={toggleArrayFilter}
                                />

                                {/* Bouton d'application des filtres */}
                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        onClick={applyFilters}
                                        className={`w-full sm:w-auto ${hasPendingChanges ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
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
                            <p className="text-muted-foreground">
                                {totalResults} résultat{totalResults > 1 ? 's' : ''} {initialQuery === "" ? "trouvés" : `pour "${initialQuery}"`}
                                {hasActiveFilters &&
                                    <span className="ml-2"><Badge variant="outline">Filtres actifs</Badge></span>}
                            </p>
                        )}
                    </div>

                    {/* Contrôles de pagination */}
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
                        <h3 className="text-xl font-medium text-muted-foreground">
                            Recherche en cours...
                        </h3>
                    </div>
                ) : searchError ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-medium text-destructive mb-2">
                            Erreur de recherche
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchError}
                        </p>
                        <Button onClick={handleSearch}>
                            Réessayer
                        </Button>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {results.map((result) => {

                                const categoryInfo = getCategoryInfo(result.source);

                                const k = result.source + result.id;
                                return (
                                    <Card
                                        key={k}
                                        className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                        onClick={() => handleCardClick(result)}
                                    >
                                        {/* Image avec taille fixe */}
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
                                                    <div
                                                        className="w-full h-full bg-muted flex items-center justify-center">
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
                                            {/* Légende de l'image si elle existe */}
                                            {result.medias && result.medias.length > 0 && (
                                                <div className="border-b pb-3">
                                                    <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                                                        {result.medias[0].title}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Titre */}
                                            <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
                                                {result.title}
                                            </h3>

                                            {/* Tags */}
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
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination className="justify-center">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {/* Pages numbers avec ellipsis logic */}
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
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-medium text-muted-foreground mb-2">
                            Aucun résultat trouvé
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Essayez de modifier vos critères de recherche ou d'utiliser des termes différents.
                        </p>
                        <Button variant="outline" onClick={clearFilters}>
                            Effacer tous les filtres
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}