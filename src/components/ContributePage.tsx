import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, MapPin, Plus, X, CheckCircle, Users, Link, ChevronDown, Search, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { categories } from "../constants/filters";
import { sourceTypes } from "../constants/formConstants";
import { apiService, FilterOption, Country, Region, Department, Commune, ApiError, SearchRequestBody, SearchItem } from "../config/api";
import { User } from "../App";

interface ContributePageProps {
    user: User;
    onBack: () => void;
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
    image: File | null;
    imageCaption: string;
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
        image: null,
        imageCaption: '',
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
    const [openCountries, setOpenCountries] = useState(false);
    const [openRegions, setOpenRegions] = useState(false);
    const [openDepartments, setOpenDepartments] = useState(false);
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
        setOpenCountries(false);
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
        setOpenRegions(false);
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
        setOpenDepartments(false);
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

    const toggleArrayField = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const currentArray = (prev[field] as string[]) || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return {
                ...prev,
                [field]: newArray
            };
        });
    };

    const handleMultiSelectChange = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const currentArray = (prev[field] as string[]) || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return {
                ...prev,
                [field]: newArray
                    .map(x => Number(x))
                    .filter((value, index, self) => self.indexOf(value) === index),
            };
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.category) newErrors.category = 'La catégorie est requise';
        if (!formData.name.trim()) newErrors.name = 'Le nom/titre est requis';
        if ((formData.category === 'monuments_lieux' || formData.category === 'mobiliers_images') && !formData.description?.trim()) newErrors.description = 'La description est requise';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmittingForm(true);

        try {
            let mediaId: string | null = null;

            // Étape 1: Upload de l'image si présente
            if (formData.image) {
                try {
                    const uploadResponse = await apiService.uploadImage(formData.image, formData.imageCaption);
                    mediaId = uploadResponse.id;
                    toast.success('Image uploadée avec succès !');
                } catch (error) {
                    console.error('Erreur lors de l\'upload de l\'image:', error);

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

                    // Pour autres erreurs, continuer sans l'image
                    toast.error('Erreur lors de l\'upload de l\'image. La fiche sera soumise sans image.');
                }
            }

            // Étape 2: Soumission de la fiche
            await submitFormData(mediaId);

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

    const submitFormData = async (mediaId: string | null = null) => {
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
        if (formData.source.type) sourceComponents.push(`Type: ${formData.source.type}`);
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
                    medias: mediaId ? [mediaId] : [],
                    city: selectedCommune?.id || undefined, // Optionnel maintenant
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
                    linkedPersPhysiques
                };

                await apiService.submitMonumentLieu(submissionData);

                break;
          case 'mobiliers_images':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaId ? [mediaId] : [],
                    city: selectedCommune?.id || undefined, // Optionnel maintenant
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
                    linkedPersPhysiques
                };

                await apiService.submitMobilierImage(submissionData);

                break;
          case 'personnes_morales':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaId ? [mediaId] : [],
                    city: selectedCommune?.id || undefined, // Optionnel maintenant
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
                    linkedPersPhysiques
                };

                await apiService.submitPersonneMorale(submissionData);

                break;
          case 'personnes_physiques':
                submissionData = {
                    title: formData.name,
                    centuries: formData.centuries,
                    medias: mediaId ? [mediaId] : [],
                    city: selectedCommune?.id || undefined, // Optionnel maintenant
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
                    linkedPersMorales
                };

                await apiService.submitPersonnePhysique(submissionData);

                break;
        }

        setIsSubmitted(true);
        setIsSubmittingForm(false);
        toast.success('Fiche soumise avec succès !');
    };

    // Fonction pour continuer sans image (après erreur 400)
    const handleContinueWithoutImage = async () => {
        setShowImageErrorModal(false);
        setImageErrorType(null);

        try {
            await submitFormData(null);
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
            image: null,
            imageCaption: '',
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
    };

    // Composant réutilisable pour les selects multiples
    const MultiSelectField = ({
                                  options,
                                  selected,
                                  onSelectionChange,
                                  placeholder,
                                  label
                              }: {
        options: FilterOption[];
        selected: string[];
        onSelectionChange: (value: string) => void;
        placeholder: string;
        label: string;
    }) => {
        if (!Array.isArray(options) || options.length === 0) {
            return (
                <div>
                    <Label>{label}</Label>
                    <div className="text-sm text-muted-foreground mt-2">
                        Chargement des options...
                    </div>
                </div>
            );
        }

        return (
            <div>
                <Label>{label}</Label>
                <div className="space-y-3 mt-3">
                    <Select onValueChange={onSelectionChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {options.filter(option => option && option.id && option.name).map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={option.id}
                                    className={selected.includes(option.id) ? 'bg-accent text-accent-foreground' : ''}
                                >
                                    {option.name} {selected.includes(option.id) ? '✓' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selected.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selected.map((selectedId) => {
                                const option = options.find(o => o && o.id === selectedId);
                                return option ? (
                                    <Badge
                                        key={selectedId}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        {option.name}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => onSelectionChange(selectedId)}
                                        />
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
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
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-green-800 mb-4">
                                    Fiche soumise avec succès !
                                </h2>
                                <p className="text-green-700 mb-6 leading-relaxed">
                                    Votre contribution a été reçue et sera examinée par notre équipe d'administrateurs.
                                    Vous recevrez une notification par email une fois la fiche validée et publiée.
                                </p>
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
                <div className="max-w-4xl mx-auto">
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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Catégorie */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Catégorie</CardTitle>
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
                                            <Label htmlFor="name">Nom/Titre *</Label>
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
                                            <Label>Siècles</Label>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Sélectionnez les siècles concernés (optionnel)
                                            </p>
                                            {Array.isArray(centuries) && centuries.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {centuries.filter(century => century && century.id && century.name).map((century) => {
                                                        const isSelected = formData.centuries.includes(century.id);
                                                        return (
                                                            <Badge
                                                                key={century.id}
                                                                variant={isSelected ? "default" : "outline"}
                                                                className={`cursor-pointer ${
                                                                    isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                                                }`}
                                                                onClick={() => toggleArrayField('centuries', century.id)}
                                                            >
                                                                {century.name}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    Chargement des siècles...
                                                </div>
                                            )}
                                            {errors.centuries && <p className="text-destructive text-sm mt-2">{errors.centuries}</p>}
                                        </div>

                                        {/* Localisation */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <Label>Localisation</Label>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Pays */}
                                                <div className="relative">
                                                    <Label className="text-sm">Pays</Label>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between mt-1"
                                                        onClick={() => setOpenCountries(!openCountries)}
                                                    >
                            <span className="truncate">
                              {selectedCountry ? selectedCountry.name : 'Sélectionner un pays'}
                            </span>
                                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                                    </Button>

                                                    {openCountries && (
                                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
                                                            {countries.filter(country => country && country.id && country.name).map((country) => (
                                                                <div
                                                                    key={country.id}
                                                                    onClick={() => handleCountryChange(country)}
                                                                    className="p-3 hover:bg-accent rounded cursor-pointer border-b border-border last:border-b-0"
                                                                >
                                                                    <div className="font-medium">{country.name}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Régions */}
                                                <div className="relative">
                                                    <Label className="text-sm">Région</Label>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between mt-1"
                                                        onClick={() => setOpenRegions(!openRegions)}
                                                        disabled={!selectedCountry}
                                                    >
                            <span className="truncate">
                              {selectedRegion ? selectedRegion.name : 'Sélectionner une région'}
                            </span>
                                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                                    </Button>

                                                    {openRegions && selectedCountry && (
                                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
                                                            {getFilteredRegions().map((region) => (
                                                                <div
                                                                    key={region.id}
                                                                    onClick={() => handleRegionChange(region)}
                                                                    className="p-3 hover:bg-accent rounded cursor-pointer border-b border-border last:border-b-0"
                                                                >
                                                                    <div className="font-medium">{region.name}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Départements */}
                                                <div className="relative">
                                                    <Label className="text-sm">Département</Label>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between mt-1"
                                                        onClick={() => setOpenDepartments(!openDepartments)}
                                                        disabled={!selectedCountry}
                                                    >
                            <span className="truncate">
                              {selectedDepartment ? selectedDepartment.name : 'Sélectionner un département'}
                            </span>
                                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                                    </Button>

                                                    {openDepartments && selectedCountry && (
                                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
                                                            {getFilteredDepartments().map((department) => (
                                                                <div
                                                                    key={department.id}
                                                                    onClick={() => handleDepartmentChange(department)}
                                                                    className="p-3 hover:bg-accent rounded cursor-pointer border-b border-border last:border-b-0"
                                                                >
                                                                    <div className="font-medium">{department.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {department.region.name}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
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

                                            {/* Fermer les dropdowns quand on clique ailleurs */}
                                            {(openCountries || openRegions || openDepartments || showCommuneResults) && (
                                                <div
                                                    className="fixed inset-0 z-0"
                                                    onClick={() => {
                                                        setOpenCountries(false);
                                                        setOpenRegions(false);
                                                        setOpenDepartments(false);
                                                        setShowCommuneResults(false);
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Image */}
                                        <div>
                                            <Label htmlFor="image">Image</Label>
                                            <div className="space-y-4">
                                                <div>
                                                    <input
                                                        id="image"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="block w-full text-sm text-muted-foreground
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-medium
                              file:bg-primary file:text-primary-foreground
                              hover:file:bg-primary/90"
                                                    />
                                                    {formData.image && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            Fichier sélectionné: {formData.image.name}
                                                        </p>
                                                    )}
                                                </div>

                                              {formData.image && formData.image.name && (
                                                  <div>
                                                    <Label htmlFor="imageCaption" className="text-sm">Légende de l'image</Label>
                                                    <Textarea
                                                        id="imageCaption"
                                                        value={formData.imageCaption}
                                                        onChange={(e) => handleInputChange('imageCaption', e.target.value)}
                                                        placeholder="Décrivez ce que montre l'image..."
                                                        rows={2}
                                                    />
                                                  </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Thèmes */}
                                        <MultiSelectField
                                            options={themes}
                                            selected={formData.themes || []}
                                            onSelectionChange={(value) => handleMultiSelectChange('themes', value)}
                                            placeholder="Sélectionner un thème"
                                            label="Thèmes"
                                        />

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
                                            <Label>Source de l'information</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <Label htmlFor="sourceType" className="text-sm">Type de source</Label>
                                                    <Select onValueChange={(value) => handleSourceChange('type', value)}>
                                                        <SelectTrigger className={errors.sourceType ? 'border-destructive' : ''}>
                                                            <SelectValue placeholder="Sélectionner" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.isArray(sourceTypes) && sourceTypes.filter(type => type).map((type) => (
                                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.sourceType && <p className="text-destructive text-sm mt-1">{errors.sourceType}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="sourceAuthor" className="text-sm">Auteur</Label>
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

                                {/* Champs spécifiques */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations spécifiques</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Monuments & Lieux */}
                                        {formData.category === 'monuments_lieux' && (
                                            <>
                                                <MultiSelectField
                                                    options={buildingNatures}
                                                    selected={formData.natures || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('natures', value)}
                                                    placeholder="Sélectionner un type d'élément"
                                                    label="Types d'éléments"
                                                />

                                                <div>
                                                    <Label htmlFor="description">Description *</Label>
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
                                                    <Label htmlFor="history">Histoire</Label>
                                                    <Textarea
                                                        id="history"
                                                        value={formData.history || ''}
                                                        onChange={(e) => handleInputChange('history', e.target.value)}
                                                        placeholder="Histoire et contexte historique"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="bibliography">Bibliographie</Label>
                                                    <Textarea
                                                        id="bibliography"
                                                        value={formData.bibliography || ''}
                                                        onChange={(e) => handleInputChange('bibliography', e.target.value)}
                                                        placeholder="Références bibliographiques"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Coordonnées GPS</Label>
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div>
                                                            <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                                                            <Input
                                                                id="latitude"
                                                                value={formData.coordinates?.latitude || ''}
                                                                onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                                                                placeholder="Ex: 43.12345"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                                                            <Input
                                                                id="longitude"
                                                                value={formData.coordinates?.longitude || ''}
                                                                onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                                                                placeholder="Ex: 1.12345"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <MultiSelectField
                                                    options={conservationStates}
                                                    selected={formData.conservationStates || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('conservationStates', value)}
                                                    placeholder="Sélectionner un état de conservation"
                                                    label="États de conservation"
                                                />

                                                <MultiSelectField
                                                    options={materials}
                                                    selected={formData.materials || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('materials', value)}
                                                    placeholder="Sélectionner un matériau"
                                                    label="Matériaux"
                                                />

                                                <div>
                                                    <Label>Protection</Label>
                                                    <div className="space-y-4 mt-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="protected"
                                                                checked={formData.protected || false}
                                                                onCheckedChange={(checked) => handleInputChange('protected', checked)}
                                                            />
                                                            <Label htmlFor="protected" className="text-sm">Monument protégé</Label>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="protectionComment" className="text-sm">Commentaire de protection</Label>
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
                                            </>
                                        )}

                                        {/* Mobiliers & Images */}
                                        {formData.category === 'mobiliers_images' && (
                                            <>
                                                <MultiSelectField
                                                    options={furnituresNatures}
                                                    selected={formData.natures || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('natures', value)}
                                                    placeholder="Sélectionner un type d'élément"
                                                    label="Types d'éléments"
                                                />

                                                <div>
                                                    <Label htmlFor="description">Description</Label>
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
                                                    <Label htmlFor="history">Histoire</Label>
                                                    <Textarea
                                                        id="history"
                                                        value={formData.history || ''}
                                                        onChange={(e) => handleInputChange('history', e.target.value)}
                                                        placeholder="Histoire de l'objet"
                                                        rows={3}
                                                    />
                                                </div>

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

                                                <div>
                                                    <Label htmlFor="currentLocation">Emplacement actuel</Label>
                                                    <Input
                                                        id="currentLocation"
                                                        value={formData.currentLocation || ''}
                                                        onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                                                        placeholder="Où se trouve actuellement l'objet"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="originalLocation">Emplacement d'origine</Label>
                                                    <Input
                                                        id="originalLocation"
                                                        value={formData.originalLocation || ''}
                                                        onChange={(e) => handleInputChange('originalLocation', e.target.value)}
                                                        placeholder="Emplacement d'origine de l'objet"
                                                    />
                                                </div>
                                                
                                                <MultiSelectField
                                                    options={conservationStates}
                                                    selected={formData.conservationStates || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('conservationStates', value)}
                                                    placeholder="Sélectionner un état de conservation"
                                                    label="États de conservation"
                                                />

                                                <MultiSelectField
                                                    options={materials}
                                                    selected={formData.materials || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('materials', value)}
                                                    placeholder="Sélectionner un matériau"
                                                    label="Matériaux"
                                                />

                                                <MultiSelectField
                                                    options={furnituresTechniques}
                                                    selected={formData.techniques || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('techniques', value)}
                                                    placeholder="Sélectionner une technique"
                                                    label="Techniques"
                                                />

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
                                                            <Label htmlFor="protectionComment" className="text-sm">Commentaire de protection</Label>
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
                                            </>
                                        )}

                                        {/* Personnes Morales */}
                                        {formData.category === 'personnes_morales' && (
                                            <>
                                                <MultiSelectField
                                                    options={legalEntityNatures}
                                                    selected={formData.natures || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('natures', value)}
                                                    placeholder="Sélectionner un type d'organisation"
                                                    label="Types d'organisation"
                                                />

                                                <div>
                                                    <Label htmlFor="comment">Commentaire</Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={formData.comment || ''}
                                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                                        placeholder="Commentaire sur l'organisation"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="history">Histoire</Label>
                                                    <Textarea
                                                        id="history"
                                                        value={formData.history || ''}
                                                        onChange={(e) => handleInputChange('history', e.target.value)}
                                                        placeholder="Histoire de l'organisation"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="functioningDescription">Fonctionnement</Label>
                                                    <Textarea
                                                        id="functioningDescription"
                                                        value={formData.functioningDescription || ''}
                                                        onChange={(e) => handleInputChange('functioningDescription', e.target.value)}
                                                        placeholder="Comment l'organisation fonctionne"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="socialParticipation">Participation à la vie sociale</Label>
                                                    <Textarea
                                                        id="socialParticipation"
                                                        value={formData.socialParticipation || ''}
                                                        onChange={(e) => handleInputChange('socialParticipation', e.target.value)}
                                                        placeholder="Rôle dans la société"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="relatedObjects">Objets liés</Label>
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
                                                    <Label htmlFor="simpleMention" className="text-sm">Simple mention</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="foundationAct"
                                                        checked={formData.foundationAct}
                                                        onCheckedChange={(checked) => handleInputChange('foundationAct', checked)}
                                                    />
                                                    <Label htmlFor="foundationAct" className="text-sm">Acte de fondation</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="statutesText"
                                                        checked={formData.statutesText}
                                                        onCheckedChange={(checked) => handleInputChange('statutesText', checked)}
                                                    />
                                                    <Label htmlFor="statutesText" className="text-sm">Texte des statuts</Label>
                                                </div>

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
                                            </>
                                        )}

                                        {/* Personnes Physiques */}
                                        {formData.category === 'personnes_physiques' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
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

                                                <div>
                                                    <Label htmlFor="attestation">Attestation</Label>
                                                    <Textarea
                                                        id="attestation"
                                                        value={formData.attestation || ''}
                                                        onChange={(e) => handleInputChange('attestation', e.target.value)}
                                                        placeholder="Attestation concernant la personne"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="biographicalElements">Éléments biographiques</Label>
                                                    <Textarea
                                                        id="biographicalElements"
                                                        value={formData.biographicalElements || ''}
                                                        onChange={(e) => handleInputChange('biographicalElements', e.target.value)}
                                                        placeholder="Informations biographiques"
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="pilgrimage">Pèlerinage</Label>
                                                    <Textarea
                                                        id="pilgrimage"
                                                        value={formData.pilgrimage || ''}
                                                        onChange={(e) => handleInputChange('pilgrimage', e.target.value)}
                                                        placeholder="Informations sur le pèlerinage"
                                                        rows={3}
                                                    />
                                                </div>

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

                                                <div>
                                                    <Label htmlFor="eventNature">Nature de l'événement</Label>
                                                    <Textarea
                                                        id="eventNature"
                                                        value={formData.eventNature || ''}
                                                        onChange={(e) => handleInputChange('eventNature', e.target.value)}
                                                        placeholder="Informations sur la nature de l'événement"
                                                        rows={3}
                                                    />
                                                </div>

                                                <MultiSelectField
                                                    options={historicalPeriods}
                                                    selected={formData.historicalPeriods || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('historicalPeriods', value)}
                                                    placeholder="Sélectionner une période historique"
                                                    label="Périodes historiques"
                                                />

                                                <MultiSelectField
                                                    options={professions}
                                                    selected={formData.professions || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('professions', value)}
                                                    placeholder="Sélectionner une profession"
                                                    label="Professions"
                                                />

                                                <MultiSelectField
                                                    options={travels}
                                                    selected={formData.transportModes || []}
                                                    onSelectionChange={(value) => handleMultiSelectChange('transportModes', value)}
                                                    placeholder="Sélectionner un mode de transport"
                                                    label="Modes de transport"
                                                />

                                                <div>
                                                    <Label htmlFor="comment">Commentaire</Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={formData.comment || ''}
                                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                                        placeholder="Commentaire sur la personne physique"
                                                        rows={3}
                                                    />
                                                </div>

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
                                            </>
                                        )}
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

                                {/* Bouton de soumission */}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isSubmittingForm}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {isSubmittingForm ? (
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
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}