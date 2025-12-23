import {useState, useEffect} from "react";
import {Calendar, Church, Trophy, Users, MapPin} from "lucide-react";
import {Skeleton} from "../ui/skeleton";
import {apiService, FilterOption} from "../../config/api";
import {AdvancedFilters} from "../../App";
import {SearchableMultiSelect} from "../SearchableMultiSelect";
import {InfoTooltip} from "../InfoTooltip.tsx";
import {tooltipTexts} from "../../constants/tooltipTexts.ts";

interface DynamicFiltersProps {
    selectedCategories: string[];
    pendingFilters: AdvancedFilters;
    onToggleArrayFilter: (key: keyof AdvancedFilters, value: string) => void;
}

export function DynamicFilters({selectedCategories, pendingFilters, onToggleArrayFilter}: DynamicFiltersProps) {
    // États pour les données dynamiques
    const [centuries, setCenturies] = useState<FilterOption[]>([]);
    const [buildingNatures, setBuildingNatures] = useState<FilterOption[]>([]);
    const [conservationStates, setConservationStates] = useState<FilterOption[]>([]);
    const [materials, setMaterials] = useState<FilterOption[]>([]);
    const [furnituresNatures, setFurnituresNatures] = useState<FilterOption[]>([]);
    const [furnituresTechniques, setFurnituresTechniques] = useState<FilterOption[]>([]);
    const [legalEntityNatures, setLegalEntityNatures] = useState<FilterOption[]>([]);
    const [professions, setProfessions] = useState<FilterOption[]>([]);
    const [travels, setTravels] = useState<FilterOption[]>([]);

    // États de chargement
    const [loadingCenturies, setLoadingCenturies] = useState(true);
    const [loadingCategoryData, setLoadingCategoryData] = useState(false);

    // Charger les siècles au démarrage
    useEffect(() => {
        const loadCenturies = async () => {
            try {
                setLoadingCenturies(true);
                const centuriesData = await apiService.getCenturies();
                setCenturies(centuriesData);
            } catch (error) {
                console.error('Erreur lors du chargement des siècles:', error);
            } finally {
                setLoadingCenturies(false);
            }
        };

        loadCenturies();
    }, []);

    // Charger les données spécifiques aux catégories sélectionnées
    useEffect(() => {
        const loadCategoryData = async () => {
            if (selectedCategories.length === 0) return;

            try {
                setLoadingCategoryData(true);

                // Charger les données communes à plusieurs catégories
                const [conservationData, materialsData] = await Promise.all([
                    apiService.getConservationStates(),
                    apiService.getMaterials()
                ]);

                setConservationStates(conservationData);
                setMaterials(materialsData);

                // Charger les données spécifiques par catégorie
                if (selectedCategories.includes('monuments_lieux')) {
                    const buildingNaturesData = await apiService.getBuildingNatures();
                    setBuildingNatures(buildingNaturesData);
                }

                if (selectedCategories.includes('mobiliers_images')) {
                    const [furnituresNaturesData, furnituresTechniquesData] = await Promise.all([
                        apiService.getFurnituresNatures(),
                        apiService.getFurnituresTechniques()
                    ]);
                    setFurnituresNatures(furnituresNaturesData);
                    setFurnituresTechniques(furnituresTechniquesData);
                }

                if (selectedCategories.includes('personnes_morales')) {
                    const legalEntityNaturesData = await apiService.getLegalEntityNatures();
                    setLegalEntityNatures(legalEntityNaturesData);
                }

                if (selectedCategories.includes('personnes_physiques')) {
                    const [professionsData, travelsData] = await Promise.all([
                        apiService.getProfessions(),
                        apiService.getTravels()
                    ]);
                    setProfessions(professionsData);
                    setTravels(travelsData);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données de catégorie:', error);
            } finally {
                setLoadingCategoryData(false);
            }
        };

        loadCategoryData();
    }, [selectedCategories]);

    const getCategoryName = (categoryId: string) => {
        const categoryMap: Record<string, string> = {
            'monuments_lieux': 'Monuments & Lieux',
            'mobiliers_images': 'Mobiliers & Images',
            'personnes_morales': 'Personnes Morales',
            'personnes_physiques': 'Personnes Physiques'
        };
        return categoryMap[categoryId] || categoryId;
    };

    // Composant pour un select multiple avec recherche
    const MultiSelect = ({
                             options,
                             selectedItems,
                             onToggle,
                             placeholder
                         }: {
        options: FilterOption[],
        selectedItems: string[] | undefined,
        onToggle: (value: string) => void,
        placeholder: string,
        filterKey: keyof AdvancedFilters
    }) => {
        // Transformer les options pour SearchableMultiSelect
        const selectOptions = options.map(opt => ({
            id: opt.name, // Utiliser le nom comme ID car c'est ce qui est utilisé dans les filtres
            name: opt.name
        }));

        const handleChange = (selectedNames: string[]) => {
            // Déterminer quels éléments ont été ajoutés ou retirés
            const currentItems = selectedItems || [];

            // Trouver les éléments ajoutés
            const added = selectedNames.filter(name => !currentItems.includes(name));
            // Trouver les éléments retirés
            const removed = currentItems.filter(name => !selectedNames.includes(name));

            // Appeler onToggle pour chaque changement
            [...added, ...removed].forEach(name => onToggle(name));
        };

        return (
            <SearchableMultiSelect
                options={selectOptions}
                selectedValues={selectedItems || []}
                onChange={handleChange}
                placeholder={placeholder}
                searchPlaceholder="Rechercher..."
                emptyMessage="Aucun résultat"
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* Filtres par siècle */}
            <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-primary"/>
                    <h4 className="font-medium">Période</h4>
                    <InfoTooltip content={tooltipTexts.search.centuries}/>
                </div>
                {loadingCenturies ? (
                    <Skeleton className="h-9 w-full"/>
                ) : (
                    <MultiSelect
                        options={centuries}
                        selectedItems={pendingFilters.centuries}
                        onToggle={(value) => onToggleArrayFilter('centuries', value)}
                        placeholder="Sélectionner des siècles"
                        filterKey="centuries"
                    />
                )}
            </div>

            {/* Filtres spécialisés selon les catégories sélectionnées avec en-têtes */}
            {selectedCategories.includes('monuments_lieux') && (
                <div className="space-y-4">
                    {/* En-tête de catégorie */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Church className="w-5 h-5 text-primary"/>
                        <h4 className="font-medium text-lg">{getCategoryName('monuments_lieux')}</h4>
                    </div>

                    {loadingCategoryData ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Array.from({length: 3}).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-5 w-32"/>
                                    <Skeleton className="h-9 w-full"/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Nature du monument
                                    <InfoTooltip content={tooltipTexts.search.monumentsLieux.natures}/>
                                </h4>
                                <MultiSelect
                                    options={buildingNatures}
                                    selectedItems={pendingFilters.naturesMonu}
                                    onToggle={(value) => onToggleArrayFilter('naturesMonu', value)}
                                    placeholder="Sélectionner des natures de monuments et lieux"
                                    filterKey="naturesMonu"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    État de conservation
                                    <InfoTooltip content={tooltipTexts.search.monumentsLieux.conservationStates}/>
                                </h4>
                                <MultiSelect
                                    options={conservationStates}
                                    selectedItems={pendingFilters.conservationStatesMonu}
                                    onToggle={(value) => onToggleArrayFilter('conservationStatesMonu', value)}
                                    placeholder="Sélectionner des états de conservation"
                                    filterKey="conservationStatesMonu"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Matériaux
                                    <InfoTooltip content={tooltipTexts.search.monumentsLieux.materials}/>
                                </h4>
                                <MultiSelect
                                    options={materials}
                                    selectedItems={pendingFilters.materialsMonu}
                                    onToggle={(value) => onToggleArrayFilter('materialsMonu', value)}
                                    placeholder="Sélectionner des matériaux"
                                    filterKey="materialsMonu"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedCategories.includes('mobiliers_images') && (
                <div className="space-y-4">
                    {/* En-tête de catégorie */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Trophy className="w-5 h-5 text-primary"/>
                        <h4 className="font-medium text-lg">{getCategoryName('mobiliers_images')}</h4>
                    </div>

                    {loadingCategoryData ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-5 w-24"/>
                                    <Skeleton className="h-9 w-full"/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Nature
                                    <InfoTooltip content={tooltipTexts.search.mobiliersImages.natures}/>
                                </h4>
                                <MultiSelect
                                    options={furnituresNatures}
                                    selectedItems={pendingFilters.naturesMob}
                                    onToggle={(value) => onToggleArrayFilter('naturesMob', value)}
                                    placeholder="Sélectionner des natures"
                                    filterKey="naturesMob"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Conservation
                                    <InfoTooltip content={tooltipTexts.search.mobiliersImages.conservationStates}/>
                                </h4>
                                <MultiSelect
                                    options={conservationStates}
                                    selectedItems={pendingFilters.conservationStatesMob}
                                    onToggle={(value) => onToggleArrayFilter('conservationStatesMob', value)}
                                    placeholder="Sélectionner des états de conservation"
                                    filterKey="conservationStatesMob"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Matériaux
                                    <InfoTooltip content={tooltipTexts.search.mobiliersImages.materials}/>
                                </h4>
                                <MultiSelect
                                    options={materials}
                                    selectedItems={pendingFilters.materialsMob}
                                    onToggle={(value) => onToggleArrayFilter('materialsMob', value)}
                                    placeholder="Sélectionner des matériaux"
                                    filterKey="materialsMob"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Techniques
                                    <InfoTooltip content={tooltipTexts.search.mobiliersImages.techniques}/>
                                </h4>
                                <MultiSelect
                                    options={furnituresTechniques}
                                    selectedItems={pendingFilters.techniques}
                                    onToggle={(value) => onToggleArrayFilter('techniques', value)}
                                    placeholder="Sélectionner des techniques"
                                    filterKey="techniques"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedCategories.includes('personnes_morales') && (
                <div className="space-y-4">
                    {/* En-tête de catégorie */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Users className="w-5 h-5 text-primary"/>
                        <h4 className="font-medium text-lg">{getCategoryName('personnes_morales')}</h4>
                    </div>

                    {loadingCategoryData ? (
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40"/>
                            <Skeleton className="h-9 w-full"/>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-1 font-medium">
                                Nature de l'organisation
                                <InfoTooltip content={tooltipTexts.search.personnesMorales.natures}/>
                            </h4>
                            <MultiSelect
                                options={legalEntityNatures}
                                selectedItems={pendingFilters.naturesOrg}
                                onToggle={(value) => onToggleArrayFilter('naturesOrg', value)}
                                placeholder="Sélectionner des natures"
                                filterKey="naturesOrg"
                            />
                        </div>
                    )}
                </div>
            )}

            {selectedCategories.includes('personnes_physiques') && (
                <div className="space-y-4">
                    {/* En-tête de catégorie */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <MapPin className="w-5 h-5 text-primary"/>
                        <h4 className="font-medium text-lg">{getCategoryName('personnes_physiques')}</h4>
                    </div>

                    {loadingCategoryData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({length: 2}).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-5 w-24"/>
                                    <Skeleton className="h-9 w-full"/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Profession
                                    <InfoTooltip content={tooltipTexts.search.personnesPhysiques.professions}/>
                                </h4>
                                <MultiSelect
                                    options={professions}
                                    selectedItems={pendingFilters.professions}
                                    onToggle={(value) => onToggleArrayFilter('professions', value)}
                                    placeholder="Sélectionner des professions"
                                    filterKey="professions"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-1 font-medium">
                                    Mode de transport
                                    <InfoTooltip content={tooltipTexts.search.personnesPhysiques.transportModes}/>
                                </h4>
                                <MultiSelect
                                    options={travels}
                                    selectedItems={pendingFilters.transportModes}
                                    onToggle={(value) => onToggleArrayFilter('transportModes', value)}
                                    placeholder="Sélectionner des modes"
                                    filterKey="transportModes"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}