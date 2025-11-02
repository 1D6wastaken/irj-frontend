import {useState, useEffect} from "react";
import {
    ArrowLeft,
    Save,
    MapPin,
    Plus,
    X,
    Search,
    ImageIcon,
    Trash2,
    Link,
    FileText,
    AlertCircle
} from "lucide-react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Textarea} from "./ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Checkbox} from "./ui/checkbox";
import {Badge} from "./ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {toast} from "sonner";
import {sourceTypes} from "../constants/formConstants";
import {
    apiService,
    FilterOption,
    Country,
    Region,
    Department,
    Commune,
    ApiError,
    MobilierImageDetail,
    MonumentLieuDetail,
    PersonneMoraleDetail,
    PersonnePhysiqueDetail,
    SearchItem,
    SearchRequestBody
} from "../config/api";
import {SearchableMultiSelect} from "./SearchableMultiSelect";
import {SearchableSelect} from "./SearchableSelect";
import {getMediaImageUrl} from "../utils/searchUtils";
import {ImageWithFallback} from "./ImageWithFallback";

interface EditDraftPageProps {
    recordId: string;
    source: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques';
    onBack: () => void;
    onSessionExpired: () => void;
}

interface ImageUpload {
    file: File;
    caption: string;
    preview: string;
}

interface ExistingImage {
    id: string;
    title: string;
}

interface FormData {
    name: string;
    centuries: string[];
    location: {
        commune: string;
        department: string;
        region: string;
        country: string;
    };
    images: ImageUpload[];
    existingImages: ExistingImage[];
    imagesToDelete: string[];
    themes: string[];
    contributors: string[];
    relatedForms: { id: string; title: string; source: string; }[];
    source: {
        type: string;
        author: string;
        title: string;
        url: string;
        details: string;
    };
    description?: string;
    history?: string;
    bibliography?: string;
    conservationStates?: string[];
    materials?: string[];
    techniques?: string[];
    natures?: string[];
    protected?: boolean;
    protectionComment?: string;
    inscription?: string;
    currentLocation?: string;
    originalLocation?: string;
    coordinates?: {
        latitude: string;
        longitude: string;
    };
    // Champs spécifiques aux personnes morales
    simpleMention?: boolean;
    foundationAct?: boolean;
    statutesText?: string;
    functioningDescription?: string;
    socialParticipation?: string;
    relatedObjects?: string;
    comment?: string;
    // Champs spécifiques aux personnes physiques
    birthDate?: string;
    deathDate?: string;
    attestation?: string;
    historicalPeriods?: string[];
    professions?: string[];
    biographicalElements?: string;
    pilgrimage?: string;
    transportModes?: string[];
    eventNature?: string;
    commutationVow?: string;
}

export function EditDraftPage({recordId, source, onBack, onSessionExpired}: EditDraftPageProps) {
    const [result, setResult] = useState<MobilierImageDetail | MonumentLieuDetail | PersonneMoraleDetail | PersonnePhysiqueDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [wasSubmittedAsDraft, setWasSubmittedAsDraft] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // États pour le formulaire
    const [formData, setFormData] = useState<FormData>({
        name: '',
        centuries: [],
        location: {
            commune: '',
            department: '',
            region: '',
            country: ''
        },
        images: [],
        existingImages: [],
        imagesToDelete: [],
        themes: [],
        contributors: [],
        relatedForms: [],
        source: {
            type: '',
            author: '',
            title: '',
            url: '',
            details: ''
        },
        materials: [],
        techniques: [],
        natures: [],
        conservationStates: [],
        protected: false
    });

    // États pour les contributeurs
    const [newContributor, setNewContributor] = useState('');

    // États pour les fiches liées
    const [ficheSearchQuery, setFicheSearchQuery] = useState('');
    const [ficheSearchResults, setFicheSearchResults] = useState<SearchItem[]>([]);
    const [showFicheResults, setShowFicheResults] = useState(false);
    const [isSearchingFiches, setIsSearchingFiches] = useState(false);

    // États pour les erreurs
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // État pour les données initiales (pour détecter les changements)
    const [initialFormData, setInitialFormData] = useState<FormData | null>(null);

    // États pour les données dynamiques
    const [centuries, setCenturies] = useState<FilterOption[]>([]);
    const [themes, setThemes] = useState<FilterOption[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);

    // États pour la sélection de localisation
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);

    // États pour l'interface de localisation
    const [communeQuery, setCommuneQuery] = useState('');
    const [showCommuneResults, setShowCommuneResults] = useState(false);
    const [isSearchingCommunes, setIsSearchingCommunes] = useState(false);

    // États pour les filtres spécifiques
    const [conservationStates, setConservationStates] = useState<FilterOption[]>([]);
    const [materials, setMaterials] = useState<FilterOption[]>([]);
    const [furnituresNatures, setFurnituresNatures] = useState<FilterOption[]>([]);
    const [buildingNatures, setBuildingNatures] = useState<FilterOption[]>([]);
    const [legalEntityNatures, setLegalEntityNatures] = useState<FilterOption[]>([]);
    const [furnituresTechniques, setFurnituresTechniques] = useState<FilterOption[]>([]);
    const [professions, setProfessions] = useState<FilterOption[]>([]);
    const [travels, setTravels] = useState<FilterOption[]>([]);
    const [historicalPeriods, setHistoricalPeriods] = useState<FilterOption[]>([]);

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        loadInitialData();
    }, [recordId, source]);

    // Recherche de fiches liées avec debounce
    useEffect(() => {
        if (ficheSearchQuery.length >= 2) {
            const timer = setTimeout(() => {
                searchFiches(ficheSearchQuery);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setFicheSearchResults([]);
        }
    }, [ficheSearchQuery, source]);

    const searchFiches = async (query: string) => {
        if (query.length < 2) {
            setFicheSearchResults([]);
            return;
        }

        setIsSearchingFiches(true);
        try {
            let searchReqBody: SearchRequestBody = {};
            switch (source) {
                case 'monuments_lieux':
                    searchReqBody = {
                        mobiliers_images: {},
                        pers_morales: {},
                        pers_physiques: {},
                    };
                    break;
                case 'mobiliers_images':
                    searchReqBody = {
                        monuments_lieux: {},
                        pers_morales: {},
                        pers_physiques: {},
                    };
                    break;
                case 'personnes_morales':
                    searchReqBody = {
                        mobiliers_images: {},
                        monuments_lieux: {},
                        pers_physiques: {},
                    };
                    break;
                case 'personnes_physiques':
                    searchReqBody = {
                        mobiliers_images: {},
                        pers_morales: {},
                        monuments_lieux: {},
                    };
                    break;
            }
            const response = await apiService.search(
                query,
                searchReqBody,
                3,
                1
            );

            // Extraire les résultats de toutes les sources
            if (response.items && response.items.length > 0) {
                setFicheSearchResults(response.items);
            } else {
                setFicheSearchResults([]);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche de fiches:', error);
            setFicheSearchResults([]);
        } finally {
            setIsSearchingFiches(false);
        }
    };

    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Charger les données de la fiche
            const detailResult = await apiService.getRecordDetail(source, recordId);
            setResult(detailResult);

            // Charger les données pour les selects selon le type de fiche
            let centuriesData: FilterOption[];
            let themesData: FilterOption[];
            let countriesData: Country[];
            let conservationStatesData: FilterOption[];
            let materialsData: FilterOption[];
            let regionsData: Region[];
            let departmentsData: Department[];

            if (source === 'mobiliers_images') {
                const results = await Promise.all([
                    apiService.getCenturies(),
                    apiService.getThemes(),
                    apiService.getCountries(),
                    apiService.getConservationStates(),
                    apiService.getMaterials(),
                    apiService.getFurnituresNatures(),
                    apiService.getFurnituresTechniques(),
                    apiService.getRegions(),
                    apiService.getDepartments(),
                ]);

                centuriesData = results[0];
                themesData = results[1];
                countriesData = results[2];
                conservationStatesData = results[3];
                materialsData = results[4];
                const furnituresNaturesData = results[5];
                const furnituresTechniquesData = results[6];
                regionsData = results[7];
                departmentsData = results[8];

                // Mettre à jour les states spécifiques aux mobiliers
                setFurnituresNatures(furnituresNaturesData);
                setFurnituresTechniques(furnituresTechniquesData);
            } else if (source === 'monuments_lieux') {
                const results = await Promise.all([
                    apiService.getCenturies(),
                    apiService.getThemes(),
                    apiService.getCountries(),
                    apiService.getConservationStates(),
                    apiService.getMaterials(),
                    apiService.getBuildingNatures(),
                    apiService.getRegions(),
                    apiService.getDepartments()
                ]);

                centuriesData = results[0];
                themesData = results[1];
                countriesData = results[2];
                conservationStatesData = results[3];
                materialsData = results[4];
                const buildingNaturesData = results[5];
                regionsData = results[6];
                departmentsData = results[7];

                // Mettre à jour les states spécifiques aux monuments
                setBuildingNatures(buildingNaturesData);
            } else if (source === 'personnes_morales') {
                const results = await Promise.all([
                    apiService.getCenturies(),
                    apiService.getThemes(),
                    apiService.getCountries(),
                    apiService.getLegalEntityNatures(),
                    apiService.getRegions(),
                    apiService.getDepartments()
                ]);

                centuriesData = results[0];
                themesData = results[1];
                countriesData = results[2];
                const legalEntityNaturesData = results[3];
                regionsData = results[4];
                departmentsData = results[5];

                // Mettre à jour les states spécifiques aux personnes morales
                setLegalEntityNatures(legalEntityNaturesData);

                // Pas besoin de conservation states et materials pour les personnes morales
                conservationStatesData = [];
                materialsData = [];
            } else if (source === 'personnes_physiques') {
                const results = await Promise.all([
                    apiService.getCenturies(),
                    apiService.getThemes(),
                    apiService.getCountries(),
                    apiService.getProfessions(),
                    apiService.getTravels(),
                    apiService.getHistoricalPeriods(),
                    apiService.getRegions(),
                    apiService.getDepartments()
                ]);

                centuriesData = results[0];
                themesData = results[1];
                countriesData = results[2];
                const professionsData = results[3];
                const travelsData = results[4];
                const historicalPeriodsData = results[5];
                regionsData = results[6];
                departmentsData = results[7];

                // Mettre à jour les states spécifiques aux personnes physiques
                setProfessions(professionsData);
                setTravels(travelsData);
                setHistoricalPeriods(historicalPeriodsData);

                // Pas besoin de conservation states et materials pour les personnes physiques
                conservationStatesData = [];
                materialsData = [];
            } else {
                // Type non supporté, charger les données de base
                const results = await Promise.all([
                    apiService.getCenturies(),
                    apiService.getThemes(),
                    apiService.getCountries(),
                    apiService.getConservationStates(),
                    apiService.getMaterials(),
                    apiService.getRegions(),
                    apiService.getDepartments()
                ]);

                centuriesData = results[0];
                themesData = results[1];
                countriesData = results[2];
                conservationStatesData = results[3];
                materialsData = results[4];
                regionsData = results[5];
                departmentsData = results[6];
            }

            // Mettre à jour les states communs
            setCenturies(centuriesData);
            setThemes(themesData);
            setCountries(countriesData);
            setConservationStates(conservationStatesData);
            setMaterials(materialsData);
            setRegions(regionsData);
            setDepartments(departmentsData);

            // Pré-remplir le formulaire avec les données existantes
            prefillFormData(detailResult as MobilierImageDetail | MonumentLieuDetail | PersonneMoraleDetail | PersonnePhysiqueDetail, countriesData, regionsData, departmentsData);

        } catch (error) {
            console.error('Erreur lors du chargement de la fiche:', error);
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    onSessionExpired();
                } else if (error.status === 404) {
                    setError(`Fiche non trouvée pour l'ID: ${recordId}`);
                } else {
                    setError('Une erreur est survenue lors du chargement de la fiche.');
                }
            } else {
                setError('Une erreur est survenue lors du chargement de la fiche.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction helper pour extraire les IDs d'un tableau de FilterOption
    const extractIds = (items: (FilterOption | string)[] | undefined): string[] => {
        if (!items) return [];
        return items.map(item => {
            if (typeof item === 'string') return item;
            return String(item.id) || '';
        }).filter(id => id !== '');
    };

    // Fonction helper pour extraire l'ID d'un FilterOption
    const extractId = (item: FilterOption | string | undefined): string => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return String(item.id) || '';
    };

    // Pré-remplir le formulaire avec les données existantes
    const prefillFormData = async (data: MobilierImageDetail | MonumentLieuDetail | PersonneMoraleDetail | PersonnePhysiqueDetail, countriesData: Country[], regionsData: Region[], departmentsData: Department[]) => {
        // Charger les fiches liées
        const linkedForms: { id: string; title: string; source: string; }[] = [];

        // Charger les fiches liées depuis les IDs (selon le type de fiche)
        if ('linked_monuments_places' in data && data.linked_monuments_places) {
            // Pour les mobiliers, on charge les monuments/lieux liés
            for (const id of data.linked_monuments_places) {
                try {
                    const detail = await apiService.getRecordDetail('monuments_lieux', String(id)) as MonumentLieuDetail;
                    linkedForms.push({
                        id: String(id),
                        title: detail.title,
                        source: 'monuments_lieux'
                    });
                } catch (error) {
                    console.error(`Erreur lors du chargement de la fiche monuments_lieux ${id}:`, error);
                }
            }
        }

        if ('linked_furniture_images' in data && data.linked_furniture_images) {
            // Pour les monuments et personnes morales, on charge les mobiliers/images liés
            for (const id of data.linked_furniture_images) {
                try {
                    const detail = await apiService.getRecordDetail('mobiliers_images', String(id)) as MobilierImageDetail;
                    linkedForms.push({
                        id: String(id),
                        title: detail.title,
                        source: 'mobiliers_images'
                    });
                } catch (error) {
                    console.error(`Erreur lors du chargement de la fiche mobiliers_images ${id}:`, error);
                }
            }
        }

        if ('linked_individuals' in data && data.linked_individuals) {
            // Pour les personnes morales, on charge les personnes physiques liées
            for (const id of data.linked_individuals) {
                try {
                    const detail = await apiService.getRecordDetail('personnes_physiques', String(id)) as PersonnePhysiqueDetail;
                    linkedForms.push({
                        id: String(id),
                        title: detail.firstname,
                        source: 'personnes_physiques'
                    });
                } catch (error) {
                    console.error(`Erreur lors du chargement de la fiche personnes_physiques ${id}:`, error);
                }
            }
        }

        if ('linked_legal_entities' in data && data.linked_legal_entities) {
            // Pour les personnes physiques, on charge les personnes morales liées
            for (const id of data.linked_legal_entities) {
                try {
                    const detail = await apiService.getRecordDetail('personnes_morales', String(id)) as PersonneMoraleDetail;
                    linkedForms.push({
                        id: String(id),
                        title: detail.title,
                        source: 'personnes_morales'
                    });
                } catch (error) {
                    console.error(`Erreur lors du chargement de la fiche personnes_morales ${id}:`, error);
                }
            }
        }

        // Pré-remplir la localisation
        // Note: les listes sont passées en paramètres pour éviter les problèmes de timing avec les states
        const countryId = extractId(data.country);
        const regionId = extractId(data.region);
        const departmentId = extractId(data.department);

        let selectedCountryObj = null;
        let selectedRegionObj = null;
        let selectedDepartmentObj = null;

        if (countryId) {
            const country = countriesData.find(c => String(c.id) === countryId);
            if (country) {
                setSelectedCountry(country);
                selectedCountryObj = country;
            }
        }

        if (regionId) {
            const region = regionsData.find(r => String(r.id) === regionId);
            if (region) {
                setSelectedRegion(region);
                selectedRegionObj = region;
                // Si on a une région mais pas de pays, définir le pays depuis la région
                if (!selectedCountryObj && region.pays) {
                    setSelectedCountry(region.pays);
                    selectedCountryObj = region.pays;
                }
            }
        }

        if (departmentId) {
            const department = departmentsData.find(d => String(d.id) === departmentId);
            if (department) {
                setSelectedDepartment(department);
                selectedDepartmentObj = department;
                // Si on a un département mais pas de région, définir la région depuis le département
                if (!selectedRegionObj && department.region) {
                    setSelectedRegion(department.region);
                    selectedRegionObj = department.region;
                }
                // Si on a un département mais pas de pays, définir le pays depuis le département
                if (!selectedCountryObj && department.region?.pays) {
                    setSelectedCountry(department.region.pays);
                    selectedCountryObj = department.region.pays;
                }
            }
        }

        if (data.city && typeof data.city === 'object' && 'id' in data.city && 'name' in data.city) {
            // Créer un objet Commune minimal à partir des données existantes et des objets trouvés
            const communeMinimal: Commune = {
                id: String(data.city.id),
                name: data.city.name,
                department: selectedDepartmentObj || {
                    id: departmentId || '',
                    name: '',
                    region: selectedRegionObj || {
                        id: regionId || '',
                        name: '',
                        pays: selectedCountryObj || {
                            id: countryId || '',
                            name: ''
                        }
                    }
                }
            };
            setSelectedCommune(communeMinimal);
        }

        // Extraire les contributors depuis la string séparée par des virgules
        let contributorsList: string[] = [];
        if (data.contributors && typeof data.contributors === 'string') {
            contributorsList = data.contributors.split(',').map(c => c.trim()).filter(c => c !== '');
        }

        // Extraire source depuis la string
        let sourceData = {
            type: '',
            author: '',
            title: '',
            url: '',
            details: ''
        };
        if (data.sources) {
            // La source peut être une string JSON ou un texte simple
            try {
                sourceData = JSON.parse(data.sources);
            } catch {
                // Si ce n'est pas du JSON, on met tout dans details
                sourceData.details = data.sources;
            }
        }

        // Préparer les données spécifiques selon le type
        const isMobilier = source == "mobiliers_images";
        const isMonument = source == "monuments_lieux";
        const isPersonneMorale = source == "personnes_morales"
        const isPersonnePhysique = source == "personnes_physiques"

        const formDataToSet: any = {
            name: ('firstname' in data ? data.firstname : data.title),
            centuries: extractIds(data.centuries),
            location: {
                commune: extractId(data.city),
                department: selectedDepartmentObj?.id ? String(selectedDepartmentObj.id) : extractId(data.department),
                region: selectedRegionObj?.id ? String(selectedRegionObj.id) : extractId(data.region),
                country: selectedCountryObj?.id ? String(selectedCountryObj.id) : extractId(data.country)
            },
            images: [],
            existingImages: data.medias?.map(m => ({id: m.id, title: m.title})) || [],
            imagesToDelete: [],
            themes: extractIds(data.themes),
            contributors: contributorsList,
            relatedForms: linkedForms,
            source: sourceData,
            bibliography: data.bibliography || ''
        };

        // Champs communs aux mobiliers, monuments et personnes morales
        if (!isPersonnePhysique) {
            formDataToSet.history = (data as MobilierImageDetail).history || '';
            formDataToSet.natures = extractIds((data as MobilierImageDetail).natures);
        }

        // Ajouter les champs spécifiques aux mobiliers et monuments (qui ont des conservation states, materials, etc.)
        if (isMobilier || isMonument) {
            formDataToSet.description = (data as MobilierImageDetail).description || '';
            formDataToSet.conservationStates = extractIds((data as any).conservation);
            formDataToSet.materials = extractIds((data as MobilierImageDetail).materials);
            formDataToSet.protected = (data as any).protected || false;
            formDataToSet.protectionComment = (data as any).protection_comment || '';
        }

        // Ajouter les champs spécifiques aux mobiliers
        if (isMobilier) {
            const mobilierData = data as MobilierImageDetail;
            formDataToSet.techniques = extractIds(mobilierData.techniques);
            formDataToSet.inscription = mobilierData.inscriptions || '';
            formDataToSet.currentLocation = mobilierData.conversation_place || '';
            formDataToSet.originalLocation = mobilierData.origin_place || '';
        }

        // Ajouter les champs spécifiques aux monuments
        if (isMonument) {
            const monumentData = data as MonumentLieuDetail;
            // Parse geolocalisation si présent
            if (monumentData.geolocalisation) {
                try {
                    const coords = JSON.parse(monumentData.geolocalisation);
                    formDataToSet.coordinates = {
                        latitude: coords.latitude || '',
                        longitude: coords.longitude || ''
                    };
                } catch {
                    formDataToSet.coordinates = {latitude: '', longitude: ''};
                }
            } else {
                formDataToSet.coordinates = {latitude: '', longitude: ''};
            }
        }

        // Ajouter les champs spécifiques aux personnes morales
        if (isPersonneMorale) {
            const personneMoraleData = data as PersonneMoraleDetail;
            formDataToSet.simpleMention = personneMoraleData.simple_mention || false;
            formDataToSet.foundationAct = personneMoraleData.foundation_deed || false;
            formDataToSet.statutesText = personneMoraleData.process || '';
            formDataToSet.functioningDescription = personneMoraleData.process || '';
            formDataToSet.socialParticipation = personneMoraleData.social_involvement || '';
            formDataToSet.relatedObjects = personneMoraleData.objects || '';
            formDataToSet.comment = personneMoraleData.comment || '';
        }

        // Ajouter les champs spécifiques aux personnes physiques
        if (isPersonnePhysique) {
            const personnePhysiqueData = data as PersonnePhysiqueDetail;
            formDataToSet.birthDate = personnePhysiqueData.birthdate || '';
            formDataToSet.deathDate = personnePhysiqueData.death || '';
            formDataToSet.attestation = personnePhysiqueData.attestation || '';
            formDataToSet.historicalPeriods = extractIds(personnePhysiqueData.historical_period);
            formDataToSet.professions = extractIds(personnePhysiqueData.professions);
            formDataToSet.biographicalElements = personnePhysiqueData.biographical_elements || '';
            formDataToSet.pilgrimage = personnePhysiqueData.pilgrimage_elements || '';
            formDataToSet.transportModes = extractIds(personnePhysiqueData.travels);
            formDataToSet.eventNature = personnePhysiqueData.event_nature || '';
            formDataToSet.comment = personnePhysiqueData.comment || '';
        }

        setFormData(formDataToSet);
        // Sauvegarder les données initiales pour détecter les changements
        setInitialFormData(JSON.parse(JSON.stringify(formDataToSet)));
    };

    // Gestion des changements de localisation
    const handleCountryChange = async (country: Country) => {
        setSelectedCountry(country);
        setSelectedRegion(null);
        setSelectedDepartment(null);
        setSelectedCommune(null);

        setFormData(prev => ({
            ...prev,
            location: {
                country: String(country.id),
                region: '',
                department: '',
                commune: ''
            }
        }));

        // Charger les régions du pays sélectionné
        try {
            const regionsData = await apiService.getRegions();
            setRegions(regionsData);
        } catch (error) {
            console.error('Erreur lors du chargement des régions:', error);
        }
    };

    const handleRegionChange = async (region: Region) => {
        setSelectedRegion(region);
        setSelectedDepartment(null);
        setSelectedCommune(null);

        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                region: String(region.id),
                department: '',
                commune: ''
            }
        }));

        // Charger les départements de la région
        try {
            const departmentsData = await apiService.getDepartments();
            setDepartments(departmentsData);
        } catch (error) {
            console.error('Erreur lors du chargement des départements:', error);
        }
    };

    const handleDepartmentChange = async (department: Department) => {
        setSelectedDepartment(department);
        setSelectedCommune(null);

        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                department: String(department.id),
                commune: ''
            }
        }));
    };

    const handleCommuneSelect = (commune: Commune) => {
        setSelectedCommune(commune);
        setCommuneQuery('');
        setShowCommuneResults(false);

        // Remplir automatiquement les niveaux supérieurs
        setSelectedDepartment(commune.department);
        setSelectedRegion(commune.department.region);
        setSelectedCountry(commune.department.region.pays);

        setFormData(prev => ({
            ...prev,
            location: {
                commune: String(commune.id),
                department: String(commune.department.id),
                region: String(commune.department.region.id),
                country: String(commune.department.region.pays.id)
            }
        }));
    };

    // Recherche de communes
    useEffect(() => {
        if (communeQuery.length >= 2) {
            searchCommunes(communeQuery);
        } else {
            setCommunes([]);
        }
    }, [communeQuery]);

    const searchCommunes = async (query: string) => {
        setIsSearchingCommunes(true);
        try {
            const results = await apiService.searchCommunes(query);
            setCommunes(results);
        } catch (error) {
            console.error('Erreur lors de la recherche de communes:', error);
        } finally {
            setIsSearchingCommunes(false);
        }
    };

    // Filtrage des régions et départements
    const getFilteredRegions = () => {
        // Si on a une région sélectionnée mais pas de pays, afficher quand même cette région
        if (!selectedCountry && selectedRegion) {
            return regions.filter(r => r.id === selectedRegion.id);
        }
        if (!selectedCountry) return [];
        return regions.filter(r => r.pays.id === selectedCountry.id);
    };

    const getFilteredDepartments = () => {
        // Si on a un département sélectionné mais pas de pays, afficher quand même ce département
        if (!selectedCountry && selectedDepartment) {
            return departments.filter(d => d.id === selectedDepartment.id);
        }
        if (!selectedCountry) return [];
        if (selectedRegion) {
            return departments.filter(d => d.region.id === selectedRegion.id);
        }
        return departments.filter(d => d.region.pays.id === selectedCountry.id);
    };

    // Gestion des contributeurs
    const addContributor = () => {
        if (newContributor.trim()) {
            setFormData(prev => ({
                ...prev,
                contributors: [...prev.contributors, newContributor.trim()]
            }));
            setNewContributor('');
        }
    };

    const removeContributor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contributors: prev.contributors.filter((_, i) => i !== index)
        }));
    };

    // Gestion des fiches liées
    const handleSelectFiche = (fiche: SearchItem) => {
        // Éviter les doublons
        const isAlreadySelected = formData.relatedForms.some(form => form.id === fiche.id);
        if (isAlreadySelected) {
            toast.info('Cette fiche est déjà ajoutée à la liste.');
            return;
        }

        // Ajouter la fiche à la liste
        const newRelatedForm = {
            id: fiche.id,
            title: fiche.title || 'Titre non disponible',
            source: fiche.source || 'unknown'
        };

        setFormData(prev => ({
            ...prev,
            relatedForms: [...prev.relatedForms, newRelatedForm]
        }));

        // Vider la recherche
        setFicheSearchQuery('');
        setShowFicheResults(false);
        setFicheSearchResults([]);
    };

    const removeRelatedForm = (index: number) => {
        setFormData(prev => ({
            ...prev,
            relatedForms: prev.relatedForms.filter((_, i) => i !== index)
        }));
    };

    // Mapper les catégories pour l'affichage
    const getCategoryDisplayName = (categoryId: string) => {
        switch (categoryId) {
            case 'monuments_lieux':
                return 'Monument ou lieu';
            case 'mobiliers_images':
                return 'Mobilier ou image';
            case 'personnes_morales':
                return 'Personne morale';
            case 'personnes_physiques':
                return 'Personne physique';
            default:
                return categoryId;
        }
    };

    // Gestion des images
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: ImageUpload[] = [];
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newImages.push({
                    file,
                    caption: '',
                    preview: reader.result as string
                });

                if (newImages.length === files.length) {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...newImages]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeExistingImage = (imageId: string) => {
        setFormData(prev => ({
            ...prev,
            existingImages: prev.existingImages.filter(img => img.id !== imageId),
            imagesToDelete: [...prev.imagesToDelete, imageId]
        }));
    };

    const updateImageCaption = (index: number, caption: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => i === index ? {...img, caption} : img)
        }));
    };

    // Gestion des champs
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({...prev, [field]: value}));
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}));
        }
    };

    const handleSourceChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            source: {...prev.source, [field]: value}
        }));
        if (errors[`source${field.charAt(0).toUpperCase()}${field.slice(1)}`]) {
            setErrors(prev => ({...prev, [`source${field.charAt(0).toUpperCase()}${field.slice(1)}`]: ''}));
        }
    };

    // Fonction pour vérifier si le formulaire a été modifié
    const hasFormChanged = (): boolean => {
        if (!initialFormData) return false;

        // Comparer les données de base
        if (formData.name !== initialFormData.name) return true;
        if (formData.description !== initialFormData.description) return true;
        if (formData.history !== initialFormData.history) return true;
        if (formData.bibliography !== initialFormData.bibliography) return true;
        if (formData.protected !== initialFormData.protected) return true;
        if (formData.protectionComment !== initialFormData.protectionComment) return true;
        if (formData.inscription !== initialFormData.inscription) return true;
        if (formData.currentLocation !== initialFormData.currentLocation) return true;
        if (formData.originalLocation !== initialFormData.originalLocation) return true;

        // Comparer les coordonnées
        if (formData.coordinates?.latitude !== initialFormData.coordinates?.latitude) return true;
        if (formData.coordinates?.longitude !== initialFormData.coordinates?.longitude) return true;

        // Comparer les champs spécifiques aux personnes morales
        if (formData.simpleMention !== initialFormData.simpleMention) return true;
        if (formData.foundationAct !== initialFormData.foundationAct) return true;
        if (formData.statutesText !== initialFormData.statutesText) return true;
        if (formData.functioningDescription !== initialFormData.functioningDescription) return true;
        if (formData.socialParticipation !== initialFormData.socialParticipation) return true;
        if (formData.relatedObjects !== initialFormData.relatedObjects) return true;
        if (formData.comment !== initialFormData.comment) return true;

        // Comparer les champs spécifiques aux personnes physiques
        if (formData.birthDate !== initialFormData.birthDate) return true;
        if (formData.deathDate !== initialFormData.deathDate) return true;
        if (formData.attestation !== initialFormData.attestation) return true;
        if (formData.biographicalElements !== initialFormData.biographicalElements) return true;
        if (formData.pilgrimage !== initialFormData.pilgrimage) return true;
        if (formData.eventNature !== initialFormData.eventNature) return true;
        if (formData.commutationVow !== initialFormData.commutationVow) return true;

        // Comparer la localisation
        if (formData.location.commune !== initialFormData.location.commune) return true;
        if (formData.location.department !== initialFormData.location.department) return true;
        if (formData.location.region !== initialFormData.location.region) return true;
        if (formData.location.country !== initialFormData.location.country) return true;

        // Comparer la source
        if (formData.source.type !== initialFormData.source.type) return true;
        if (formData.source.author !== initialFormData.source.author) return true;
        if (formData.source.title !== initialFormData.source.title) return true;
        if (formData.source.url !== initialFormData.source.url) return true;
        if (formData.source.details !== initialFormData.source.details) return true;

        // Comparer les tableaux triés
        const arraysEqual = (a: string[], b: string[]): boolean => {
            if (a.length !== b.length) return false;
            const sortedA = [...a].sort();
            const sortedB = [...b].sort();
            return sortedA.every((val, index) => val === sortedB[index]);
        };

        if (!arraysEqual(formData.centuries, initialFormData.centuries)) return true;
        if (!arraysEqual(formData.themes, initialFormData.themes)) return true;
        if (!arraysEqual(formData.contributors, initialFormData.contributors)) return true;
        if (!arraysEqual(formData.conservationStates || [], initialFormData.conservationStates || [])) return true;
        if (!arraysEqual(formData.materials || [], initialFormData.materials || [])) return true;
        if (!arraysEqual(formData.techniques || [], initialFormData.techniques || [])) return true;
        if (!arraysEqual(formData.natures || [], initialFormData.natures || [])) return true;
        if (!arraysEqual(formData.historicalPeriods || [], initialFormData.historicalPeriods || [])) return true;
        if (!arraysEqual(formData.professions || [], initialFormData.professions || [])) return true;
        if (!arraysEqual(formData.transportModes || [], initialFormData.transportModes || [])) return true;

        // Comparer les fiches liées
        if (formData.relatedForms.length !== initialFormData.relatedForms.length) return true;
        const sortedRelated = [...formData.relatedForms].sort((a, b) => a.id.localeCompare(b.id));
        const sortedInitialRelated = [...initialFormData.relatedForms].sort((a, b) => a.id.localeCompare(b.id));
        for (let i = 0; i < sortedRelated.length; i++) {
            if (sortedRelated[i].id !== sortedInitialRelated[i].id) return true;
        }

        // Vérifier s'il y a de nouvelles images
        if (formData.images.length > 0) return true;

        // Vérifier s'il y a des images supprimées
        if (formData.imagesToDelete.length > 0) return true;

        // Vérifier si les images existantes ont changé
        if (formData.existingImages.length !== initialFormData.existingImages.length) return true;

        return false;
    };

    // Validation et soumission
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Validation du titre (obligatoire pour les brouillons aussi)
        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Le titre est requis';
        }

        // Validation de la localisation (obligatoire)
        if (!formData.location.country && !formData.location.commune) {
            newErrors.commune = 'La localisation est requise (au moins un pays ou une commune)';
        }

        // Validation de la description (obligatoire pour mobiliers et monuments uniquement)
        if ((source === 'mobiliers_images' || source === 'monuments_lieux') &&
            (!formData.description || formData.description.trim() === '')) {
            newErrors.description = 'La description est requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();

        if (!isDraft && !validateForm()) {
            toast.error('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        if (isDraft) {
            setIsSavingDraft(true);
        } else {
            setIsSubmitting(true);
        }

        try {
            // Upload des nouvelles images si nécessaires
            let newMediaIds: number[] = [];
            if (formData.images.length > 0) {
                const uploadPromises = formData.images.map(img =>
                    apiService.uploadImage(img.file, img.caption)
                );
                newMediaIds = (await Promise.all(uploadPromises)).map(res => parseInt(res.id));
            }

            // Combiner les IDs des images existantes (non supprimées) avec les nouvelles
            const existingMediaIds = formData.existingImages
                .filter(img => !formData.imagesToDelete.includes(img.id))
                .map(img => parseInt(img.id));
            const allMediaIds = [...existingMediaIds, ...newMediaIds];

            // Extraire les fiches liées par type
            const linkedMonumentsLieux = formData.relatedForms
                .filter(form => form.source === 'monuments_lieux')
                .map(form => parseInt(form.id));
            const linkedMobiliersImages = formData.relatedForms
                .filter(form => form.source === 'mobiliers_images')
                .map(form => parseInt(form.id));
            const linkedPersMorales = formData.relatedForms
                .filter(form => form.source === 'personnes_morales')
                .map(form => parseInt(form.id));
            const linkedPersPhysiques = formData.relatedForms
                .filter(form => form.source === 'personnes_physiques')
                .map(form => parseInt(form.id));

            // Préparation de la source sous forme de chaîne formatée
            const sourceComponents = [];
            if (formData.source.type) sourceComponents.push(`Type: ${formData.source.type}`);
            if (formData.source.author) sourceComponents.push(`Auteur: ${formData.source.author}`);
            if (formData.source.title) sourceComponents.push(`Titre: ${formData.source.title}`);
            if (formData.source.url) sourceComponents.push(`URL: ${formData.source.url}`);
            if (formData.source.details) sourceComponents.push(`Détails: ${formData.source.details}`);
            const sourceInfo = sourceComponents.join(' | ') || undefined;

            // Préparation des données de soumission selon le type de fiche
            let submissionData: any = {
                title: formData.name,
                centuries: formData.centuries.map(c => parseInt(c)),
                medias: allMediaIds.length > 0 ? allMediaIds : undefined,
                city: selectedCommune == null ? undefined : parseInt(selectedCommune.id),
                department: selectedDepartment == null ? undefined : parseInt(selectedDepartment.id),
                region: selectedRegion == null ? undefined : parseInt(selectedRegion.id),
                country: selectedCountry?.id || undefined,
                themes: formData.themes.map(c => parseInt(c)),
                contributors: formData.contributors.length > 0 ? formData.contributors : undefined,
                source: sourceInfo,
                description: formData.description || '',
                history: formData.history || undefined,
                bibliography: formData.bibliography || undefined,
                draft: isDraft,
            };

            // Ajouter les champs spécifiques selon le type de fiche
            if (source === 'mobiliers_images') {
                submissionData = {
                    ...submissionData,
                    conservationStates: formData.conservationStates ? formData.conservationStates.map(c => parseInt(c)) : [],
                    inscription: formData.inscription || undefined,
                    isProtected: formData.protected || false,
                    protectionComment: formData.protectionComment || undefined,
                    materials: formData.materials ? formData.materials.map(c => parseInt(c)) : [],
                    techniques: formData.techniques ? formData.techniques.map(c => parseInt(c)) : [],
                    natures: formData.natures ? formData.natures.map(c => parseInt(c)) : [],
                    originPlace: formData.originalLocation,
                    presentPlace: formData.currentLocation,
                    linkedMonumentsLieux,
                    linkedPersMorales,
                    linkedPersPhysiques
                };

                await apiService.updateMobilierImage(recordId, submissionData);
            } else if (source === 'monuments_lieux') {
                submissionData = {
                    ...submissionData,
                    conservationStates: formData.conservationStates,
                    isProtected: formData.protected || false,
                    protectionComment: formData.protectionComment || undefined,
                    materials: formData.materials ? formData.materials.map(c => parseInt(c)) : [],
                    natures: formData.natures ? formData.natures.map(c => parseInt(c)) : [],
                    latitude: formData.coordinates?.latitude && formData.coordinates.latitude.trim() !== ''
                        ? formData.coordinates.latitude
                        : undefined,
                    longitude: formData.coordinates?.longitude && formData.coordinates.longitude.trim() !== ''
                        ? formData.coordinates.longitude
                        : undefined,
                    linkedMobiliersImages,
                    linkedPersMorales,
                    linkedPersPhysiques
                };

                await apiService.updateMonumentLieu(recordId, submissionData);
            } else if (source === 'personnes_morales') {
                submissionData = {
                    ...submissionData,
                    natures: formData.natures ? formData.natures.map(c => parseInt(c)) : [],
                    simple_mention: formData.simpleMention || false,
                    foundation_deed: formData.foundationAct || false,
                    status_Text: formData.statutesText || undefined,
                    functioning: formData.functioningDescription || undefined,
                    social_involvement: formData.socialParticipation || undefined,
                    linked_objects: formData.relatedObjects || undefined,
                    comment: formData.comment || undefined,
                    linkedMobiliersImages,
                    linkedMonumentsLieux,
                    linkedPersPhysiques
                };

                await apiService.updatePersonneMorale(recordId, submissionData);
            } else if (source === 'personnes_physiques') {
                submissionData = {
                    ...submissionData,
                    birthday: formData.birthDate || undefined,
                    death: formData.deathDate || undefined,
                    attestation: formData.attestation || undefined,
                    historical_periods: formData.historicalPeriods ? formData.historicalPeriods.map(c => parseInt(c)) : [],
                    professions: formData.professions ? formData.professions.map(c => parseInt(c)) : [],
                    biographical_elements: formData.biographicalElements || undefined,
                    pilgrimage_elements: formData.pilgrimage || undefined,
                    travels: formData.transportModes ? formData.transportModes.map(c => parseInt(c)) : [],
                    nature: formData.eventNature || undefined,
                    commutation: formData.commutationVow || undefined,
                    comment: formData.comment || undefined,
                    linkedMobiliersImages,
                    linkedMonumentsLieux,
                    linkedPersMorales
                };

                await apiService.updatePersonnePhysique(recordId, submissionData);
            }

            console.log('Données de modification:', submissionData);
            setWasSubmittedAsDraft(isDraft);
            setSubmissionSuccess(true);
            toast.success(isDraft ? 'Brouillon enregistré avec succès !' : 'Modification soumise avec succès !');

        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            if (error instanceof ApiError) {
                switch (error.status) {
                    case 401:
                        onSessionExpired();
                        break;
                    case 413:
                        toast.error(`Erreur: La taille des fichiers téléchargés dépasse la limite autorisée.`);
                        break;
                    default:
                        toast.error(`Erreur: ${error.message}`);
                        break;
                }
            } else {
                toast.error('Une erreur est survenue lors de la modification.');
            }
        } finally {
            setIsSubmitting(false);
            setIsSavingDraft(false);
        }
    };

    const handleSaveDraft = (e: React.FormEvent) => {
        handleSubmit(e, true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl text-muted-foreground">
                        Chargement du brouillon...
                    </h3>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl text-destructive mb-2">
                        {error || 'Brouillon non trouvé'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {error || `Aucun brouillon trouvé pour l'ID: ${recordId}`}
                    </p>
                    <Button onClick={onBack}>Retour</Button>
                </div>
            </div>
        );
    }

    if (submissionSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <Card
                            className={wasSubmittedAsDraft ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}>
                            <CardContent className="text-center py-12">
                                {wasSubmittedAsDraft ? (
                                    <>
                                        <FileText className="w-16 h-16 text-blue-500 mx-auto mb-6"/>
                                        <h2 className="text-2xl mb-4 text-blue-800">
                                            Brouillon enregistré avec succès !
                                        </h2>
                                        <p className="text-blue-700 mb-6 leading-relaxed">
                                            Votre brouillon a été sauvegardé. Vous pourrez le retrouver dans "Mes
                                            brouillons"
                                            et le compléter ou le soumettre plus tard.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-16 h-16 text-green-500 mx-auto mb-6"/>
                                        <h2 className="text-2xl mb-4 text-green-800">
                                            Modification soumise avec succès !
                                        </h2>
                                        <p className="text-green-700 mb-6 leading-relaxed">
                                            Votre modification a été enregistrée et sera examinée par notre équipe
                                            d'administrateurs.
                                            Vous recevrez une notification par email une fois la modification validée.
                                        </p>
                                    </>
                                )}
                                <Button onClick={onBack}
                                        className={wasSubmittedAsDraft ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}>
                                    Retour à mes brouillons
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Retour
                    </Button>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* En-tête */}
                        <div className="mb-6">
                            <h1 className="text-3xl mb-2">Modifier le brouillon</h1>
                            <p className="text-muted-foreground">
                                Vous pouvez modifier tous les champs, y compris le titre
                            </p>
                        </div>

                        {/* Titre éditable */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Titre de la fiche</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="title">
                                        {source === 'personnes_physiques' ? 'Prénom *' : 'Titre *'}
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={source === 'personnes_physiques' ? "Prénom de la personne" : "Titre de la fiche"}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations générales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations générales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Siècles */}
                                <div>
                                    <Label>Siècles</Label>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Sélectionnez les siècles concernés (optionnel)
                                    </p>
                                    {Array.isArray(centuries) && centuries.length > 0 ? (
                                        <SearchableMultiSelect
                                            options={centuries.filter(c => c && c.id && c.name).map(c => ({
                                                id: String(c.id),
                                                name: c.name
                                            }))}
                                            selectedValues={formData.centuries || []}
                                            onChange={(selected) => setFormData(prev => ({
                                                ...prev,
                                                centuries: selected
                                            }))}
                                            placeholder="Sélectionner des siècles"
                                            searchPlaceholder="Rechercher un siècle..."
                                            emptyMessage="Aucun siècle trouvé"
                                        />
                                    ) : (
                                        <div className="text-sm text-muted-foreground">
                                            Chargement des siècles...
                                        </div>
                                    )}
                                </div>

                                {/* Localisation */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground"/>
                                        <Label>Localisation *</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Renseignez au moins un pays ou une commune
                                    </p>

                                    <div className="space-y-4">
                                        {/* Pays */}
                                        <div>
                                            <Label className="text-sm">Pays</Label>
                                            <div className="mt-1">
                                                <SearchableSelect
                                                    options={countries.filter(c => c && c.id && c.name).map(c => ({
                                                        id: String(c.id),
                                                        name: c.name
                                                    }))}
                                                    selectedValue={selectedCountry?.id ? String(selectedCountry.id) : ''}
                                                    onChange={(countryId) => {
                                                        const country = countries.find(c => String(c.id) === countryId);
                                                        if (country) handleCountryChange(country);
                                                    }}
                                                    placeholder="Sélectionner un pays"
                                                    searchPlaceholder="Rechercher un pays..."
                                                    emptyMessage="Aucun pays trouvé"
                                                />
                                            </div>
                                        </div>

                                        {/* Régions */}
                                        <div>
                                            <Label className="text-sm">Région</Label>
                                            <div className="mt-1">
                                                <SearchableSelect
                                                    options={getFilteredRegions().map(r => ({
                                                        id: String(r.id),
                                                        name: r.name,
                                                        description: r.pays.name
                                                    }))}
                                                    selectedValue={selectedRegion?.id ? String(selectedRegion.id) : ''}
                                                    onChange={(regionId) => {
                                                        const region = regions.find(r => String(r.id) === regionId);
                                                        if (region) handleRegionChange(region);
                                                    }}
                                                    placeholder="Sélectionner une région"
                                                    searchPlaceholder="Rechercher une région..."
                                                    emptyMessage={!selectedCountry ? "Sélectionnez d'abord un pays" : "Aucune région trouvée"}
                                                    disabled={!selectedCountry && !selectedRegion}
                                                />
                                            </div>
                                        </div>

                                        {/* Départements */}
                                        <div>
                                            <Label className="text-sm">Département</Label>
                                            <div className="mt-1">
                                                <SearchableSelect
                                                    options={getFilteredDepartments().map(d => ({
                                                        id: String(d.id),
                                                        name: d.name,
                                                        description: `${d.region.name}, ${d.region.pays.name}`
                                                    }))}
                                                    selectedValue={selectedDepartment?.id ? String(selectedDepartment.id) : ''}
                                                    onChange={(departmentId) => {
                                                        const department = departments.find(d => String(d.id) === departmentId);
                                                        if (department) handleDepartmentChange(department);
                                                    }}
                                                    placeholder="Sélectionner un département"
                                                    searchPlaceholder="Rechercher un département..."
                                                    emptyMessage={!selectedCountry ? "Sélectionnez d'abord un pays" : "Aucun département trouvé"}
                                                    disabled={!selectedCountry && !selectedDepartment}
                                                />
                                            </div>
                                        </div>

                                        {/* Communes */}
                                        <div className="relative">
                                            <Label className="text-sm">Commune</Label>
                                            <div className="relative mt-1">
                                                <Search
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                                <Input
                                                    placeholder={selectedCommune ? selectedCommune.name : "Rechercher une commune..."}
                                                    value={selectedCommune ? selectedCommune.name : communeQuery}
                                                    onChange={(e) => {
                                                        if (selectedCommune) {
                                                            setSelectedCommune(null);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                location: {
                                                                    ...prev.location,
                                                                    commune: ''
                                                                }
                                                            }));
                                                        }
                                                        setCommuneQuery(e.target.value);
                                                        setShowCommuneResults(e.target.value.length >= 2);
                                                    }}
                                                    onFocus={() => {
                                                        if (!selectedCommune && communeQuery.length >= 2) {
                                                            setShowCommuneResults(true);
                                                        } else if (!selectedCommune) {
                                                            setCommuneQuery('');
                                                        }
                                                    }}
                                                    className={`pl-10 ${errors.commune ? 'border-destructive' : ''} ${selectedCommune ? 'bg-accent' : ''}`}
                                                />
                                            </div>

                                            {showCommuneResults && !selectedCommune && (
                                                <div
                                                    className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
                                                    {isSearchingCommunes && (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Recherche en cours...
                                                        </div>
                                                    )}
                                                    {!isSearchingCommunes && communes.length === 0 && communeQuery.length >= 2 && (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Aucune commune trouvée
                                                        </div>
                                                    )}
                                                    {!isSearchingCommunes && communes.map((commune) => (
                                                        <div
                                                            key={commune.id}
                                                            onClick={() => handleCommuneSelect(commune)}
                                                            className="p-2 hover:bg-accent rounded cursor-pointer"
                                                        >
                                                            <div>{commune.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {commune.department.name}, {commune.department.region.name}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {errors.commune &&
                                                <p className="text-destructive text-sm mt-1">{errors.commune}</p>}
                                        </div>

                                        {/* Affichage de la localisation sélectionnée */}
                                        {(selectedCommune || selectedDepartment || selectedRegion || selectedCountry) && (
                                            <div className="p-3 bg-accent rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm text-accent-foreground">
                                                            Localisation sélectionnée :
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {[
                                                                selectedCommune?.name,
                                                                selectedDepartment?.name,
                                                                selectedRegion?.name,
                                                                selectedCountry?.name
                                                            ].filter(Boolean).join(', ') || 'Aucune'}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCommune(null);
                                                            setSelectedCountry(null);
                                                            setSelectedRegion(null);
                                                            setSelectedDepartment(null);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                location: {
                                                                    commune: '',
                                                                    department: '',
                                                                    region: '',
                                                                    country: ''
                                                                }
                                                            }));
                                                            setCommuneQuery('');
                                                        }}
                                                        className="ml-2"
                                                    >
                                                        <X className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Images */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground"/>
                                        <Label>Images</Label>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Images existantes */}
                                        {formData.existingImages.length > 0 && (
                                            <div>
                                                <Label className="text-sm">Images existantes</Label>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Les légendes des images existantes ne peuvent pas être modifiées
                                                </p>
                                                <div className="space-y-3">
                                                    {formData.existingImages.map((image) => (
                                                        <div key={image.id}
                                                             className="border rounded-lg p-4 bg-muted/30">
                                                            <div className="flex gap-4">
                                                                <ImageWithFallback
                                                                    src={getMediaImageUrl(image.id)}
                                                                    alt={image.title || 'Image'}
                                                                    className="w-32 h-32 object-cover rounded"
                                                                />
                                                                <div
                                                                    className="flex-1 flex items-center justify-between">
                                                                    <div>
                                                                        <div className="text-sm">Légende :</div>
                                                                        <div
                                                                            className="text-sm text-muted-foreground mt-1">
                                                                            {image.title || 'Sans légende'}
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeExistingImage(image.id)}
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="w-4 h-4"/>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Nouvelles images */}
                                        <div>
                                            <Label className="text-sm">Ajouter de nouvelles images</Label>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Vous pouvez ajouter de nouvelles images
                                            </p>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="cursor-pointer mb-4"
                                            />

                                            {formData.images.length > 0 && (
                                                <div className="space-y-4">
                                                    {formData.images.map((image, index) => (
                                                        <div key={index} className="border rounded-lg p-4">
                                                            <div className="flex gap-4">
                                                                <img
                                                                    src={image.preview}
                                                                    alt={`Upload ${index + 1}`}
                                                                    className="w-32 h-32 object-cover rounded"
                                                                />
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <span
                                                                            className="text-sm">{image.file.name}</span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeImage(index)}
                                                                            className="text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="w-4 h-4"/>
                                                                        </Button>
                                                                    </div>

                                                                    <div>
                                                                        <Label htmlFor={`caption-${index}`}
                                                                               className="text-xs">
                                                                            Légende
                                                                        </Label>
                                                                        <Textarea
                                                                            id={`caption-${index}`}
                                                                            value={image.caption}
                                                                            onChange={(e) => updateImageCaption(index, e.target.value)}
                                                                            placeholder="Décrivez ce que montre l'image..."
                                                                            rows={2}
                                                                            className="mt-1"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Thèmes */}
                                <div>
                                    <Label>Thèmes</Label>
                                    {Array.isArray(themes) && themes.length > 0 ? (
                                        <SearchableMultiSelect
                                            options={themes.filter(t => t && t.id && t.name).map(t => ({
                                                id: String(t.id),
                                                name: t.name
                                            }))}
                                            selectedValues={formData.themes || []}
                                            onChange={(selected) => setFormData(prev => ({...prev, themes: selected}))}
                                            placeholder="Sélectionner des thèmes"
                                            searchPlaceholder="Rechercher un thème..."
                                            emptyMessage="Aucun thème trouvé"
                                        />
                                    ) : (
                                        <div className="text-sm text-muted-foreground mt-2">
                                            Chargement des thèmes...
                                        </div>
                                    )}
                                </div>

                                {/* Contributeurs */}
                                <div>
                                    <Label>Contributeurs</Label>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Personnes ayant contribué à cette fiche (en plus de vous)
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nom du contributeur"
                                                value={newContributor}
                                                onChange={(e) => setNewContributor(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContributor())}
                                            />
                                            <Button type="button" onClick={addContributor} size="sm">
                                                <Plus className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                        {formData.contributors.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {formData.contributors.map((contributor, index) => (
                                                    <Badge key={index} variant="secondary"
                                                           className="flex items-center gap-2">
                                                        {contributor}
                                                        <X
                                                            className="w-3 h-3 cursor-pointer"
                                                            onClick={() => removeContributor(index)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Source */}
                                <div>
                                    <Label>Source de l'information</Label>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Informations optionnelles sur la source
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <Label htmlFor="sourceType" className="text-sm">Type de source</Label>
                                            <Select
                                                value={formData.source.type}
                                                onValueChange={(value) => handleSourceChange('type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.isArray(sourceTypes) && sourceTypes.filter(type => type).map((type) => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="sourceAuthor" className="text-sm">Auteur</Label>
                                            <Input
                                                id="sourceAuthor"
                                                value={formData.source.author}
                                                onChange={(e) => handleSourceChange('author', e.target.value)}
                                                placeholder="Nom de l'auteur"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sourceTitle" className="text-sm">Titre</Label>
                                            <Input
                                                id="sourceTitle"
                                                value={formData.source.title}
                                                onChange={(e) => handleSourceChange('title', e.target.value)}
                                                placeholder="Titre de la source"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sourceUrl" className="text-sm">URL/Référence</Label>
                                            <Input
                                                id="sourceUrl"
                                                value={formData.source.url}
                                                onChange={(e) => handleSourceChange('url', e.target.value)}
                                                placeholder="Lien web ou référence"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="sourceDetails" className="text-sm">Détails</Label>
                                            <Textarea
                                                id="sourceDetails"
                                                value={formData.source.details}
                                                onChange={(e) => handleSourceChange('details', e.target.value)}
                                                placeholder="Chapitre, page, ligne, etc."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations spécifiques */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations spécifiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Types d'éléments - pas pour personnes physiques */}
                                {source !== 'personnes_physiques' && (
                                    <div>
                                        <Label>
                                            {source === 'mobiliers_images' ? 'Types de mobilier' :
                                                source === 'monuments_lieux' ? 'Types de monument' :
                                                    'Types de personne morale'}
                                        </Label>
                                        {source === 'mobiliers_images' && Array.isArray(furnituresNatures) && furnituresNatures.length > 0 ? (
                                            <SearchableMultiSelect
                                                options={furnituresNatures.filter(n => n && n.id && n.name).map(n => ({
                                                    id: String(n.id),
                                                    name: n.name
                                                }))}
                                                selectedValues={formData.natures || []}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    natures: selected
                                                }))}
                                                placeholder="Sélectionner des types"
                                                searchPlaceholder="Rechercher un type..."
                                                emptyMessage="Aucun type trouvé"
                                            />
                                        ) : source === 'monuments_lieux' && Array.isArray(buildingNatures) && buildingNatures.length > 0 ? (
                                            <SearchableMultiSelect
                                                options={buildingNatures.filter(n => n && n.id && n.name).map(n => ({
                                                    id: String(n.id),
                                                    name: n.name
                                                }))}
                                                selectedValues={formData.natures || []}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    natures: selected
                                                }))}
                                                placeholder="Sélectionner des types"
                                                searchPlaceholder="Rechercher un type..."
                                                emptyMessage="Aucun type trouvé"
                                            />
                                        ) : source === 'personnes_morales' && Array.isArray(legalEntityNatures) && legalEntityNatures.length > 0 ? (
                                            <SearchableMultiSelect
                                                options={legalEntityNatures.filter(n => n && n.id && n.name).map(n => ({
                                                    id: String(n.id),
                                                    name: n.name
                                                }))}
                                                selectedValues={formData.natures || []}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    natures: selected
                                                }))}
                                                placeholder="Sélectionner des types"
                                                searchPlaceholder="Rechercher un type..."
                                                emptyMessage="Aucun type trouvé"
                                            />
                                        ) : (
                                            <div className="text-sm text-muted-foreground mt-2">
                                                Chargement des options...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description - pour mobiliers et monuments uniquement */}
                                {(source === 'mobiliers_images' || source === 'monuments_lieux') && (
                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description || ''}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Description détaillée de l'objet"
                                            rows={4}
                                            className={errors.description ? 'border-destructive' : ''}
                                        />
                                        {errors.description &&
                                            <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                                    </div>
                                )}

                                {/* Histoire - pas pour personnes physiques */}
                                {source !== 'personnes_physiques' && (
                                    <div>
                                        <Label htmlFor="history">Histoire</Label>
                                        <Textarea
                                            id="history"
                                            value={formData.history || ''}
                                            onChange={(e) => handleInputChange('history', e.target.value)}
                                            placeholder="Histoire de l'objet"
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Champs spécifiques aux mobiliers */}
                                {source === 'mobiliers_images' && (
                                    <>
                                        {/* Inscriptions */}
                                        <div>
                                            <Label htmlFor="inscription">Inscriptions</Label>
                                            <Textarea
                                                id="inscription"
                                                value={formData.inscription || ''}
                                                onChange={(e) => handleInputChange('inscription', e.target.value)}
                                                placeholder="Inscriptions présentes sur l'objet"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Emplacement actuel */}
                                        <div>
                                            <Label htmlFor="currentLocation">Emplacement actuel</Label>
                                            <Input
                                                id="currentLocation"
                                                value={formData.currentLocation || ''}
                                                onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                                                placeholder="Où se trouve actuellement l'objet"
                                            />
                                        </div>

                                        {/* Emplacement d'origine */}
                                        <div>
                                            <Label htmlFor="originalLocation">Emplacement d'origine</Label>
                                            <Input
                                                id="originalLocation"
                                                value={formData.originalLocation || ''}
                                                onChange={(e) => handleInputChange('originalLocation', e.target.value)}
                                                placeholder="Emplacement d'origine de l'objet"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Champs spécifiques aux monuments */}
                                {source === 'monuments_lieux' && (
                                    <div>
                                        <Label>Géolocalisation</Label>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Coordonnées GPS du monument (optionnel)
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                                                <Input
                                                    id="latitude"
                                                    value={formData.coordinates?.latitude || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        coordinates: {
                                                            latitude: e.target.value,
                                                            longitude: prev.coordinates?.longitude || ''
                                                        }
                                                    }))}
                                                    placeholder="Ex: 48.8566"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                                                <Input
                                                    id="longitude"
                                                    value={formData.coordinates?.longitude || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        coordinates: {
                                                            latitude: prev.coordinates?.latitude || '',
                                                            longitude: e.target.value
                                                        }
                                                    }))}
                                                    placeholder="Ex: 2.3522"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Champs spécifiques aux personnes morales */}
                                {source === 'personnes_morales' && (
                                    <>
                                        {/* Simple mention et acte de fondation */}
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="simpleMention"
                                                    checked={formData.simpleMention || false}
                                                    onCheckedChange={(checked) => handleInputChange('simpleMention', checked)}
                                                />
                                                <Label htmlFor="simpleMention" className="text-sm">Simple
                                                    mention</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="foundationAct"
                                                    checked={formData.foundationAct || false}
                                                    onCheckedChange={(checked) => handleInputChange('foundationAct', checked)}
                                                />
                                                <Label htmlFor="foundationAct" className="text-sm">Acte de
                                                    fondation</Label>
                                            </div>
                                        </div>

                                        {/* Texte des statuts */}
                                        <div>
                                            <Label htmlFor="statutesText">Texte des statuts</Label>
                                            <Textarea
                                                id="statutesText"
                                                value={formData.statutesText || ''}
                                                onChange={(e) => handleInputChange('statutesText', e.target.value)}
                                                placeholder="Texte des statuts de la personne morale"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Description du fonctionnement */}
                                        <div>
                                            <Label htmlFor="functioningDescription">Description du
                                                fonctionnement</Label>
                                            <Textarea
                                                id="functioningDescription"
                                                value={formData.functioningDescription || ''}
                                                onChange={(e) => handleInputChange('functioningDescription', e.target.value)}
                                                placeholder="Comment fonctionne cette personne morale"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Participation sociale */}
                                        <div>
                                            <Label htmlFor="socialParticipation">Participation sociale</Label>
                                            <Textarea
                                                id="socialParticipation"
                                                value={formData.socialParticipation || ''}
                                                onChange={(e) => handleInputChange('socialParticipation', e.target.value)}
                                                placeholder="Implication et participation sociale"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Objets liés */}
                                        <div>
                                            <Label htmlFor="relatedObjects">Objets liés</Label>
                                            <Textarea
                                                id="relatedObjects"
                                                value={formData.relatedObjects || ''}
                                                onChange={(e) => handleInputChange('relatedObjects', e.target.value)}
                                                placeholder="Objets et artefacts liés à cette personne morale"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Commentaire */}
                                        <div>
                                            <Label htmlFor="comment">Commentaire</Label>
                                            <Textarea
                                                id="comment"
                                                value={formData.comment || ''}
                                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                                placeholder="Commentaires additionnels"
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Champs spécifiques aux personnes physiques */}
                                {source === 'personnes_physiques' && (
                                    <>
                                        {/* Dates de naissance et décès */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="birthDate">Date de naissance</Label>
                                                <Input
                                                    id="birthDate"
                                                    type="date"
                                                    value={formData.birthDate || ''}
                                                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="deathDate">Date de décès</Label>
                                                <Input
                                                    id="deathDate"
                                                    type="date"
                                                    value={formData.deathDate || ''}
                                                    onChange={(e) => handleInputChange('deathDate', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Attestation */}
                                        <div>
                                            <Label htmlFor="attestation">Attestation</Label>
                                            <Textarea
                                                id="attestation"
                                                value={formData.attestation || ''}
                                                onChange={(e) => handleInputChange('attestation', e.target.value)}
                                                placeholder="Attestation ou preuves documentaires"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Périodes historiques */}
                                        <div>
                                            <Label>Périodes historiques</Label>
                                            {Array.isArray(historicalPeriods) && historicalPeriods.length > 0 ? (
                                                <SearchableMultiSelect
                                                    options={historicalPeriods.filter(h => h && h.id && h.name).map(h => ({
                                                        id: String(h.id),
                                                        name: h.name
                                                    }))}
                                                    selectedValues={formData.historicalPeriods || []}
                                                    onChange={(selected) => setFormData(prev => ({
                                                        ...prev,
                                                        historicalPeriods: selected
                                                    }))}
                                                    placeholder="Sélectionner des périodes"
                                                    searchPlaceholder="Rechercher une période..."
                                                    emptyMessage="Aucune période trouvée"
                                                />
                                            ) : (
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    Chargement des options...
                                                </div>
                                            )}
                                        </div>

                                        {/* Professions */}
                                        <div>
                                            <Label>Professions</Label>
                                            {Array.isArray(professions) && professions.length > 0 ? (
                                                <SearchableMultiSelect
                                                    options={professions.filter(p => p && p.id && p.name).map(p => ({
                                                        id: String(p.id),
                                                        name: p.name
                                                    }))}
                                                    selectedValues={formData.professions || []}
                                                    onChange={(selected) => setFormData(prev => ({
                                                        ...prev,
                                                        professions: selected
                                                    }))}
                                                    placeholder="Sélectionner des professions"
                                                    searchPlaceholder="Rechercher une profession..."
                                                    emptyMessage="Aucune profession trouvée"
                                                />
                                            ) : (
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    Chargement des options...
                                                </div>
                                            )}
                                        </div>

                                        {/* Éléments biographiques */}
                                        <div>
                                            <Label htmlFor="biographicalElements">Éléments biographiques</Label>
                                            <Textarea
                                                id="biographicalElements"
                                                value={formData.biographicalElements || ''}
                                                onChange={(e) => handleInputChange('biographicalElements', e.target.value)}
                                                placeholder="Éléments biographiques de la personne"
                                                rows={4}
                                            />
                                        </div>

                                        {/* Éléments de pèlerinage */}
                                        <div>
                                            <Label htmlFor="pilgrimage">Éléments de pèlerinage</Label>
                                            <Textarea
                                                id="pilgrimage"
                                                value={formData.pilgrimage || ''}
                                                onChange={(e) => handleInputChange('pilgrimage', e.target.value)}
                                                placeholder="Informations sur les pèlerinages effectués"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Modes de transport */}
                                        <div>
                                            <Label>Modes de transport</Label>
                                            {Array.isArray(travels) && travels.length > 0 ? (
                                                <SearchableMultiSelect
                                                    options={travels.filter(t => t && t.id && t.name).map(t => ({
                                                        id: String(t.id),
                                                        name: t.name
                                                    }))}
                                                    selectedValues={formData.transportModes || []}
                                                    onChange={(selected) => setFormData(prev => ({
                                                        ...prev,
                                                        transportModes: selected
                                                    }))}
                                                    placeholder="Sélectionner des modes de transport"
                                                    searchPlaceholder="Rechercher un mode..."
                                                    emptyMessage="Aucun mode trouvé"
                                                />
                                            ) : (
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    Chargement des options...
                                                </div>
                                            )}
                                        </div>

                                        {/* Nature de l'événement */}
                                        <div>
                                            <Label htmlFor="eventNature">Nature de l'événement</Label>
                                            <Input
                                                id="eventNature"
                                                value={formData.eventNature || ''}
                                                onChange={(e) => handleInputChange('eventNature', e.target.value)}
                                                placeholder="Nature de l'événement associé"
                                            />
                                        </div>

                                        {/* Commutation de vœu */}
                                        <div>
                                            <Label htmlFor="commutationVow">Commutation de vœu</Label>
                                            <Textarea
                                                id="commutationVow"
                                                value={formData.commutationVow || ''}
                                                onChange={(e) => handleInputChange('commutationVow', e.target.value)}
                                                placeholder="Informations sur la commutation de vœu"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Commentaire */}
                                        <div>
                                            <Label htmlFor="comment">Commentaire</Label>
                                            <Textarea
                                                id="comment"
                                                value={formData.comment || ''}
                                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                                placeholder="Commentaires additionnels"
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* États de conservation - pour mobiliers et monuments uniquement */}
                                {(source === 'mobiliers_images' || source === 'monuments_lieux') && (
                                    <div>
                                        <Label>États de conservation</Label>
                                        {Array.isArray(conservationStates) && conservationStates.length > 0 ? (
                                            <SearchableMultiSelect
                                                options={conservationStates.filter(c => c && c.id && c.name).map(c => ({
                                                    id: String(c.id),
                                                    name: c.name
                                                }))}
                                                selectedValues={formData.conservationStates || []}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    conservationStates: selected
                                                }))}
                                                placeholder="Sélectionner des états"
                                                searchPlaceholder="Rechercher un état..."
                                                emptyMessage="Aucun état trouvé"
                                            />
                                        ) : (
                                            <div className="text-sm text-muted-foreground mt-2">
                                                Chargement des options...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Matériaux - pour mobiliers et monuments uniquement */}
                                {(source === 'mobiliers_images' || source === 'monuments_lieux') && (
                                    <div>
                                        <Label>Matériaux</Label>
                                        {Array.isArray(materials) && materials.length > 0 ? (
                                            <SearchableMultiSelect
                                                options={materials.filter(m => m && m.id && m.name).map(m => ({
                                                    id: String(m.id),
                                                    name: m.name
                                                }))}
                                                selectedValues={formData.materials || []}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    materials: selected
                                                }))}
                                                placeholder="Sélectionner des matériaux"
                                                searchPlaceholder="Rechercher un matériau..."
                                                emptyMessage="Aucun matériau trouvé"
                                            />
                                        ) : (
                                            <div className="text-sm text-muted-foreground mt-2">
                                                Chargement des options...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Techniques - uniquement pour mobiliers */}
                                {source === 'mobiliers_images' && (
                                    <div>
                                        <Label>Techniques</Label>
                                        {Array.isArray(furnituresTechniques) && furnituresTechniques.length > 0 ? (
                                            <SearchableMultiSelect
                                                options={furnituresTechniques.filter(t => t && t.id && t.name).map(t => ({
                                                    id: t.id,
                                                    name: t.name
                                                }))}
                                                selectedValues={formData.techniques || []}
                                                onChange={(selected) => setFormData(prev => ({
                                                    ...prev,
                                                    techniques: selected
                                                }))}
                                                placeholder="Sélectionner des techniques"
                                                searchPlaceholder="Rechercher une technique..."
                                                emptyMessage="Aucune technique trouvée"
                                            />
                                        ) : (
                                            <div className="text-sm text-muted-foreground mt-2">
                                                Chargement des options...
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Protection - pour mobiliers et monuments uniquement */}
                                {(source === 'mobiliers_images' || source === 'monuments_lieux') && (
                                    <div>
                                        <Label>Protection</Label>
                                        <div className="space-y-4 mt-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="protected"
                                                    checked={formData.protected || false}
                                                    onCheckedChange={(checked) => handleInputChange('protected', checked)}
                                                />
                                                <Label htmlFor="protected" className="text-sm">Objet protégé</Label>
                                            </div>

                                            <div>
                                                <Label htmlFor="protectionComment" className="text-sm">Commentaire de
                                                    protection</Label>
                                                <Textarea
                                                    id="protectionComment"
                                                    value={formData.protectionComment || ''}
                                                    onChange={(e) => handleInputChange('protectionComment', e.target.value)}
                                                    placeholder="Détails sur la protection..."
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bibliographie */}
                                <div>
                                    <Label htmlFor="bibliography">Bibliographie</Label>
                                    <Textarea
                                        id="bibliography"
                                        value={formData.bibliography || ''}
                                        onChange={(e) => handleInputChange('bibliography', e.target.value)}
                                        placeholder="Informations sur la bibliographie"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fiches liées */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Fiches liées</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label>Rechercher des fiches à lier</Label>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Recherchez et sélectionnez des fiches existantes à associer à cette fiche
                                    </p>

                                    {/* Barre de recherche avec autocomplétion */}
                                    <div className="relative">
                                        <div className="relative">
                                            <Search
                                                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                                            <Input
                                                value={ficheSearchQuery}
                                                onChange={(e) => {
                                                    setFicheSearchQuery(e.target.value);
                                                    setShowFicheResults(e.target.value.length >= 2);
                                                }}
                                                onFocus={() => setShowFicheResults(ficheSearchQuery.length >= 2)}
                                                onBlur={() => setTimeout(() => setShowFicheResults(false), 200)}
                                                placeholder="Tapez au moins 2 caractères pour rechercher..."
                                                className="pl-10"
                                            />
                                        </div>

                                        {/* Résultats de recherche */}
                                        {showFicheResults && (
                                            <div
                                                className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
                                                {isSearchingFiches && (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        <Search className="w-4 h-4 mx-auto mb-2 animate-spin"/>
                                                        Recherche en cours...
                                                    </div>
                                                )}
                                                {!isSearchingFiches && ficheSearchResults.length === 0 && ficheSearchQuery.length >= 2 && (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        Aucune fiche trouvée
                                                    </div>
                                                )}
                                                {!isSearchingFiches && ficheSearchResults.length > 0 && (
                                                    <>
                                                        {ficheSearchResults.map((fiche, index) => (
                                                            <div
                                                                key={`${fiche.id}-${index}`}
                                                                onClick={() => handleSelectFiche(fiche)}
                                                                className="p-3 hover:bg-accent rounded cursor-pointer border-b border-border last:border-b-0"
                                                            >
                                                                <div
                                                                    className="font-medium">{fiche.title || 'Titre non disponible'}</div>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {getCategoryDisplayName(fiche.source)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Liste des fiches liées sélectionnées */}
                                {formData.relatedForms.length > 0 && (
                                    <div>
                                        <Label>Fiches sélectionnées ({formData.relatedForms.length})</Label>
                                        <div className="mt-3 space-y-2">
                                            {formData.relatedForms.map((form, index) => (
                                                <div
                                                    key={`${form.id}-${index}`}
                                                    className="flex items-center justify-between p-3 bg-accent rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Link className="w-4 h-4 text-muted-foreground"/>
                                                        <div>
                                                            <div className="font-medium">{form.title}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {getCategoryDisplayName(form.source)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRelatedForm(index)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Boutons d'action */}
                        <div className="space-y-3">
                            {!hasFormChanged() && (
                                <div
                                    className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                                    <p>
                                        Aucune modification n'a été détectée. Veuillez modifier au moins un champ pour
                                        soumettre vos changements.
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onBack}
                                    disabled={isSubmitting || isSavingDraft}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSaveDraft}
                                    disabled={isSubmitting || isSavingDraft || !hasFormChanged()}
                                    className="gap-2"
                                >
                                    {isSavingDraft ? (
                                        <>
                                            <div
                                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4"/>
                                            Enregistrer comme brouillon
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isSavingDraft || !hasFormChanged()}
                                    className="gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4"/>
                                            Soumettre pour validation
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
