import {useState, useEffect, useRef, forwardRef, useImperativeHandle} from "react";
import {X, Search, MapPin} from "lucide-react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Badge} from "../ui/badge";
import {Card, CardContent} from "../ui/card";
import {apiService, Country, Region, Department, Commune} from "../../config/api";
import {SearchableMultiSelect} from "../SearchableMultiSelect";
import {InfoTooltip} from "../InfoTooltip.tsx";
import {tooltipTexts} from "../../constants/tooltipTexts.ts";

interface LocationFilters {
    countries?: string[];
    regions?: string[];
    departments?: string[];
    communes?: string[];
}

interface LocationFilterProps {
    value: LocationFilters;
    onChange: (filters: LocationFilters) => void;
    showClearButton?: boolean; // Si vrai, affiche le bouton "Effacer tout" (page d'accueil)
}

// Interface pour les méthodes exposées au parent
export interface LocationFilterRef {
    clearAll: () => void;
}

export const LocationFilter = forwardRef<LocationFilterRef, LocationFilterProps>(
    ({value, onChange, showClearButton = true}, ref) => {
        // États pour les données
        const [countries, setCountries] = useState<Country[]>([]);
        const [regions, setRegions] = useState<Region[]>([]);
        const [departments, setDepartments] = useState<Department[]>([]);
        const [communesResults, setCommunesResults] = useState<Commune[]>([]);

        // États pour la sélection
        const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
        const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
        const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
        const [selectedCommunes, setSelectedCommunes] = useState<Commune[]>([]);

        // États pour l'interface
        const [communeSearch, setCommuneSearch] = useState('');
        const [showCommuneResults, setShowCommuneResults] = useState(false);
        const [isSearchingCommunes, setIsSearchingCommunes] = useState(false);

        // Ref pour le debounce
        const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

        // Chargement initial des données
        useEffect(() => {
            loadCountries();
            loadRegions();
            loadDepartments();
        }, []);

        // Synchronisation avec les valeurs externes
        useEffect(() => {
            if (value.countries) {
                const selected = countries.filter(c => value.countries!.includes(c.id));
                setSelectedCountries(selected);
            }
        }, [value.countries, countries]);

        useEffect(() => {
            if (value.regions) {
                const selected = regions.filter(r => value.regions!.includes(r.id));
                setSelectedRegions(selected);
            }
        }, [value.regions, regions]);

        useEffect(() => {
            if (value.departments) {
                const selected = departments.filter(d => value.departments!.includes(d.id));
                setSelectedDepartments(selected);
            }
        }, [value.departments, departments]);

        useEffect(() => {
            if (value.communes && value.communes.length > 0) {
                // Restaurer les communes sélectionnées depuis le localStorage
                const storedCommunes = localStorage.getItem('selected_communes');
                if (storedCommunes) {
                    try {
                        const parsed = JSON.parse(storedCommunes) as Commune[];
                        // Filtrer pour garder seulement celles qui sont dans value.communes
                        const matchingCommunes = parsed.filter(c => value.communes!.includes(c.id));
                        if (matchingCommunes.length > 0) {
                            setSelectedCommunes(matchingCommunes);
                        }
                    } catch (error) {
                        console.error('Erreur lors du parsing des communes:', error);
                    }
                }
            } else if (!value.communes || value.communes.length === 0) {
                // Si pas de communes dans les filtres, vider la sélection
                setSelectedCommunes([]);
            }
        }, [value.communes]);

        const loadCountries = async () => {
            try {
                const data = await apiService.getCountries();
                setCountries(data);
            } catch (error) {
                console.error('Erreur chargement pays:', error);
            }
        };

        const loadRegions = async () => {
            try {
                const data = await apiService.getRegions();
                setRegions(data);
            } catch (error) {
                console.error('Erreur chargement régions:', error);
            }
        };

        const loadDepartments = async () => {
            try {
                const data = await apiService.getDepartments();
                setDepartments(data);
            } catch (error) {
                console.error('Erreur chargement départements:', error);
            }
        };

        const searchCommunes = async (query: string) => {
            if (query.length < 2) {
                setCommunesResults([]);
                return;
            }

            setIsSearchingCommunes(true);
            try {
                const data = await apiService.searchCommunes(query);
                setCommunesResults(data);
            } catch (error) {
                console.error('Erreur recherche communes:', error);
                setCommunesResults([]);
            } finally {
                setIsSearchingCommunes(false);
            }
        };

        // Debounce pour la recherche de communes
        useEffect(() => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = setTimeout(() => {
                searchCommunes(communeSearch);
            }, 300);

            return () => {
                if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                }
            };
        }, [communeSearch]);

        // Filtrage des régions selon les pays sélectionnés
        const getFilteredRegions = () => {
            if (selectedCountries.length === 0) {
                return regions;
            }
            // Retourner seulement les régions des pays sélectionnés
            const selectedCountryIds = selectedCountries.map(c => c.id);
            return regions.filter(r => selectedCountryIds.includes(r.pays.id));
        };

        const getFilteredDepartments = () => {
            // Si des régions sont sélectionnées, filtrer par régions
            if (selectedRegions.length > 0) {
                const selectedRegionIds = selectedRegions.map(r => r.id);
                return departments.filter(d => selectedRegionIds.includes(d.region.id));
            }
            // Sinon, si des pays sont sélectionnés, filtrer par pays
            if (selectedCountries.length > 0) {
                const selectedCountryIds = selectedCountries.map(c => c.id);
                return departments.filter(d => selectedCountryIds.includes(d.region.pays.id));
            }
            // Sinon, retourner tous les départements
            return departments;
        };

        const getFilteredCommunes = () => {
            // Si des départements sont sélectionnés, filtrer par départements
            if (selectedDepartments.length > 0) {
                const selectedDepartmentIds = selectedDepartments.map(d => d.id);
                return communesResults.filter(c => selectedDepartmentIds.includes(c.department.id));
            }
            // Sinon, si des régions sont sélectionnées, filtrer par régions
            if (selectedRegions.length > 0) {
                const selectedRegionIds = selectedRegions.map(r => r.id);
                return communesResults.filter(c => selectedRegionIds.includes(c.department.region.id));
            }
            // Sinon, si des pays sont sélectionnés, filtrer par pays
            if (selectedCountries.length > 0) {
                const selectedCountryIds = selectedCountries.map(c => c.id);
                return communesResults.filter(c => selectedCountryIds.includes(c.department.region.pays.id));
            }
            // Sinon, retourner toutes les communes
            return communesResults;
        };

        // Gestion de la sélection des pays avec SearchableMultiSelect
        const handleCountrySelectionChange = (selectedIds: string[]) => {
            const newSelected = countries.filter(c => selectedIds.includes(c.id));
            const previousIds = selectedCountries.map(c => c.id);

            // Détecter les pays supprimés
            const removedCountryIds = previousIds.filter(id => !selectedIds.includes(id));

            setSelectedCountries(newSelected);

            // Si des pays ont été supprimés, supprimer les régions, départements et communes associés
            if (removedCountryIds.length > 0) {
                // Supprimer les régions des pays supprimés
                const newRegions = selectedRegions.filter(r => !removedCountryIds.includes(r.pays.id));
                setSelectedRegions(newRegions);

                // Supprimer les départements des pays supprimés
                const newDepartments = selectedDepartments.filter(d => !removedCountryIds.includes(d.region.pays.id));
                setSelectedDepartments(newDepartments);

                // Supprimer les communes des pays supprimés
                const newCommunes = selectedCommunes.filter(c => !removedCountryIds.includes(c.department.region.pays.id));
                setSelectedCommunes(newCommunes);

                // Mettre à jour le localStorage pour les communes
                if (newCommunes.length > 0) {
                    localStorage.setItem('selected_communes', JSON.stringify(newCommunes));
                } else {
                    localStorage.removeItem('selected_communes');
                }

                onChange({
                    countries: selectedIds,
                    regions: newRegions.map(r => r.id),
                    departments: newDepartments.map(d => d.id),
                    communes: newCommunes.map(c => c.id)
                });
            } else {
                onChange({
                    ...value,
                    countries: selectedIds
                });
            }
        };

        // Gestion de la sélection des régions avec SearchableMultiSelect
        const handleRegionSelectionChange = (selectedIds: string[]) => {
            const newSelected = regions.filter(r => selectedIds.includes(r.id));
            const previousIds = selectedRegions.map(r => r.id);

            // Détecter les régions supprimées
            const removedRegionIds = previousIds.filter(id => !selectedIds.includes(id));

            // Détecter les régions ajoutées
            const addedRegionIds = selectedIds.filter(id => !previousIds.includes(id));

            setSelectedRegions(newSelected);

            let updatedCountries = [...selectedCountries];
            let updatedDepartments = [...selectedDepartments];
            let updatedCommunes = [...selectedCommunes];

            // Si des régions ont été supprimées, supprimer les départements et communes associés
            if (removedRegionIds.length > 0) {
                updatedDepartments = selectedDepartments.filter(d => !removedRegionIds.includes(d.region.id));
                setSelectedDepartments(updatedDepartments);

                updatedCommunes = selectedCommunes.filter(c => !removedRegionIds.includes(c.department.region.id));
                setSelectedCommunes(updatedCommunes);

                // Mettre à jour le localStorage pour les communes
                if (updatedCommunes.length > 0) {
                    localStorage.setItem('selected_communes', JSON.stringify(updatedCommunes));
                } else {
                    localStorage.removeItem('selected_communes');
                }
            }

            // Si des régions ont été ajoutées, auto-sélectionner les pays parents
            if (addedRegionIds.length > 0) {
                const addedRegions = regions.filter(r => addedRegionIds.includes(r.id));
                const parentCountryIds = addedRegions.map(r => r.pays.id);
                const uniqueParentCountryIds = [...new Set(parentCountryIds)];

                // Ajouter les pays manquants
                const currentCountryIds = updatedCountries.map(c => c.id);
                const newCountryIds = uniqueParentCountryIds.filter(id => !currentCountryIds.includes(id));

                if (newCountryIds.length > 0) {
                    const newCountries = countries.filter(c => newCountryIds.includes(c.id));
                    updatedCountries = [...updatedCountries, ...newCountries];
                    setSelectedCountries(updatedCountries);
                }
            }

            onChange({
                countries: updatedCountries.map(c => c.id),
                regions: selectedIds,
                departments: updatedDepartments.map(d => d.id),
                communes: updatedCommunes.map(c => c.id)
            });
        };

        // Gestion de la sélection des départements avec SearchableMultiSelect
        const handleDepartmentSelectionChange = (selectedIds: string[]) => {
            const newSelected = departments.filter(d => selectedIds.includes(d.id));
            const previousIds = selectedDepartments.map(d => d.id);

            // Détecter les départements supprimés
            const removedDepartmentIds = previousIds.filter(id => !selectedIds.includes(id));

            // Détecter les départements ajoutés
            const addedDepartmentIds = selectedIds.filter(id => !previousIds.includes(id));

            setSelectedDepartments(newSelected);

            let updatedCountries = [...selectedCountries];
            let updatedRegions = [...selectedRegions];
            let updatedCommunes = [...selectedCommunes];

            // Si des départements ont été supprimés, supprimer les communes associées
            if (removedDepartmentIds.length > 0) {
                updatedCommunes = selectedCommunes.filter(c => !removedDepartmentIds.includes(c.department.id));
                setSelectedCommunes(updatedCommunes);

                // Mettre à jour le localStorage pour les communes
                if (updatedCommunes.length > 0) {
                    localStorage.setItem('selected_communes', JSON.stringify(updatedCommunes));
                } else {
                    localStorage.removeItem('selected_communes');
                }
            }

            // Si des départements ont été ajoutés, auto-sélectionner les régions et pays parents
            if (addedDepartmentIds.length > 0) {
                const addedDepartments = departments.filter(d => addedDepartmentIds.includes(d.id));

                // Auto-sélectionner les régions parentes
                const parentRegionIds = addedDepartments.map(d => d.region.id);
                const uniqueParentRegionIds = [...new Set(parentRegionIds)];
                const currentRegionIds = updatedRegions.map(r => r.id);
                const newRegionIds = uniqueParentRegionIds.filter(id => !currentRegionIds.includes(id));

                if (newRegionIds.length > 0) {
                    const newRegions = regions.filter(r => newRegionIds.includes(r.id));
                    updatedRegions = [...updatedRegions, ...newRegions];
                    setSelectedRegions(updatedRegions);
                }

                // Auto-sélectionner les pays parents
                const parentCountryIds = addedDepartments.map(d => d.region.pays.id);
                const uniqueParentCountryIds = [...new Set(parentCountryIds)];
                const currentCountryIds = updatedCountries.map(c => c.id);
                const newCountryIds = uniqueParentCountryIds.filter(id => !currentCountryIds.includes(id));

                if (newCountryIds.length > 0) {
                    const newCountries = countries.filter(c => newCountryIds.includes(c.id));
                    updatedCountries = [...updatedCountries, ...newCountries];
                    setSelectedCountries(updatedCountries);
                }
            }

            onChange({
                countries: updatedCountries.map(c => c.id),
                regions: updatedRegions.map(r => r.id),
                departments: selectedIds,
                communes: updatedCommunes.map(c => c.id)
            });
        };

        // Gestion de la sélection des communes
        const handleCommuneSelect = (commune: Commune) => {
            if (selectedCommunes.find(c => c.id === commune.id)) {
                return; // Déjà sélectionnée
            }

            const newSelected = [...selectedCommunes, commune];
            setSelectedCommunes(newSelected);

            // Sauvegarder dans localStorage pour la persistance
            localStorage.setItem('selected_communes', JSON.stringify(newSelected));

            // Auto-sélectionner les parents (département, région, pays)
            let updatedCountries = [...selectedCountries];
            let updatedRegions = [...selectedRegions];
            let updatedDepartments = [...selectedDepartments];

            // Auto-sélectionner le département parent si pas déjà sélectionné
            const departmentId = commune.department.id;
            if (!updatedDepartments.find(d => d.id === departmentId)) {
                const department = departments.find(d => d.id === departmentId);
                if (department) {
                    updatedDepartments = [...updatedDepartments, department];
                    setSelectedDepartments(updatedDepartments);
                }
            }

            // Auto-sélectionner la région parente si pas déjà sélectionnée
            const regionId = commune.department.region.id;
            if (!updatedRegions.find(r => r.id === regionId)) {
                const region = regions.find(r => r.id === regionId);
                if (region) {
                    updatedRegions = [...updatedRegions, region];
                    setSelectedRegions(updatedRegions);
                }
            }

            // Auto-sélectionner le pays parent si pas déjà sélectionné
            const countryId = commune.department.region.pays.id;
            if (!updatedCountries.find(c => c.id === countryId)) {
                const country = countries.find(c => c.id === countryId);
                if (country) {
                    updatedCountries = [...updatedCountries, country];
                    setSelectedCountries(updatedCountries);
                }
            }

            onChange({
                countries: updatedCountries.map(c => c.id),
                regions: updatedRegions.map(r => r.id),
                departments: updatedDepartments.map(d => d.id),
                communes: newSelected.map(c => c.id)
            });

            setCommuneSearch('');
            setShowCommuneResults(false);
        };

        // Suppression d'une commune sélectionnée
        const removeCommuneSelection = (commune: Commune) => {
            const newSelected = selectedCommunes.filter(c => c.id !== commune.id);
            setSelectedCommunes(newSelected);

            // Mettre à jour le localStorage
            if (newSelected.length > 0) {
                localStorage.setItem('selected_communes', JSON.stringify(newSelected));
            } else {
                localStorage.removeItem('selected_communes');
            }

            onChange({
                ...value,
                communes: newSelected.map(c => c.id)
            });
        };

        // Effacer toutes les sélections
        const clearAll = () => {
            setSelectedCountries([]);
            setSelectedRegions([]);
            setSelectedDepartments([]);
            setSelectedCommunes([]);
            setCommuneSearch('');
            localStorage.removeItem('selected_communes');
            onChange({});
        };

        // Exposer clearAll au parent via ref
        useImperativeHandle(ref, () => ({
            clearAll
        }));

        const getTotalSelections = () => {
            return selectedCountries.length + selectedRegions.length +
                selectedDepartments.length + selectedCommunes.length;
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground"/>
                        <span className="font-medium">Localisation</span>
                        <InfoTooltip content={tooltipTexts.search.location} />
                        {getTotalSelections() > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {getTotalSelections()}
                            </Badge>
                        )}
                    </div>
                    {showClearButton && getTotalSelections() > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAll}>
                            Effacer tout
                        </Button>
                    )}
                </div>

                {/* Pays - avec recherche */}
                <SearchableMultiSelect
                    options={countries.map(c => ({ id: c.id, name: c.name }))}
                    selectedValues={selectedCountries.map(c => c.id)}
                    onChange={handleCountrySelectionChange}
                    placeholder="Sélectionner des pays"
                    searchPlaceholder="Rechercher un pays..."
                    emptyMessage="Aucun pays trouvé"
                />

                {/* Régions - avec recherche */}
                <SearchableMultiSelect
                    options={getFilteredRegions().map(r => ({
                        id: r.id,
                        name: r.name,
                        description: r.pays.name
                    }))}
                    selectedValues={selectedRegions.map(r => r.id)}
                    onChange={handleRegionSelectionChange}
                    placeholder="Sélectionner des régions"
                    searchPlaceholder="Rechercher une région..."
                    emptyMessage="Aucune région trouvée"
                />

                {/* Départements - avec recherche */}
                <SearchableMultiSelect
                    options={getFilteredDepartments().map(d => ({
                        id: d.id,
                        name: d.name,
                        description: `${d.region.name}, ${d.region.pays.name}`
                    }))}
                    selectedValues={selectedDepartments.map(d => d.id)}
                    onChange={handleDepartmentSelectionChange}
                    placeholder="Sélectionner des départements"
                    searchPlaceholder="Rechercher un département..."
                    emptyMessage="Aucun département trouvé"
                />

                {/* Communes */}
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher des communes..."
                            value={communeSearch}
                            onChange={(e) => {
                                setCommuneSearch(e.target.value);
                                setShowCommuneResults(e.target.value.length >= 2);
                            }}
                            onFocus={() => {
                                if (communeSearch.length >= 2) {
                                    setShowCommuneResults(true);
                                }
                            }}
                            className="pl-10"
                        />
                    </div>

                    {showCommuneResults && (
                        <Card className="absolute top-full left-0 right-0 z-10 mt-1">
                            <CardContent className="p-2 max-h-64 overflow-auto">
                                {isSearchingCommunes && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Recherche en cours...
                                    </div>
                                )}
                                {!isSearchingCommunes && getFilteredCommunes().length === 0 && communeSearch.length >= 2 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Aucune commune trouvée
                                    </div>
                                )}
                                {!isSearchingCommunes && getFilteredCommunes().map((commune) => (
                                    <div
                                        key={commune.id}
                                        onClick={() => handleCommuneSelect(commune)}
                                        className="p-2 hover:bg-accent rounded cursor-pointer"
                                    >
                                        <div className="font-medium">{commune.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {commune.department.name}, {commune.department.region.name}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Tags des communes sélectionnées */}
                    {selectedCommunes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedCommunes.map((commune) => (
                                <Badge key={commune.id} variant="secondary" className="flex items-center gap-1">
                                    <span className="truncate max-w-32">{commune.name}</span>
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                                        onClick={() => removeCommuneSelection(commune)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Fermer les dropdowns quand on clique ailleurs */}
                {showCommuneResults && (
                    <div
                        className="fixed inset-0 z-0"
                        onClick={() => {
                            setShowCommuneResults(false);
                        }}
                    />
                )}
            </div>
        );
    });

LocationFilter.displayName = 'LocationFilter';