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
    FileText, CheckCircle,
} from "lucide-react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Textarea} from "./ui/textarea";
import {Checkbox} from "./ui/checkbox";
import {Badge} from "./ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {toast} from "sonner";
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
import {InfoTooltip} from "./InfoTooltip.tsx";
import {tooltipTexts} from "../constants/tooltipTexts.ts";
import {User} from "../App";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "./ui/dialog.tsx";
import {RichTextEditor} from "./RichTextEditor.tsx";

interface EditDraftPageProps {
    user: User;
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
    parent_id?: number;
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
    source: string;
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
    temoinComment?: string;
}

export function EditDraftPage({user, recordId, source, onBack, onSessionExpired}: EditDraftPageProps) {
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
        source: '',
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

    // États pour le modal de contact admin
    const [showContactAdminModal, setShowContactAdminModal] = useState(false);
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);
    const [contactSent, setContactSent] = useState(false);

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

        if (data.city && typeof data.city === 'object' && 'id' in data.city && 'name' in data.city && data.city.id && data.city.name) {
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
            source: data.sources,
            bibliography: data.bibliography || '',
            parent_id: data.parent_id || undefined,
            temoinComment: data.temoinComment || '',
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
            formDataToSet.currentLocation = mobilierData.conservation_place || '';
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

    const popupContactAdmin = () => {
        setShowContactAdminModal(true);
        setContactSent(false);
        setContactSubject('');
        setContactMessage('');
    };

    const handleSendContactMessage = async () => {
        if (!contactSubject.trim() || !contactMessage.trim()) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setIsSubmittingContact(true);

        try {
            await apiService.postContact(contactSubject, contactMessage, user.email);
            setContactSent(true);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        } finally {
            setIsSubmittingContact(false);
        }
    };

    const handleCloseContactModal = () => {
        setShowContactAdminModal(false);
        setContactSent(false);
        setContactSubject('');
        setContactMessage('');
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

        const fileArray = Array.from(files);
        const MAX_SIZE = 1 * 1024 * 1024; // 1MB en bytes
        const oversizedFiles: string[] = [];
        const validFiles: File[] = [];

        // Séparer les fichiers valides des fichiers trop grands
        fileArray.forEach((file) => {
            if (file.size > MAX_SIZE) {
                oversizedFiles.push(file.name);
            } else {
                validFiles.push(file);
            }
        });

        // Alerter l'utilisateur si certains fichiers sont trop grands
        if (oversizedFiles.length > 0) {
            toast.error(
                `${oversizedFiles.length} image(s) dépassent 1MB : ${oversizedFiles.join(', ')}`,
                { duration: 6000 }
            );
        }

        // Traiter uniquement les fichiers valides
        if (validFiles.length > 0) {
            const newImages: ImageUpload[] = [];
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push({
                        file,
                        caption: '',
                        preview: reader.result as string
                    });

                    if (newImages.length === validFiles.length) {
                        setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, ...newImages]
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
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
        if (formData.source !== initialFormData.source) return true;

        // Comparer le commentaire témoin
        if (formData.temoinComment !== initialFormData.temoinComment) return true;

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

        // Validation de la localisation (tous les champs obligatoires)
        let locationError :string[] = [];
        if (!formData.location.country) {
            locationError.push('le pays');
        }
        if (!formData.location.region) {
            locationError.push('la région');
        }
        if (!formData.location.department) {
            locationError.push('le département');
        }
        if (!formData.location.commune) {
            locationError.push('la commune');
        }

        if (locationError.length > 0) {
            if (locationError.length > 1) {
                locationError[locationError.length -1] = 'et ' + locationError[locationError.length -1];
                newErrors.commune = 'La localisation est incomplète : ' + locationError.join(', ') + ' sont requis.';
            } else {
                newErrors.commune = 'La localisation est incomplète : ' + locationError[0] + ' est requis.';
            }
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
                source: formData.source,
                description: formData.description || '',
                history: formData.history || undefined,
                bibliography: formData.bibliography || undefined,
                draft: isDraft,
                temoinComment: formData.temoinComment || undefined,
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

    const handleDeleteDraft = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce brouillon ?')) {
            return;
        }

        try {
            await apiService.deleteDraft(source, recordId);
            toast.success('Brouillon supprimé avec succès');
            onBack();
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                onSessionExpired();
            } else {
                toast.error('Erreur lors de la suppression du brouillon');
            }
        }
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

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                                e.preventDefault();
                            }
                        }}
                    >
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
                                    <Label className="flex items-center gap-1" htmlFor="title">
                                        {source === 'personnes_physiques' ? 'Prénom *' : 'Titre *'}
                                        <InfoTooltip content={tooltipTexts.common.name} />
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
                                    <Label className="flex items-center gap-1">
                                        Siècles
                                        <InfoTooltip content={tooltipTexts.common.centuries} />
                                    </Label>
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
                                        <Label className="flex items-center gap-1">
                                            Localisation *
                                            <InfoTooltip content={tooltipTexts.location.title} />
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        La localisation complète est requise. <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            popupContactAdmin();
                                        }}
                                        className="text-xs px-0 h-auto"
                                    >Des informations sont manquantes? Faites le nous savoir !
                                    </Button>
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
                                        <InfoTooltip content={tooltipTexts.common.images} />
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
                                                                            placeholder="Taper votre légende ici"
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
                                    <Label className="flex items-center gap-1">
                                        Thèmes
                                        <InfoTooltip content={tooltipTexts.common.themes} />
                                    </Label>
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
                                    <Label className="flex items-center gap-1">
                                        Contributeurs
                                        <InfoTooltip content={tooltipTexts.common.contributors} />
                                    </Label>
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
                                    <RichTextEditor
                                        value={formData.source || ''}
                                        onChange={(value) => handleInputChange('source', value)}
                                        label={
                                            <span className="flex items-center gap-1">
                                                                Source de l'information
                                                                <InfoTooltip content={tooltipTexts.source.title}/>
                                                            </span>
                                        }
                                        placeholder="Source de l'information"
                                        required={false}
                                        minHeight="150px"
                                        className={errors.description ? 'border-destructive' : ''}
                                    />
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
                                        <Label className="flex items-center gap-1">
                                            {source === 'mobiliers_images' ? 'Types de mobilier' :
                                                source === 'monuments_lieux' ? 'Types de monument' :
                                                    'Types de personne morale'}
                                            <InfoTooltip content={tooltipTexts.common.natures} />
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
                                        <RichTextEditor
                                            value={formData.description || ''}
                                            onChange={(value) => handleInputChange('description', value)}
                                            label={
                                                <span className="flex items-center gap-1">
                                                    Description
                                                    <InfoTooltip content={tooltipTexts.common.description} />
                                                </span>
                                            }
                                            placeholder="Description détaillée de l'objet"
                                            required={false}
                                            minHeight="150px"
                                        />
                                    </div>
                                )}

                                {/* Histoire - pas pour personnes physiques */}
                                {source !== 'personnes_physiques' && (
                                    <div>
                                        <RichTextEditor
                                            value={formData.history || ''}
                                            onChange={(value) => handleInputChange('history', value)}
                                            label={
                                                <span className="flex items-center gap-1">
                                                    Histoire
                                                    <InfoTooltip content={tooltipTexts.common.history} />
                                                </span>
                                            }
                                            placeholder="Histoire de l'objet"
                                            required={false}
                                            minHeight="150px"
                                        />
                                    </div>
                                )}

                                {/* Champs spécifiques aux mobiliers */}
                                {source === 'mobiliers_images' && (
                                    <>
                                        {/* Inscriptions */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.inscription || ''}
                                                onChange={(value) => handleInputChange('inscription', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Inscriptions
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.inscription} />
                                                </span>
                                                }
                                                placeholder="Inscriptions présentes sur l'objet"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Emplacement actuel */}
                                        <div>
                                            <Label className="flex items-center gap-1" htmlFor="currentLocation">
                                                Emplacement actuel
                                                <InfoTooltip content={tooltipTexts.mobiliersImages.currentLocation} />
                                            </Label>
                                            <Input
                                                id="currentLocation"
                                                value={formData.currentLocation || ''}
                                                onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                                                placeholder="Où se trouve actuellement l'objet"
                                            />
                                        </div>

                                        {/* Emplacement d'origine */}
                                        <div>
                                            <Label className="flex items-center gap-1" htmlFor="originalLocation">
                                                Emplacement d'origine
                                                <InfoTooltip content={tooltipTexts.mobiliersImages.originalLocation} />
                                            </Label>
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
                                                <Label htmlFor="latitude" className="text-sm flex items-center gap-1">
                                                    Latitude
                                                    <InfoTooltip content={tooltipTexts.location.latitude} />
                                                </Label>
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
                                                <Label htmlFor="longitude" className="text-sm flex items-center gap-1">
                                                    Longitude
                                                    <InfoTooltip content={tooltipTexts.location.longitude} />
                                                </Label>
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
                                                <Label className="flex items-center gap-1 text-sm" htmlFor="simpleMention">
                                                    Simple mention
                                                    <InfoTooltip content={tooltipTexts.personnesMorales.simpleMention} />
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="foundationAct"
                                                    checked={formData.foundationAct || false}
                                                    onCheckedChange={(checked) => handleInputChange('foundationAct', checked)}
                                                />
                                                <Label className="flex items-center gap-1 text-sm" htmlFor="foundationAct">
                                                    Acte de fondation
                                                    <InfoTooltip content={tooltipTexts.personnesMorales.foundationAct} />
                                                </Label>
                                            </div>
                                        </div>

                                        {/* Texte des statuts */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.statutesText || ''}
                                                onChange={(value) => handleInputChange('statutesText', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Texte des statuts
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.statutesText} />
                                                    </span>
                                                }
                                                placeholder="Texte des statuts de la personne morale"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Description du fonctionnement */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.functioningDescription || ''}
                                                onChange={(value) => handleInputChange('functioningDescription', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Fonctionnement
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.functioningDescription} />
                                                    </span>
                                                }
                                                placeholder="Comment fonctionne cette personne morale"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Participation sociale */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.socialParticipation || ''}
                                                onChange={(value) => handleInputChange('socialParticipation', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Participation à la vie sociale
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.socialParticipation} />
                                                    </span>
                                                }
                                                placeholder="Implication et participation sociale"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Objets liés */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.relatedObjects || ''}
                                                onChange={(value) => handleInputChange('relatedObjects', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Objets liés
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.relatedObjects} />
                                                    </span>
                                                }
                                                placeholder="Objets et artefacts liés à cette personne morale"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Commentaire */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.comment || ''}
                                                onChange={(value) => handleInputChange('comment', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Commentaire
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.comment} />
                                                    </span>
                                                }
                                                placeholder="Commentaires additionnels"
                                                required={false}
                                                minHeight="150px"
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
                                                <Label htmlFor="birthDate" className="flex items-center gap-1">
                                                    Date de naissance
                                                    <InfoTooltip content={tooltipTexts.personnesPhysiques.birthDate} />
                                                </Label>
                                                <Input
                                                    id="birthDate"
                                                    type="date"
                                                    value={formData.birthDate || ''}
                                                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="deathDate" className="flex items-center gap-1">
                                                    Date de décès
                                                    <InfoTooltip content={tooltipTexts.personnesPhysiques.deathDate} />
                                                </Label>
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
                                            <Label htmlFor="attestation" className="flex items-center gap-1">
                                                Attestation
                                                <InfoTooltip content={tooltipTexts.personnesPhysiques.attestation} />
                                            </Label>
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
                                            <Label className="flex items-center gap-1">
                                                Périodes historiques
                                                <InfoTooltip content={tooltipTexts.personnesPhysiques.historicalPeriods} />
                                            </Label>
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
                                            <Label className="flex items-center gap-1">
                                                Professions
                                                <InfoTooltip content={tooltipTexts.personnesPhysiques.professions} />
                                            </Label>
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
                                            <RichTextEditor
                                                value={formData.biographicalElements || ''}
                                                onChange={(value) => handleInputChange('biographicalElements', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Éléments biographiques
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.biographicalElements} />
                                                    </span>
                                                }
                                                placeholder="Éléments biographiques de la personne"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Éléments de pèlerinage */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.pilgrimage || ''}
                                                onChange={(value) => handleInputChange('pilgrimage', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Pèlerinage
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.pilgrimage} />
                                                    </span>
                                                }
                                                placeholder="Informations sur les pèlerinages effectués"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Modes de transport */}
                                        <div>
                                            <Label className="flex items-center gap-1">
                                                Modes de transport
                                                <InfoTooltip content={tooltipTexts.personnesPhysiques.transportModes} />
                                            </Label>
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
                                            <Label htmlFor="eventNature" className="flex items-center gap-1">
                                                Nature de l'événement
                                                <InfoTooltip content={tooltipTexts.personnesPhysiques.eventNature} />
                                            </Label>
                                            <Input
                                                id="eventNature"
                                                value={formData.eventNature || ''}
                                                onChange={(e) => handleInputChange('eventNature', e.target.value)}
                                                placeholder="Nature de l'événement associé"
                                            />
                                        </div>

                                        {/* Commutation de vœu */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.commutationVow || ''}
                                                onChange={(value) => handleInputChange('commutationVow', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Commutation de vœu
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.commutationVow} />
                                                    </span>
                                                }
                                                placeholder="Informations sur la commutation de vœu"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>

                                        {/* Commentaire */}
                                        <div>
                                            <RichTextEditor
                                                value={formData.comment || ''}
                                                onChange={(value) => handleInputChange('comment', value)}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        Commentaire
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.comment} />
                                                    </span>
                                                }
                                                placeholder="Commentaires additionnels"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* États de conservation - pour mobiliers et monuments uniquement */}
                                {(source === 'mobiliers_images' || source === 'monuments_lieux') && (
                                    <div>
                                        <Label className="flex items-center gap-1">
                                            États de conservation
                                            <InfoTooltip content={tooltipTexts.common.conservationStates} />
                                        </Label>
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
                                        <Label className="flex items-center gap-1">
                                            Matériaux
                                            <InfoTooltip content={tooltipTexts.common.materials} />
                                        </Label>
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
                                        <Label className="flex items-center gap-1">
                                            Techniques
                                            <InfoTooltip content={tooltipTexts.mobiliersImages.techniques} />
                                        </Label>
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
                                        <Label htmlFor="protected" className="flex items-center gap-1 text-sm">
                                            Protégé
                                            <InfoTooltip content={tooltipTexts.common.protected} />
                                        </Label>
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
                                                <Label htmlFor="protectionComment" className="flex items-center gap-1 text-sm">
                                                    Nature de la protection
                                                    <InfoTooltip content={tooltipTexts.common.protectionComment} />
                                                </Label>
                                                <Textarea
                                                    id="protectionComment"
                                                    value={formData.protectionComment || ''}
                                                    onChange={(e) => handleInputChange('protectionComment', e.target.value)}
                                                    placeholder="Taper vos commentaires ici"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bibliographie */}
                                <div>
                                    <Label htmlFor="bibliography" className="flex items-center gap-1 text-sm">
                                        Bibliographie
                                        <InfoTooltip content={tooltipTexts.common.bibliography} />
                                    </Label>
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
                                <CardTitle>
                                    Fiches liées
                                    <InfoTooltip content={tooltipTexts.common.relatedForms} />
                                </CardTitle>
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

                        {/* Commentaire éventuel */}
                        {source === 'mobiliers_images' && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Commentaires éventuels
                                            <InfoTooltip content={tooltipTexts.common.optionalComment}/>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <RichTextEditor
                                                value={formData.temoinComment || ''}
                                                onChange={(value) => handleInputChange('temoinComment', value)}
                                                placeholder="Commentaires éventuels concernant la fiche"
                                                required={false}
                                                minHeight="150px"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Boutons d'action */}
                        <div className="space-y-3">
                            <div className="flex gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteDraft}
                                    disabled={isSubmitting || isSavingDraft}
                                    className="gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer le brouillon
                                </Button>
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
                                    disabled={isSubmitting || isSavingDraft || !(
                                      selectedCommune && selectedDepartment && selectedRegion && selectedCountry
                                    )}
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
                        {/* Modal de contact admin */}
                        <Dialog open={showContactAdminModal} onOpenChange={(open) => {
                            if (!open) handleCloseContactModal();
                        }}>
                            <DialogContent className="sm:max-w-md">
                                {!contactSent ? (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>Contacter les administrateurs</DialogTitle>
                                            <DialogDescription>
                                                Informez-nous d'une donnée manquante dans la localisation
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-email">Email</Label>
                                                <Input
                                                    id="contact-email"
                                                    value={user.email}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact-subject">Objet *</Label>
                                                <Input
                                                    id="contact-subject"
                                                    value={contactSubject}
                                                    onChange={(e) => setContactSubject(e.target.value)}
                                                    placeholder="Ex: Ville manquante dans le département..."
                                                    disabled={isSubmittingContact}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact-message">Message *</Label>
                                                <Textarea
                                                    id="contact-message"
                                                    value={contactMessage}
                                                    onChange={(e) => setContactMessage(e.target.value)}
                                                    placeholder="Décrivez la donnée manquante..."
                                                    className="min-h-[100px]"
                                                    disabled={isSubmittingContact}
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleCloseContactModal}
                                                disabled={isSubmittingContact}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                onClick={handleSendContactMessage}
                                                disabled={isSubmittingContact}
                                            >
                                                {isSubmittingContact ? 'Envoi...' : 'Envoyer'}
                                            </Button>
                                        </DialogFooter>
                                    </>
                                ) : (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                Message envoyé
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="py-4">
                                            <p className="text-sm">
                                                Merci pour votre message !
                                            </p>
                                            <p className="text-sm mt-2">
                                                Notre équipe va prendre connaissance de votre requête et la traiter dans les plus brefs délais.
                                            </p>
                                            <p className="text-sm mt-2">
                                                En attendant, vous pouvez toujours enregistrer votre fiche pour y retourner plus tard.
                                            </p>
                                        </div>

                                        <DialogFooter>
                                            <Button onClick={handleCloseContactModal}>
                                                Fermer
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </form>
                </div>
            </div>
        </div>
    );
}
