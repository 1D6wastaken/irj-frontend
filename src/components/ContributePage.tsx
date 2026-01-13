import {useState, useEffect, useRef} from "react";
import {
    ArrowLeft,
    Save,
    MapPin,
    Plus,
    X,
    CheckCircle,
    Users,
    Link,
    Search,
    AlertTriangle,
    ImageIcon,
    Trash2,
    FileText
} from "lucide-react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Textarea} from "./ui/textarea";
import {Checkbox} from "./ui/checkbox";
import {Badge} from "./ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "./ui/dialog";
import {toast} from "sonner";
import {categories} from "../constants/filters";
import {
    apiService,
    FilterOption,
    Country,
    Region,
    Department,
    Commune,
    ApiError,
    SearchRequestBody,
    SearchItem
} from "../config/api";
import {User} from "../App";
import {SearchableMultiSelect} from "./SearchableMultiSelect";
import {SearchableSelect} from "./SearchableSelect";
import { InfoTooltip } from "./InfoTooltip";
import { tooltipTexts } from "../constants/tooltipTexts";


interface ContributePageProps {
    user: User;
    onBack: () => void;
}

interface ImageUpload {
    file: File;
    caption: string;
    preview: string;
}

interface FormData {
    category: string;
    name: string;
    centuries: string[];
    location: {
        commune: string;
        department: string;
        region: string;
        country: string;
    };
    images: ImageUpload[];
    themes: string[];
    contributors: string[];
    relatedForms: { id: string; title: string; source: string; }[];
    source: {
        author: string;
        title: string;
        url: string;
        details: string;
    };
    // Champs spécifiques
    description?: string;
    history?: string;
    bibliography?: string;
    conservationStates?: string[];
    materials?: string[];
    techniques?: string[];
    natures?: string[];
    coordinates?: {
        latitude: string;
        longitude: string;
    };
    protected?: boolean;
    protectionComment?: string;
    foundationAct?: boolean;
    statutesText?: boolean;
    comment?: string;
    attestation?: string;
    historicalPeriods?: string[];
    biographicalElements?: string;
    pilgrimage?: string;
    commutationVow?: string;
    transportModes?: string[];
    professions?: string[];
    eventNature?: string;
    inscription?: string;
    currentLocation?: string;
    originalLocation?: string;
    simpleMention?: boolean;
    functioningDescription?: string;
    socialParticipation?: string;
    relatedObjects?: string;
    birthDate?: string;
    deathDate?: string;
}

export function ContributePage({ user, onBack }: ContributePageProps) {
    const [formData, setFormData] = useState<FormData>({
        category: '',
        name: '',
        centuries: [],
        location: {
            commune: '',
            department: '',
            region: '',
            country: ''
        },
        images: [],
        themes: [],
        contributors: [],
        relatedForms: [],
        source: {
            author: '',
            title: '',
            url: '',
            details: ''
        },
        coordinates: {
            latitude: '',
            longitude: ''
        },
        materials: [],
        techniques: [],
        natures: [],
        historicalPeriods: [],
        transportModes: [],
        professions: [],
        simpleMention: false,
        statutesText: false,
        protected: false
    });

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

    // États pour les filtres spécifiques par catégorie
    const [conservationStates, setConservationStates] = useState<FilterOption[]>([]);
    const [materials, setMaterials] = useState<FilterOption[]>([]);
    const [buildingNatures, setBuildingNatures] = useState<FilterOption[]>([]);
    const [furnituresNatures, setFurnituresNatures] = useState<FilterOption[]>([]);
    const [furnituresTechniques, setFurnituresTechniques] = useState<FilterOption[]>([]);
    const [legalEntityNatures, setLegalEntityNatures] = useState<FilterOption[]>([]);
    const [professions, setProfessions] = useState<FilterOption[]>([]);
    const [travels, setTravels] = useState<FilterOption[]>([]);
    const [historicalPeriods, setHistoricalPeriods] = useState<FilterOption[]>([]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newContributor, setNewContributor] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // États pour la recherche de fiches liées
    const [ficheSearchQuery, setFicheSearchQuery] = useState('');
    const [ficheSearchResults, setFicheSearchResults] = useState<SearchItem[]>([]);
    const [showFicheResults, setShowFicheResults] = useState(false);
    const [isSearchingFiches, setIsSearchingFiches] = useState(false);

    // États pour la gestion de l'upload d'images
    const [showImageErrorModal, setShowImageErrorModal] = useState(false);
    const [imageErrorType, setImageErrorType] = useState<'400' | '500' | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [wasSubmittedAsDraft, setWasSubmittedAsDraft] = useState(false);

    // États pour la popup de contact admin
    const [showContactAdminModal, setShowContactAdminModal] = useState(false);
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);
    const [contactSent, setContactSent] = useState(false);

    // Ref pour le debounce de recherche de communes et de fiches
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ficheSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Charger les données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [
                    centuriesData,
                    themesData,
                    countriesData,
                    regionsData,
                    departmentsData,
                    conservationData,
                    materialsData
                ] = await Promise.all([
                    apiService.getCenturies(),
                    apiService.getThemes(),
                    apiService.getCountries(),
                    apiService.getRegions(),
                    apiService.getDepartments(),
                    apiService.getConservationStates(),
                    apiService.getMaterials()
                ]);

                setCenturies(Array.isArray(centuriesData) ? centuriesData : []);
                setThemes(Array.isArray(themesData) ? themesData : []);
                setCountries(Array.isArray(countriesData) ? countriesData : []);
                setRegions(Array.isArray(regionsData) ? regionsData : []);
                setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
                setConservationStates(Array.isArray(conservationData) ? conservationData : []);
                setMaterials(Array.isArray(materialsData) ? materialsData : []);
            } catch (error) {
                console.error('Erreur lors du chargement des données initiales:', error);
                toast.error('Erreur lors du chargement des données. Certaines options peuvent être limitées.');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Charger les données spécifiques selon la catégorie sélectionnée
    useEffect(() => {
        const loadCategorySpecificData = async () => {
            if (!formData.category) return;

            try {
                switch (formData.category) {
                    case 'monuments_lieux':
                        const [buildingNaturesData] = await Promise.all([
                            apiService.getBuildingNatures()
                        ]);
                        setBuildingNatures(Array.isArray(buildingNaturesData) ? buildingNaturesData : []);
                        break;

                    case 'mobiliers_images':
                        const [furnituresNaturesData, furnituresTechniquesData] = await Promise.all([
                            apiService.getFurnituresNatures(),
                            apiService.getFurnituresTechniques()
                        ]);
                        setFurnituresNatures(Array.isArray(furnituresNaturesData) ? furnituresNaturesData : []);
                        setFurnituresTechniques(Array.isArray(furnituresTechniquesData) ? furnituresTechniquesData : []);
                        break;

                    case 'personnes_morales':
                        const [legalEntityNaturesData] = await Promise.all([
                            apiService.getLegalEntityNatures()
                        ]);
                        setLegalEntityNatures(Array.isArray(legalEntityNaturesData) ? legalEntityNaturesData : []);
                        break;

                    case 'personnes_physiques':
                        const [professionsData, travelsData, historicalPeriodsData] = await Promise.all([
                            apiService.getProfessions(),
                            apiService.getTravels(),
                            apiService.getHistoricalPeriods()
                        ]);
                        setProfessions(Array.isArray(professionsData) ? professionsData : []);
                        setTravels(Array.isArray(travelsData) ? travelsData : []);
                        setHistoricalPeriods(Array.isArray(historicalPeriodsData) ? historicalPeriodsData : []);
                        break;
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données spécifiques:', error);
                toast.error('Erreur lors du chargement des options spécifiques à cette catégorie.');
            }
        };

        loadCategorySpecificData();
    }, [formData.category]);

    // Recherche de communes avec debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchCommunes(communeQuery);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [communeQuery]);

    // Recherche de fiches avec debounce
    useEffect(() => {
        if (ficheSearchTimeoutRef.current) {
            clearTimeout(ficheSearchTimeoutRef.current);
        }

        ficheSearchTimeoutRef.current = setTimeout(() => {
            searchFiches(ficheSearchQuery);
        }, 300);

        return () => {
            if (ficheSearchTimeoutRef.current) {
                clearTimeout(ficheSearchTimeoutRef.current);
            }
        };
    }, [ficheSearchQuery]);

    const searchCommunes = async (query: string) => {
        if (query.length < 2) {
            setCommunes([]);
            return;
        }

        setIsSearchingCommunes(true);
        try {
            const data = await apiService.searchCommunes(query);
            setCommunes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors de la recherche de communes:', error);
            setCommunes([]);
        } finally {
            setIsSearchingCommunes(false);
        }
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

    const searchFiches = async (query: string) => {
        if (query.length < 2) {
            setFicheSearchResults([]);
            return;
        }

        setIsSearchingFiches(true);
        try {
            let searchReqBody : SearchRequestBody = {}
            switch (formData.category) {
                case 'monuments_lieux':
                    searchReqBody = {
                        mobiliers_images: {},
                        pers_morales: {},
                        pers_physiques: {},
                    }

                    break;
                case 'mobiliers_images':
                    searchReqBody = {
                        monuments_lieux: {},
                        pers_morales: {},
                        pers_physiques: {},
                    }

                    break;
                case 'personnes_morales':
                    searchReqBody = {
                        mobiliers_images: {},
                        monuments_lieux: {},
                        pers_physiques: {},
                    }

                    break;
                case 'personnes_physiques':
                    searchReqBody = {
                        mobiliers_images: {},
                        pers_morales: {},
                        monuments_lieux: {},
                    }

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

    const handleInputChange = (field: string, value: any) => {
        if (field === 'category') {
            setFicheSearchQuery('')
            formData.relatedForms = []
        }
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Filtrage des régions selon le pays sélectionné
    const getFilteredRegions = () => {
        if (!selectedCountry) {
            return regions;
        }
        return regions.filter(region => region.pays.id === selectedCountry.id);
    };

    // Filtrage des départements selon la région/pays sélectionné
    const getFilteredDepartments = () => {
        if (selectedRegion) {
            return departments.filter(dept => dept.region.id === selectedRegion.id);
        } else if (selectedCountry) {
            return departments.filter(dept => dept.region.pays.id === selectedCountry.id);
        }
        return departments;
    };

    // Gestion de la sélection de pays
    const handleCountryChange = (country: Country) => {
        setSelectedCountry(country);
        setSelectedRegion(null);
        setSelectedDepartment(null);
        setSelectedCommune(null);
        setFormData(prev => ({
            ...prev,
            location: {
                commune: '',
                department: '',
                region: '',
                country: country.name
            }
        }));
        // Effacer l'erreur de localisation si elle existe
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: '' }));
        }
    };

    // Gestion de la sélection de région
    const handleRegionChange = (region: Region) => {
        setSelectedRegion(region);
        setSelectedDepartment(null);
        setSelectedCommune(null);
        setFormData(prev => ({
            ...prev,
            location: {
                commune: '',
                department: '',
                region: region.name,
                country: region.pays.name
            }
        }));
    };

    // Gestion de la sélection de département
    const handleDepartmentChange = (department: Department) => {
        setSelectedDepartment(department);
        setSelectedCommune(null);
        setFormData(prev => ({
            ...prev,
            location: {
                commune: '',
                department: department.name,
                region: department.region.name,
                country: department.region.pays.name
            }
        }));
    };

    // Gestion de la sélection de commune
    const handleCommuneSelect = (commune: Commune) => {
        if (!commune || !commune.name || !commune.department?.name || !commune.department?.region?.name || !commune.department?.region?.pays?.name) {
            return;
        }

        setSelectedCommune(commune);
        setSelectedCountry(commune.department.region.pays);
        setSelectedRegion(commune.department.region);
        setSelectedDepartment(commune.department);

        setFormData(prev => ({
            ...prev,
            location: {
                commune: commune.name,
                department: commune.department.name,
                region: commune.department.region.name,
                country: commune.department.region.pays.name
            }
        }));

        setCommuneQuery(''); // Vider la query de recherche
        setShowCommuneResults(false);

        // Effacer l'erreur de localisation si elle existe
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: '' }));
        }
    };

    const handleSourceChange = (field: keyof FormData['source'], value: string) => {
        setFormData(prev => ({
            ...prev,
            source: {
                ...prev.source,
                [field]: value
            }
        }));
    };

    const handleCoordinatesChange = (field: 'latitude' | 'longitude', value: string) => {
        setFormData(prev => ({
            ...prev,
            coordinates: {
                ...prev.coordinates!,
                [field]: value
            }
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            const MAX_SIZE = 1024 * 1024; // 1MB en bytes
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
                const imagePromises = validFiles.map((file) => {
                    return new Promise<ImageUpload>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({
                                file,
                                caption: '',
                                preview: reader.result as string
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                });

                // Attendre que toutes les images soient chargées
                Promise.all(imagePromises).then((newImages) => {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...newImages]
                    }));

                    if (validFiles.length > 0) {
                        toast.success(`${validFiles.length} image(s) ajoutée(s) avec succès`);
                    }
                });
            }
        }

        // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers à nouveau
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const updateImageCaption = (index: number, caption: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) =>
                i === index ? { ...img, caption } : img
            )
        }));
    };

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

    const handleSelectFiche = (fiche: any) => {
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

    const validateForm = (isDraft: boolean) => {
        const newErrors: Record<string, string> = {};

        if (!formData.category) newErrors.category = 'La catégorie est requise';
        if (!formData.name.trim()) newErrors.name = 'Le nom/titre est requis';

        if (isDraft) {
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
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
                newErrors.location = 'La localisation est incomplète : ' + locationError.slice(0, locationError.length - 1).join(', ') + ' ' + locationError[locationError.length -1] + ' sont requis.';
            } else {
                newErrors.location = 'La localisation est incomplète : ' + locationError[0] + ' est requis.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();

        if (!validateForm(isDraft)) return;

        setIsSubmittingForm(true);

        try {
            const mediaIds: string[] = [];

            // Étape 1: Upload de toutes les images si présentes
            if (formData.images.length > 0) {
                toast.info(`Upload de ${formData.images.length} image(s) en cours...`);

                for (let i = 0; i < formData.images.length; i++) {
                    const imageUpload = formData.images[i];
                    try {
                        const uploadResponse = await apiService.uploadImage(
                            imageUpload.file,
                            imageUpload.caption
                        );
                        mediaIds.push(uploadResponse.id);
                        toast.success(`Image ${i + 1}/${formData.images.length} uploadée avec succès`);
                    } catch (error) {
                        console.error(`Erreur lors de l'upload de l'image ${i + 1}:`, error);

                        if (error instanceof ApiError) {
                            if (error.status === 400) {
                                // Erreur de chargement - demander à l'utilisateur s'il veut continuer
                                setImageErrorType('400');
                                setShowImageErrorModal(true);
                                setIsSubmittingForm(false);
                                return; // Arrêter ici et attendre la décision de l'utilisateur
                            } else if (error.status === 500) {
                                // Erreur interne - informer l'utilisateur
                                setImageErrorType('500');
                                setShowImageErrorModal(true);
                                setIsSubmittingForm(false);
                                return; // Arrêter ici
                            }
                        }

                        // Pour autres erreurs, continuer sans cette image
                        toast.warning(`Erreur lors de l'upload de l'image ${i + 1}. Elle ne sera pas incluse.`);
                    }
                }
            }

            // Étape 2: Soumission de la fiche avec tous les IDs d'images
            await submitFormData(mediaIds, isDraft);

        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            if (error instanceof ApiError) {
                toast.error(`Erreur lors de la soumission: ${error.message}`);
            } else {
                toast.error('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
            }
            setIsSubmittingForm(false);
        }
    };

    const submitFormData = async (mediaIds: string[] = [], isDraft: boolean = false) => {
        // Préparer les données selon le type de fiche
        let submissionData: any;

        const linkedMonumentsLieux = formData.relatedForms
            .filter(form => form.source === 'monuments_lieux')
            .map(form => form.id);
        const linkedMobiliersImages = formData.relatedForms
            .filter(form => form.source === 'mobiliers_images')
            .map(form => form.id);
        const linkedPersMorales = formData.relatedForms
            .filter(form => form.source === 'personnes_morales')
            .map(form => form.id);
        const linkedPersPhysiques = formData.relatedForms
            .filter(form => form.source === 'personnes_physiques')
            .map(form => form.id);

        const sourceComponents = [];
        if (formData.source.author) sourceComponents.push(`Auteur: ${formData.source.author}`);
        if (formData.source.title) sourceComponents.push(`Titre: ${formData.source.title}`);
        if (formData.source.url) sourceComponents.push(`URL: ${formData.source.url}`);
        if (formData.source.details) sourceComponents.push(`Détails: ${formData.source.details}`);

        const sourceInfo = sourceComponents.join(' | ') || undefined;

        switch (formData.category) {
            case 'monuments_lieux':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaIds,
                    city: selectedCommune?.id || undefined,
                    department: selectedDepartment?.id || undefined,
                    region: selectedRegion?.id || undefined,
                    country: selectedCountry?.id || undefined,
                    themes: formData.themes,
                    contributors: formData.contributors || undefined ,
                    source: sourceInfo,
                    description: formData.description || '',
                    history: formData.history || undefined,
                    bibliography: formData.bibliography || undefined,
                    conservationStates: formData.conservationStates,
                    isProtected: formData.protected || false,
                    protectionComment: formData.protectionComment || undefined,
                    materials: formData.materials || [],
                    natures: formData.natures || [],
                    latitude: formData.coordinates?.latitude && formData.coordinates.latitude.trim() !== ''
                        ? formData.coordinates.latitude
                        : undefined,
                    longitude: formData.coordinates?.longitude && formData.coordinates.longitude.trim() !== ''
                        ? formData.coordinates.longitude
                        : undefined,
                    linkedMobiliersImages,
                    linkedPersMorales,
                    linkedPersPhysiques,
                    draft: isDraft
                };

                await apiService.submitMonumentLieu(submissionData);

                break;
            case 'mobiliers_images':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaIds,
                    city: selectedCommune?.id || undefined,
                    department: selectedDepartment?.id || undefined,
                    region: selectedRegion?.id || undefined,
                    country: selectedCountry?.id || undefined,
                    themes: formData.themes,
                    contributors: formData.contributors || undefined ,
                    source: sourceInfo,
                    description: formData.description || '',
                    inscription: formData.inscription || undefined,
                    history: formData.history || undefined,
                    bibliography: formData.bibliography || undefined,
                    conservationStates: formData.conservationStates,
                    isProtected: formData.protected || false,
                    protectionComment: formData.protectionComment || undefined,
                    materials: formData.materials || [],
                    techniques: formData.techniques || [],
                    natures: formData.natures || [],
                    originPlace: formData.originalLocation,
                    presentPlace: formData.currentLocation,
                    linkedMonumentsLieux,
                    linkedPersMorales,
                    linkedPersPhysiques,
                    draft: isDraft
                };

                await apiService.submitMobilierImage(submissionData);

                break;
            case 'personnes_morales':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaIds,
                    city: selectedCommune?.id || undefined,
                    department: selectedDepartment?.id || undefined,
                    region: selectedRegion?.id || undefined,
                    country: selectedCountry?.id || undefined,
                    themes: formData.themes,
                    contributors: formData.contributors || undefined ,
                    source: sourceInfo,
                    simple_mention: formData.simpleMention,
                    foundation_deed: formData.foundationAct,
                    status_text: formData.statutesText,
                    functionning: formData.functioningDescription || undefined,
                    history: formData.history || undefined,
                    social_involvement: formData.socialParticipation || undefined,
                    linked_objects: formData.relatedObjects || undefined,
                    bibliography: formData.bibliography || undefined,
                    natures: formData.natures || [],
                    comment: formData.comment || undefined,
                    linkedMonumentsLieux,
                    linkedMobiliersImages,
                    linkedPersPhysiques,
                    draft: isDraft
                };

                await apiService.submitPersonneMorale(submissionData);

                break;
            case 'personnes_physiques':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaIds,
                    city: selectedCommune?.id || undefined,
                    department: selectedDepartment?.id || undefined,
                    region: selectedRegion?.id || undefined,
                    country: selectedCountry?.id || undefined,
                    themes: formData.themes,
                    contributors: formData.contributors || undefined ,
                    source: sourceInfo,
                    birthday: formData.birthDate || undefined,
                    death: formData.deathDate || undefined,
                    attestation: formData.attestation || undefined,
                    historical_periods: formData.historicalPeriods,
                    professions: formData.professions,
                    biographical_elements: formData.biographicalElements || undefined,
                    pilgrimage_elements: formData.pilgrimage || undefined,
                    travels: formData.transportModes,
                    nature: formData.eventNature || undefined,
                    commutation: formData.commutationVow || undefined,
                    bibliography: formData.bibliography || undefined,
                    comment: formData.comment || undefined,
                    linkedMonumentsLieux,
                    linkedMobiliersImages,
                    linkedPersMorales,
                    draft: isDraft
                };

                await apiService.submitPersonnePhysique(submissionData);

                break;
        }

        setWasSubmittedAsDraft(isDraft);
        setIsSubmitted(true);
        setIsSubmittingForm(false);
        toast.success(isDraft ? 'Brouillon enregistré avec succès !' : 'Fiche soumise avec succès !');
    };

    // Fonction pour sauvegarder en tant que brouillon
    const handleSaveDraft = async (e: React.FormEvent) => {
        setIsSavingDraft(true);
        await handleSubmit(e, true);
        setIsSavingDraft(false);
    };

    // Fonction pour continuer sans images (après erreur 400)
    const handleContinueWithoutImage = async () => {
        setShowImageErrorModal(false);
        setImageErrorType(null);

        try {
            await submitFormData([], isSavingDraft);
        } catch (error) {
            console.error('Erreur lors de la soumission sans image:', error);
            if (error instanceof ApiError) {
                toast.error(`Erreur lors de la soumission: ${error.message}`);
            } else {
                toast.error('Une erreur est survenue lors de la soumission. Veuillez réessayer.');
            }
            setIsSubmittingForm(false);
        }
    };

    // Fonction pour annuler la soumission
    const handleCancelSubmission = () => {
        setShowImageErrorModal(false);
        setImageErrorType(null);
        setIsSubmittingForm(false);
    };

    const resetForm = () => {
        setIsSubmitted(false);
        setFormData({
            category: '',
            name: '',
            centuries: [],
            location: {
                commune: '',
                department: '',
                region: '',
                country: ''
            },
            images: [],
            themes: [],
            contributors: [],
            relatedForms: [],
            source: {
                author: '',
                title: '',
                url: '',
                details: ''
            },
            coordinates: {
                latitude: '',
                longitude: ''
            },
            materials: [],
            techniques: [],
            natures: [],
            historicalPeriods: [],
            transportModes: [],
            professions: [],
            simpleMention: false,
            statutesText: false,
            protected: false
        });
        setErrors({});
        setSelectedCountry(null);
        setSelectedRegion(null);
        setSelectedDepartment(null);
        setSelectedCommune(null);
        setCommuneQuery('');
        setShowCommuneResults(false);
        setFicheSearchQuery('');
        setShowFicheResults(false);
        setFicheSearchResults([]);
        setShowImageErrorModal(false);
        setImageErrorType(null);
        setIsSubmittingForm(false);
        setIsSavingDraft(false);
        setWasSubmittedAsDraft(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⏳</div>
                            <h3 className="text-xl font-medium text-muted-foreground">
                                Chargement des données...
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-secondary py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <Card className={wasSubmittedAsDraft ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}>
                            <CardContent className="text-center py-12">
                                {wasSubmittedAsDraft ? (
                                    <>
                                        <FileText className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                                        <h2 className="text-2xl mb-4 text-blue-800">
                                            Brouillon enregistré avec succès !
                                        </h2>
                                        <p className="text-blue-700 mb-6 leading-relaxed">
                                            Votre brouillon a été sauvegardé. Vous pourrez le retrouver dans votre espace personnel
                                            et le compléter ou le soumettre plus tard.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                                        <h2 className="text-2xl font-bold text-green-800 mb-4">
                                            Fiche soumise avec succès !
                                        </h2>
                                        <p className="text-green-700 mb-6 leading-relaxed">
                                            Votre contribution a été reçue et sera examinée par notre équipe d'administrateurs.
                                        </p>
                                    </>
                                )}
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={resetForm} variant="outline">
                                        Créer une nouvelle fiche
                                    </Button>
                                    <Button onClick={onBack} className="bg-primary">
                                        Retour à l'accueil
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">
                            Créer une nouvelle fiche
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Contribuez à l'enrichissement de notre base de données patrimoniale
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Auteur de la fiche</span>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">
                                {user.firstName} {user.lastName} ({user.email})
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                                e.preventDefault();
                            }
                        }}
                    >
                        {/* Catégorie */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Catégorie
                                    <InfoTooltip content={tooltipTexts.common.category} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Array.isArray(categories) && categories.filter(cat => cat && cat.id && cat.name).map((category) => (
                                        <div
                                            key={category.id}
                                            onClick={() => handleInputChange('category', category.id)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                formData.category === category.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <h3 className="font-medium">{category.name}</h3>
                                        </div>
                                    ))}
                                </div>
                                {errors.category && <p className="text-destructive text-sm mt-2">{errors.category}</p>}
                            </CardContent>
                        </Card>

                        {formData.category && (
                            <>
                                {/* Informations générales */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations générales</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Nom/Titre */}
                                        <div>
                                            <Label htmlFor="name" className="flex items-center gap-1">
                                                Nom/Titre *
                                                <InfoTooltip content={tooltipTexts.common.name} />
                                            </Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className={errors.name ? 'border-destructive' : ''}
                                                placeholder="Nom ou titre de l'élément"
                                            />
                                            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                                        </div>

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
                                                    options={centuries.filter(c => c && c.id && c.name).map(c => ({ id: c.id, name: c.name }))}
                                                    selectedValues={formData.centuries || []}
                                                    onChange={(selected) => setFormData(prev => ({ ...prev, centuries: selected }))}
                                                    placeholder="Sélectionner des siècles"
                                                    searchPlaceholder="Rechercher un siècle..."
                                                    emptyMessage="Aucun siècle trouvé"
                                                />
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    Chargement des siècles...
                                                </div>
                                            )}
                                            {errors.centuries && <p className="text-destructive text-sm mt-2">{errors.centuries}</p>}
                                        </div>

                                        {/* Localisation */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <Label className="flex items-center gap-1">
                                                    Localisation *
                                                    <InfoTooltip content={tooltipTexts.location.title} />
                                                </Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                La localisation complète est requise. <Button
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
                                                            options={countries.filter(c => c && c.id && c.name).map(c => ({ id: c.id, name: c.name }))}
                                                            selectedValue={selectedCountry?.id || ''}
                                                            onChange={(countryId) => {
                                                                const country = countries.find(c => c.id === countryId);
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
                                                                id: r.id,
                                                                name: r.name,
                                                                description: r.pays.name
                                                            }))}
                                                            selectedValue={selectedRegion?.id || ''}
                                                            onChange={(regionId) => {
                                                                const region = regions.find(r => r.id === regionId);
                                                                if (region) handleRegionChange(region);
                                                            }}
                                                            placeholder="Sélectionner une région"
                                                            searchPlaceholder="Rechercher une région..."
                                                            emptyMessage="Aucune région trouvée"
                                                            disabled={!selectedCountry}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Départements */}
                                                <div>
                                                    <Label className="text-sm">Département</Label>
                                                    <div className="mt-1">
                                                        <SearchableSelect
                                                            options={getFilteredDepartments().map(d => ({
                                                                id: d.id,
                                                                name: d.name,
                                                                description: `${d.region.name}, ${d.region.pays.name}`
                                                            }))}
                                                            selectedValue={selectedDepartment?.id || ''}
                                                            onChange={(departmentId) => {
                                                                const department = departments.find(d => d.id === departmentId);
                                                                if (department) handleDepartmentChange(department);
                                                            }}
                                                            placeholder="Sélectionner un département"
                                                            searchPlaceholder="Rechercher un département..."
                                                            emptyMessage="Aucun département trouvé"
                                                            disabled={!selectedCountry}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Communes */}
                                                <div className="relative">
                                                    <Label className="text-sm">Commune</Label>
                                                    <div className="relative mt-1">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder={selectedCommune ? selectedCommune.name : "Rechercher une commune..."}
                                                            value={selectedCommune ? selectedCommune.name : communeQuery}
                                                            onChange={(e) => {
                                                                if (selectedCommune) {
                                                                    // Si une commune est sélectionnée et qu'on modifie le champ, on la désélectionne
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
                                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
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
                                                                    <div className="font-medium">{commune.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {commune.department.name}, {commune.department.region.name}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {errors.commune && <p className="text-destructive text-sm mt-1">{errors.commune}</p>}
                                                </div>

                                                {/* Affichage de la localisation sélectionnée */}
                                                {selectedCommune && (
                                                    <div className="p-3 bg-accent rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm font-medium text-accent-foreground">
                                                                    Localisation sélectionnée :
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {selectedCommune.name}, {selectedCommune.department.name}, {selectedCommune.department.region.name}, {selectedCommune.department.region.pays.name}
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
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fermer le dropdown des communes quand on clique ailleurs */}
                                            {showCommuneResults && (
                                                <div
                                                    className="fixed inset-0 z-0"
                                                    onClick={() => {
                                                        setShowCommuneResults(false);
                                                    }}
                                                />
                                            )}

                                            {/* Message d'erreur pour la localisation */}
                                            {errors.location && (
                                                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mt-4">
                                                    <AlertTriangle className="w-4 h-4 text-destructive" />
                                                    <p className="text-sm text-destructive">{errors.location}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Images */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                    <Label>Images</Label>
                                                    <InfoTooltip content={tooltipTexts.common.images} />
                                                </div>
                                                <Badge variant="secondary">
                                                    {formData.images.length} image{formData.images.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>

                                            {/* Bouton d'ajout d'images */}
                                            <div className="mb-4">
                                                <label htmlFor="imageInput" className="cursor-pointer">
                                                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors">
                                                        <Plus className="w-5 h-5" />
                                                        <span className="text-sm">Ajouter des images</span>
                                                    </div>
                                                    <input
                                                        id="imageInput"
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-amber-800">
                                                        Les images de plus de 1 MB seront refusées par le serveur. Assurez-vous que vos images ne dépassent pas cette taille.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Liste des images uploadées */}
                                            {formData.images.length > 0 && (
                                                <div className="space-y-4">
                                                    {formData.images.map((image, index) => (
                                                        <div key={index} className="p-4 border rounded-lg bg-accent/30">
                                                            <div className="flex gap-4">
                                                                {/* Preview de l'image */}
                                                                <div className="flex-shrink-0">
                                                                    <img
                                                                        src={image.preview}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-24 h-24 object-cover rounded-lg border"
                                                                    />
                                                                </div>

                                                                {/* Informations et légende */}
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div>
                                                                            <p className="text-sm font-medium truncate">
                                                                                {image.file.name}
                                                                            </p>
                                                                            <p className={`text-xs ${
                                                                                image.file.size > 1024 * 1024
                                                                                    ? 'text-destructive font-medium'
                                                                                    : 'text-muted-foreground'
                                                                            }`}>
                                                                                {image.file.size > 1024 * 1024
                                                                                    ? `${(image.file.size / (1024 * 1024)).toFixed(2)} MB`
                                                                                    : `${(image.file.size / 1024).toFixed(1)} KB`}
                                                                                {image.file.size > 1024 * 1024 && (
                                                                                    <span className="ml-1">⚠️ Trop grande</span>
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeImage(index)}
                                                                            className="text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>

                                                                    <div>
                                                                        <Label htmlFor={`caption-${index}`} className="text-xs">
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

                                        {/* Thèmes */}
                                        <div>
                                            <Label className="flex items-center gap-1">
                                                Thèmes
                                                <InfoTooltip content={tooltipTexts.common.themes} />
                                            </Label>
                                            {Array.isArray(themes) && themes.length > 0 ? (
                                                <SearchableMultiSelect
                                                    options={themes.filter(t => t && t.id && t.name).map(t => ({ id: t.id, name: t.name }))}
                                                    selectedValues={formData.themes || []}
                                                    onChange={(selected) => setFormData(prev => ({ ...prev, themes: selected }))}
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
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {formData.contributors.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.contributors.map((contributor, index) => (
                                                            <Badge key={index} variant="secondary" className="flex items-center gap-2">
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
                                            <Label className="flex items-center gap-1">
                                                Source de l'information
                                                <InfoTooltip content={tooltipTexts.source.title} />
                                            </Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <Label htmlFor="sourceAuthor" className="text-sm flex items-center gap-1">
                                                        Auteur
                                                        <InfoTooltip content={tooltipTexts.source.author} />
                                                    </Label>
                                                    <Input
                                                        id="sourceAuthor"
                                                        value={formData.source.author}
                                                        onChange={(e) => handleSourceChange('author', e.target.value)}
                                                        className={errors.sourceAuthor ? 'border-destructive' : ''}
                                                        placeholder="Nom de l'auteur"
                                                    />
                                                    {errors.sourceAuthor && <p className="text-destructive text-sm mt-1">{errors.sourceAuthor}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="sourceTitle" className="text-sm flex items-center gap-1">
                                                        Titre
                                                        <InfoTooltip content={tooltipTexts.source.sourceTitle} />
                                                    </Label>
                                                    <Input
                                                        id="sourceTitle"
                                                        value={formData.source.title}
                                                        onChange={(e) => handleSourceChange('title', e.target.value)}
                                                        placeholder="Titre de la source"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="sourceUrl" className="text-sm flex items-center gap-1">
                                                        URL/Référence
                                                        <InfoTooltip content={tooltipTexts.source.url} />
                                                    </Label>
                                                    <Input
                                                        id="sourceUrl"
                                                        value={formData.source.url}
                                                        onChange={(e) => handleSourceChange('url', e.target.value)}
                                                        placeholder="Lien web ou référence"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor="sourceDetails" className="text-sm flex items-center gap-1">
                                                        Détails
                                                        <InfoTooltip content={tooltipTexts.source.details} />
                                                    </Label>
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

                                {/* Champs spécifiques */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations spécifiques</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Monuments & Lieux */}
                                        {formData.category === 'monuments_lieux' && (
                                            <>
                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Types d'éléments
                                                        <InfoTooltip content={tooltipTexts.monumentsLieux.natures} />
                                                    </Label>
                                                    {Array.isArray(buildingNatures) && buildingNatures.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={buildingNatures.filter(n => n && n.id && n.name).map(n => ({ id: n.id, name: n.name }))}
                                                            selectedValues={formData.natures || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, natures: selected }))}
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

                                                <div>
                                                    <Label htmlFor="description" className="flex items-center gap-1">
                                                        Description
                                                        <InfoTooltip content={tooltipTexts.common.description} />
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={formData.description || ''}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        className={errors.description ? 'border-destructive' : ''}
                                                        placeholder="Description détaillée du monument ou lieu"
                                                        rows={4}
                                                    />
                                                    {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                                                </div>

                                                <div>
                                                    <Label htmlFor="history" className="flex items-center gap-1">
                                                        Histoire
                                                        <InfoTooltip content={tooltipTexts.common.history} />
                                                    </Label>
                                                    <Textarea
                                                        id="history"
                                                        value={formData.history || ''}
                                                        onChange={(e) => handleInputChange('history', e.target.value)}
                                                        placeholder="Histoire et contexte historique"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="bibliography" className="flex items-center gap-1">
                                                        Bibliographie
                                                        <InfoTooltip content={tooltipTexts.common.bibliography} />
                                                    </Label>
                                                    <Textarea
                                                        id="bibliography"
                                                        value={formData.bibliography || ''}
                                                        onChange={(e) => handleInputChange('bibliography', e.target.value)}
                                                        placeholder="Références bibliographiques"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Coordonnées GPS
                                                    </Label>
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div>
                                                            <Label htmlFor="latitude" className="text-sm flex items-center gap-1">
                                                                Latitude
                                                                <InfoTooltip content={tooltipTexts.location.latitude} />
                                                            </Label>
                                                            <Input
                                                                id="latitude"
                                                                value={formData.coordinates?.latitude || ''}
                                                                onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                                                                placeholder="Ex: 43.12345"
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
                                                                onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                                                                placeholder="Ex: 1.12345"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        États de conservation
                                                        <InfoTooltip content={tooltipTexts.monumentsLieux.conservationStates} />
                                                    </Label>
                                                    {Array.isArray(conservationStates) && conservationStates.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={conservationStates.filter(c => c && c.id && c.name).map(c => ({ id: c.id, name: c.name }))}
                                                            selectedValues={formData.conservationStates || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, conservationStates: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Matériaux
                                                        <InfoTooltip content={tooltipTexts.monumentsLieux.materials} />
                                                    </Label>
                                                    {Array.isArray(materials) && materials.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={materials.filter(m => m && m.id && m.name).map(m => ({ id: m.id, name: m.name }))}
                                                            selectedValues={formData.materials || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, materials: selected }))}
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

                                                <div>
                                                    <Label>Protection</Label>
                                                    <div className="space-y-4 mt-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="protected"
                                                                checked={formData.protected || false}
                                                                onCheckedChange={(checked) => handleInputChange('protected', checked)}
                                                            />
                                                            <Label htmlFor="protected" className="flex items-center gap-1 text-sm">
                                                                Monument protégé
                                                                <InfoTooltip content={tooltipTexts.monumentsLieux.protected} />
                                                            </Label>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="protectionComment" className="flex items-center gap-1 text-sm">
                                                                Commentaire de protection
                                                                <InfoTooltip content={tooltipTexts.monumentsLieux.protectionComment} />
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
                                            </>
                                        )}

                                        {/* Mobiliers & Images */}
                                        {formData.category === 'mobiliers_images' && (
                                            <>
                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Type d'Élément
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.natures} />
                                                    </Label>
                                                    {Array.isArray(furnituresNatures) && furnituresNatures.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={furnituresNatures.filter(n => n && n.id && n.name).map(n => ({ id: n.id, name: n.name }))}
                                                            selectedValues={formData.natures || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, natures: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="description">
                                                        Description
                                                        <InfoTooltip content={tooltipTexts.common.description} />
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={formData.description || ''}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        className={errors.description ? 'border-destructive' : ''}
                                                        placeholder="Description détaillée de l'objet"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="history">
                                                        Histoire
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.history} />
                                                    </Label>
                                                    <Textarea
                                                        id="history"
                                                        value={formData.history || ''}
                                                        onChange={(e) => handleInputChange('history', e.target.value)}
                                                        placeholder="Histoire de l'objet"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="inscription">
                                                        Inscriptions
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.inscription} />
                                                    </Label>
                                                    <Textarea
                                                        id="inscription"
                                                        value={formData.inscription || ''}
                                                        onChange={(e) => handleInputChange('inscription', e.target.value)}
                                                        placeholder="Inscriptions présentes sur l'objet"
                                                        rows={3}
                                                    />
                                                </div>

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

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        États de conservation
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.conservationStates} />
                                                    </Label>
                                                    {Array.isArray(conservationStates) && conservationStates.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={conservationStates.filter(c => c && c.id && c.name).map(c => ({ id: c.id, name: c.name }))}
                                                            selectedValues={formData.conservationStates || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, conservationStates: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Matériaux
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.materials} />
                                                    </Label>
                                                    {Array.isArray(materials) && materials.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={materials.filter(m => m && m.id && m.name).map(m => ({ id: m.id, name: m.name }))}
                                                            selectedValues={formData.materials || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, materials: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Techniques
                                                        <InfoTooltip content={tooltipTexts.mobiliersImages.techniques} />
                                                    </Label>
                                                    {Array.isArray(furnituresTechniques) && furnituresTechniques.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={furnituresTechniques.filter(t => t && t.id && t.name).map(t => ({ id: t.id, name: t.name }))}
                                                            selectedValues={formData.techniques || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, techniques: selected }))}
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

                                                <div>
                                                    <Label>Protection</Label>
                                                    <div className="space-y-4 mt-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="protected"
                                                                checked={formData.protected || false}
                                                                onCheckedChange={(checked) => handleInputChange('protected', checked)}
                                                            />
                                                            <Label htmlFor="protected" className="flex items-center gap-1 text-sm">
                                                                Objet protégé
                                                                <InfoTooltip content={tooltipTexts.mobiliersImages.protected} />
                                                            </Label>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="protectionComment" className="flex items-center gap-1 text-sm">
                                                                Commentaire de protection
                                                                <InfoTooltip content={tooltipTexts.mobiliersImages.protectionComment} />
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
                                            </>
                                        )}

                                        {/* Personnes Morales */}
                                        {formData.category === 'personnes_morales' && (
                                            <>
                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Types d'organisation
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.natures} />
                                                    </Label>
                                                    {Array.isArray(legalEntityNatures) && legalEntityNatures.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={legalEntityNatures.filter(n => n && n.id && n.name).map(n => ({ id: n.id, name: n.name }))}
                                                            selectedValues={formData.natures || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, natures: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="comment">
                                                        Commentaire
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.comment} />
                                                    </Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={formData.comment || ''}
                                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                                        placeholder="Commentaire sur l'organisation"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="history">
                                                        Histoire
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.history} />
                                                    </Label>
                                                    <Textarea
                                                        id="history"
                                                        value={formData.history || ''}
                                                        onChange={(e) => handleInputChange('history', e.target.value)}
                                                        placeholder="Histoire de l'organisation"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="functioningDescription">
                                                        Fonctionnement
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.functioningDescription} />
                                                    </Label>
                                                    <Textarea
                                                        id="functioningDescription"
                                                        value={formData.functioningDescription || ''}
                                                        onChange={(e) => handleInputChange('functioningDescription', e.target.value)}
                                                        placeholder="Comment l'organisation fonctionne"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="socialParticipation">
                                                        Participation à la vie sociale
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.socialParticipation} />
                                                    </Label>
                                                    <Textarea
                                                        id="socialParticipation"
                                                        value={formData.socialParticipation || ''}
                                                        onChange={(e) => handleInputChange('socialParticipation', e.target.value)}
                                                        placeholder="Rôle dans la société"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1" htmlFor="relatedObjects">
                                                        Objets liés
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.relatedObjects} />
                                                    </Label>
                                                    <Textarea
                                                        id="relatedObjects"
                                                        value={formData.relatedObjects || ''}
                                                        onChange={(e) => handleInputChange('relatedObjects', e.target.value)}
                                                        placeholder="Objets en relation avec l'organisation"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="simpleMention"
                                                        checked={formData.simpleMention}
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
                                                        checked={formData.foundationAct}
                                                        onCheckedChange={(checked) => handleInputChange('foundationAct', checked)}
                                                    />
                                                    <Label className="flex items-center gap-1 text-sm" htmlFor="foundationAct">
                                                        Acte de fondation
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.foundationAct} />
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="statutesText"
                                                        checked={formData.statutesText}
                                                        onCheckedChange={(checked) => handleInputChange('statutesText', checked)}
                                                    />
                                                    <Label htmlFor="statutesText" className="flex items-center gap-1 text-sm">
                                                        Texte des statuts
                                                        <InfoTooltip content={tooltipTexts.personnesMorales.statutesText} />
                                                    </Label>
                                                </div>

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
                                            </>
                                        )}

                                        {/* Personnes Physiques */}
                                        {formData.category === 'personnes_physiques' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
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

                                                <div>
                                                    <Label htmlFor="attestation" className="flex items-center gap-1">
                                                        Attestation
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.attestation} />
                                                    </Label>
                                                    <Textarea
                                                        id="attestation"
                                                        value={formData.attestation || ''}
                                                        onChange={(e) => handleInputChange('attestation', e.target.value)}
                                                        placeholder="Attestation concernant la personne"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="biographicalElements" className="flex items-center gap-1">
                                                        Éléments biographiques
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.biographicalElements} />
                                                    </Label>
                                                    <Textarea
                                                        id="biographicalElements"
                                                        value={formData.biographicalElements || ''}
                                                        onChange={(e) => handleInputChange('biographicalElements', e.target.value)}
                                                        placeholder="Informations biographiques"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="pilgrimage" className="flex items-center gap-1">
                                                        Pèlerinage
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.pilgrimage} />
                                                    </Label>
                                                    <Textarea
                                                        id="pilgrimage"
                                                        value={formData.pilgrimage || ''}
                                                        onChange={(e) => handleInputChange('pilgrimage', e.target.value)}
                                                        placeholder="Informations sur le pèlerinage"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="commutationVow" className="flex items-center gap-1">
                                                        Commutation de vœu
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.commutationVow} />
                                                    </Label>
                                                    <Textarea
                                                        id="commutationVow"
                                                        value={formData.commutationVow || ''}
                                                        onChange={(e) => handleInputChange('commutationVow', e.target.value)}
                                                        placeholder="Informations sur la commutation de vœu"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="eventNature" className="flex items-center gap-1">
                                                        Nature de l'événement
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.eventNature} />
                                                    </Label>
                                                    <Textarea
                                                        id="eventNature"
                                                        value={formData.eventNature || ''}
                                                        onChange={(e) => handleInputChange('eventNature', e.target.value)}
                                                        placeholder="Informations sur la nature de l'événement"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Périodes historiques
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.historicalPeriods} />
                                                    </Label>
                                                    {Array.isArray(historicalPeriods) && historicalPeriods.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={historicalPeriods.filter(h => h && h.id && h.name).map(h => ({ id: h.id, name: h.name }))}
                                                            selectedValues={formData.historicalPeriods || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, historicalPeriods: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Professions
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.professions} />
                                                    </Label>
                                                    {Array.isArray(professions) && professions.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={professions.filter(p => p && p.id && p.name).map(p => ({ id: p.id, name: p.name }))}
                                                            selectedValues={formData.professions || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, professions: selected }))}
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

                                                <div>
                                                    <Label className="flex items-center gap-1">
                                                        Modes de transport
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.transportModes} />
                                                    </Label>
                                                    {Array.isArray(travels) && travels.length > 0 ? (
                                                        <SearchableMultiSelect
                                                            options={travels.filter(t => t && t.id && t.name).map(t => ({ id: t.id, name: t.name }))}
                                                            selectedValues={formData.transportModes || []}
                                                            onChange={(selected) => setFormData(prev => ({ ...prev, transportModes: selected }))}
                                                            placeholder="Sélectionner des modes"
                                                            searchPlaceholder="Rechercher un mode..."
                                                            emptyMessage="Aucun mode trouvé"
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground mt-2">
                                                            Chargement des options...
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="comment" className="flex items-center gap-1">
                                                        Commentaire
                                                        <InfoTooltip content={tooltipTexts.personnesPhysiques.comment} />
                                                    </Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={formData.comment || ''}
                                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                                        placeholder="Commentaire sur la personne physique"
                                                        rows={3}
                                                    />
                                                </div>

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
                                            </>
                                        )}
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
                                                Recherchez et sélectionnez des fiches existantes à associer à cette nouvelle fiche
                                            </p>

                                            {/* Barre de recherche avec autocomplétion */}
                                            <div className="relative">
                                                <div className="relative">
                                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
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
                                                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
                                                        {isSearchingFiches && (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                <Search className="w-4 h-4 mx-auto mb-2 animate-spin" />
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
                                                                        <div className="font-medium">{fiche.title || 'Titre non disponible'}</div>
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
                                                                <Link className="w-4 h-4 text-muted-foreground" />
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
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Boutons de soumission */}
                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveDraft}
                                        disabled={isSubmittingForm}
                                    >
                                        {isSubmittingForm && isSavingDraft ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-4 h-4 mr-2" />
                                                Enregistrer comme brouillon
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmittingForm || !(formData.location.country &&
                                            formData.location.region && formData.location.department &&
                                            formData.location.commune)}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {isSubmittingForm && !isSavingDraft ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Soumission en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Soumettre la fiche
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Modal de gestion des erreurs d'upload d'images */}
                                <Dialog open={showImageErrorModal} onOpenChange={setShowImageErrorModal}>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                                {imageErrorType === '400' ? 'Erreur de chargement de l\'image' : 'Erreur interne'}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {imageErrorType === '400'
                                                    ? 'Votre image n\'a pas pu être chargée. Cela peut être dû à un format non supporté, une taille trop importante, ou un problème avec le fichier.'
                                                    : 'Une erreur interne est survenue lors du chargement de votre image. Veuillez réessayer plus tard ou contacter un administrateur si le problème persiste.'
                                                }
                                            </DialogDescription>
                                        </DialogHeader>

                                        {imageErrorType === '400' ? (
                                            <DialogFooter className="gap-2">
                                                <Button variant="outline" onClick={handleCancelSubmission}>
                                                    Annuler l'envoi
                                                </Button>
                                                <Button onClick={handleContinueWithoutImage}>
                                                    Continuer sans image
                                                </Button>
                                            </DialogFooter>
                                        ) : (
                                            <DialogFooter>
                                                <Button onClick={handleCancelSubmission}>
                                                    Fermer
                                                </Button>
                                            </DialogFooter>
                                        )}
                                    </DialogContent>
                                </Dialog>

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
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}