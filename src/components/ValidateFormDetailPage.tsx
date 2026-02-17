import {useState, useEffect} from "react";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    Shield,
    Clock,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    CheckCircle,
    XCircle,
    Check,
    X,
    Edit,
    FilePlus,
    AlertCircle
} from "lucide-react";
import {Button} from "./ui/button";
import {Badge} from "./ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {AspectRatio} from "./ui/aspect-ratio";
import {ImageWithFallback} from "./ImageWithFallback.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./ui/dialog";
import {HtmlContent} from "./HtmlContent";
import {
    apiService,
    ApiError,
    DetailResult,
    MonumentLieuDetail,
    MobilierImageDetail,
    PersonneMoraleDetail,
    PersonnePhysiqueDetail
} from "../config/api";
import {getMediaImageUrl} from "../utils/searchUtils";
import {toast} from "sonner";
import {ImageModal} from "./modals/ImageModal.tsx";

interface ValidateFormDetailPageProps {
    formId: string;
    formSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques';
    onBack: () => void;
    onValidated: () => void;
    onSessionExpired: (message?: string) => void;
    onViewDetail: (resultId: string, source?: string) => void;
}

// Fonction pour obtenir le badge de type selon la source
function getTypeBadge(source: string) {
    switch (source) {
        case 'monuments_lieux':
            return {label: 'Monument & Lieu', color: 'bg-blue-500 text-white'};
        case 'mobiliers_images':
            return {label: 'Mobilier & Image', color: 'bg-green-500 text-white'};
        case 'personnes_morales':
            return {label: 'Personne Morale', color: 'bg-purple-500 text-white'};
        case 'personnes_physiques':
            return {label: 'Personne Physique', color: 'bg-orange-500 text-white'};
        default:
            return {label: 'Fiche', color: 'bg-gray-500 text-white'};
    }
}

export function ValidateFormDetailPage({
                                           formId,
                                           formSource,
                                           onBack,
                                           onValidated,
                                           onSessionExpired,
                                           onViewDetail
                                       }: ValidateFormDetailPageProps) {
    const [result, setResult] = useState<DetailResult | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour la validation
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationType, setValidationType] = useState<'activate' | 'reject'>('activate');
    const [isValidating, setIsValidating] = useState(false);

    // États pour les fiches liées
    const [relatedRecords, setRelatedRecords] = useState<{ [key: string]: any }>({});
    const [loadingRelated, setLoadingRelated] = useState(false);

    // États pour la fiche originale (parent) en cas de modification
    const [parentRecord, setParentRecord] = useState<DetailResult | null>(null);
    const [loadingParent, setLoadingParent] = useState(false);

    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    // Scroll vers le haut lors du chargement
    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [formId]);

    useEffect(() => {
        const loadDetailResult = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const detailResult = await apiService.getRecordDetail(formSource, formId);
                setResult(detailResult);

                // Charger les fiches liées
                await loadRelatedRecords(detailResult);

                // Charger la fiche originale si c'est une modification
                if ('parent_id' in detailResult && detailResult.parent_id) {
                    await loadParentRecord(detailResult.parent_id as number);
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la fiche:', error);
                if (error instanceof ApiError) {
                    if (error.status === 401) {
                        onSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
                        return;
                    } else if (error.status === 404) {
                        setError(`Fiche non trouvée pour l'ID: ${formId}`);
                    } else {
                        setError('Une erreur est survenue lors du chargement de la fiche.');
                    }
                } else {
                    setError('Une erreur réseau est survenue.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadDetailResult();
    }, [formId, formSource, onSessionExpired]);

    // Fonction pour charger les fiches liées
    const loadRelatedRecords = async (record: DetailResult) => {
        setLoadingRelated(true);
        const relatedData: { [key: string]: any } = {};

        try {
            // Récupérer les IDs des fiches liées selon le type de fiche
            const relatedIds = getRelatedIds(record);

            // Charger chaque fiche liée
            for (const [source, ids] of Object.entries(relatedIds)) {
                if (ids && ids.length > 0) {
                    relatedData[source] = [];

                    for (const id of ids) {
                        try {
                            const relatedRecord = await apiService.getRecordDetail(
                                source as 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques',
                                id.toString()
                            );
                            relatedData[source].push(relatedRecord);
                        } catch (error) {
                            console.warn(`Impossible de charger la fiche liée ${source}:${id}`, error);
                        }
                    }
                }
            }

            setRelatedRecords(relatedData);
        } catch (error) {
            console.error('Erreur lors du chargement des fiches liées:', error);
        } finally {
            setLoadingRelated(false);
        }
    };

    // Fonction pour charger la fiche originale (parent) en cas de modification
    const loadParentRecord = async (parentId: number) => {
        setLoadingParent(true);
        try {
            const parentData = await apiService.getRecordDetail(formSource, parentId.toString());
            setParentRecord(parentData);
        } catch (error) {
            console.warn('Impossible de charger la fiche originale:', error);
            // Ne pas bloquer l'affichage si on ne peut pas charger le parent
        } finally {
            setLoadingParent(false);
        }
    };

    // Fonction pour extraire les IDs des fiches liées selon le type
    const getRelatedIds = (record: DetailResult) => {
        const relatedIds: { [key: string]: number[] } = {};

        if (formSource === 'monuments_lieux') {
            const monument = record as MonumentLieuDetail;
            if (monument.linked_furniture_images?.length) {
                relatedIds.mobiliers_images = monument.linked_furniture_images;
            }
            if (monument.linked_individuals?.length) {
                relatedIds.personnes_physiques = monument.linked_individuals;
            }
            if (monument.linked_legal_entities?.length) {
                relatedIds.personnes_morales = monument.linked_legal_entities;
            }
        } else if (formSource === 'mobiliers_images') {
            const mobilier = record as MobilierImageDetail;
            if (mobilier.linked_monuments_places?.length) {
                relatedIds.monuments_lieux = mobilier.linked_monuments_places;
            }
            if (mobilier.linked_individuals?.length) {
                relatedIds.personnes_physiques = mobilier.linked_individuals;
            }
            if (mobilier.linked_legal_entities?.length) {
                relatedIds.personnes_morales = mobilier.linked_legal_entities;
            }
        } else if (formSource === 'personnes_morales') {
            const personne = record as PersonneMoraleDetail;
            if (personne.linked_monuments_places?.length) {
                relatedIds.monuments_lieux = personne.linked_monuments_places;
            }
            if (personne.linked_furniture_images?.length) {
                relatedIds.mobiliers_images = personne.linked_furniture_images;
            }
            if (personne.linked_individuals?.length) {
                relatedIds.personnes_physiques = personne.linked_individuals;
            }
        } else if (formSource === 'personnes_physiques') {
            const personne = record as PersonnePhysiqueDetail;
            if (personne.linked_monuments_places?.length) {
                relatedIds.monuments_lieux = personne.linked_monuments_places;
            }
            if (personne.linked_furniture_images?.length) {
                relatedIds.mobiliers_images = personne.linked_furniture_images;
            }
            if (personne.linked_legal_entities?.length) {
                relatedIds.personnes_morales = personne.linked_legal_entities;
            }
        }

        return relatedIds;
    };

    const handleValidation = (type: 'activate' | 'reject') => {
        setValidationType(type);
        setShowValidationModal(true);
    };

    const confirmValidation = async () => {
        if (!result) return;

        setIsValidating(true);
        try {
            await apiService.validateForm(
                formSource,
                formId,
                validationType
            );

            if (validationType === 'activate') {
                toast.success('Fiche approuvée avec succès');
            } else {
                toast.success('Fiche rejetée avec succès');
            }

            setShowValidationModal(false);

            // Notifier le parent que la validation est terminée
            onValidated();

        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    onSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
                    return;
                } else if (error.status === 403) {
                    toast.error("Vous n'avez pas les permissions nécessaires pour cette action.");
                    return;
                } else if (error.status === 404) {
                    toast.error("Cette fiche n'existe plus ou a déjà été traitée.");
                    onBack(); // Retourner à la liste
                    return;
                }
            }

            toast.error(
                validationType === 'activate'
                    ? "Erreur lors de l'approbation de la fiche"
                    : "Erreur lors du rejet de la fiche"
            );
            console.error('Erreur lors de la validation de la fiche:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // États de chargement et d'erreur
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-medium text-muted-foreground">
                        Chargement de la fiche...
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
                    <h3 className="text-xl font-medium text-destructive mb-2">
                        {error || 'Fiche non trouvée'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {error || `Aucune fiche trouvée pour l'ID: ${formId}`}
                    </p>
                    <Button onClick={onBack}>Retour à la liste</Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Fonction pour obtenir le titre selon le type de fiche
    const getTitle = (record: DetailResult | null = result) => {
        if (!record) return '';

        if (formSource === 'personnes_physiques') {
            return (record as PersonnePhysiqueDetail).firstname;
        }
        return "title" in record ? record.title : '';
    };

    // Fonction pour déterminer si c'est une modification ou une création
    const isModification = () => {
        return result && 'parent_id' in result && result.parent_id !== undefined && result.parent_id !== null;
    };

    // Fonction pour obtenir la description selon le type de fiche
    const getDescription = () => {
        if (!result) return '';

        if (formSource === 'personnes_morales') {
            return (result as PersonneMoraleDetail).comment || '';
        } else if (formSource === 'personnes_physiques') {
            return (result as PersonnePhysiqueDetail).comment || '';
        }
        return (result as MonumentLieuDetail | MobilierImageDetail).description || '';
    };

    // Fonction pour obtenir l'histoire selon le type de fiche
    const getHistory = () => {
        if (!result) return '';

        if (formSource === 'personnes_morales') {
            return (result as PersonneMoraleDetail).history || '';
        } else if (formSource === 'monuments_lieux' || formSource === 'mobiliers_images') {
            return (result as MonumentLieuDetail | MobilierImageDetail).history || '';
        }
        return '';
    };

    // Fonction pour obtenir la géolocalisation
    const getGeoLocation = () => {
        if (!result || formSource !== 'monuments_lieux') return null;
        return (result as MonumentLieuDetail).geolocalisation;
    };

    // Fonction pour vérifier si les contributeurs existent et ne sont pas vides
    const hasContributors = () => {
        return result?.contributors && result.contributors.trim() !== '';
    };

    // Fonction pour obtenir la description courte (localisation + siècles)
    const getShortDescription = () => {
        const parts = [];

        // Ajouter la localisation
        if (result?.city || result?.department || result?.region || result?.country) {
            const locationParts = [];
            if (result.city && result.city.name) locationParts.push(result.city.name);
            if (result.department && result.department.name) locationParts.push(result.department.name);
            if (result.region && result.region.name) locationParts.push(result.region.name);
            if (result.country && result.country.name) locationParts.push(result.country.name);

            if (locationParts.length > 0) {
                parts.push(locationParts.join(', '));
            }
        }

        // Ajouter les siècles
        if (result?.centuries && result.centuries.length > 0) {
            const centuriesText = result.centuries.map(o => o.name).join(', ');
            parts.push(centuriesText);
        }

        return parts.length > 0 ? parts.join(' • ') : '';
    };

    // Gestion des images
    const allImages = result.medias || [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // Fonction pour obtenir la légende de l'image actuelle
    const getCurrentImageCaption = () => {
        if (allImages.length > 0 && allImages[currentImageIndex]) {
            return allImages[currentImageIndex].title;
        }
        return `Image de ${getTitle()}`;
    };

    // Fonction pour ouvrir la modal d'image
    const handleImageClick = (index: number) => {
        setModalImageIndex(index);
        setShowImageModal(true);
    };

    // Préparer les images pour la modal
    const modalImages = allImages.map(media => ({
        url: getMediaImageUrl(media.id),
        title: media.title || `Image de ${getTitle()}`
    }));

    // Composant pour l'affichage standardisé des informations techniques
    const TechnicalInfoItem = ({label, children, className = ""}: {
        label: string;
        children: React.ReactNode;
        className?: string
    }) => (
        <div className={`space-y-2 ${className}`}>
            <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
            <div className="text-sm text-foreground">{children}</div>
        </div>
    );

    const TechnicalBadgeList = ({items}: { items: string[] }) => (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <Badge key={item} variant="outline" className="text-xs bg-muted/50 hover:bg-muted">
                    {item}
                </Badge>
            ))}
        </div>
    );

    const TechnicalSection = ({title, children, className = ""}: {
        title: string;
        children: React.ReactNode;
        className?: string
    }) => (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );

    // Fonction pour rendre les informations de la sidebar selon le type
    const renderSidebarInfo = () => {
        switch (formSource) {
            case 'mobiliers_images':
                return renderMobilierSidebarInfo();
            case 'personnes_morales':
                return renderPersonneMoraleSidebarInfo();
            case 'monuments_lieux':
                return renderMonumentSidebarInfo();
            case 'personnes_physiques':
                return renderPersonnePhysiqueSidebarInfo();
            default:
                return null;
        }
    };

    const renderMobilierSidebarInfo = () => {
        const mobilier = result as MobilierImageDetail;

        return (
            <>
                {/* Types d'éléments */}
                {mobilier.natures && mobilier.natures.length > 0 && (
                    <TechnicalInfoItem label="Types d'éléments">
                        <TechnicalBadgeList items={mobilier.natures.map(o => o.name)}/>
                    </TechnicalInfoItem>
                )}

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city.name}</div>}
                            {result.department && <div>{result.department.name}</div>}
                            {result.region && <div>{result.region.name}</div>}
                            {result.country && <div>{result.country.name}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Emplacement actuel */}
                {mobilier.conservation_place && (
                    <TechnicalInfoItem label="Emplacement actuel">
                        <span>{mobilier.conservation_place}</span>
                    </TechnicalInfoItem>
                )}

                {/* Contributeur */}
                {hasContributors() && (
                    <TechnicalInfoItem label="Contributeur">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground"/>
                            <span>{result.contributors}</span>
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Auteur de la fiche */}
                {result.authors && result.authors.length > 0 && (
                    <TechnicalInfoItem label="Auteur de la fiche">
                        <div className="flex flex-wrap gap-1">
                            {result.authors.map((author) => (
                                <Badge key={author.name} variant="secondary" className="text-xs">
                                    {author.name}
                                </Badge>
                            ))}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Dates */}
                <TechnicalInfoItem label="Dates">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Créée le {formatDate(result.creation_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Mise à jour le {formatDate(result.update_date)}</span>
                        </div>
                    </div>
                </TechnicalInfoItem>
            </>
        );
    };

    const renderPersonneMoraleSidebarInfo = () => {
        const personne = result as PersonneMoraleDetail;

        return (
            <>
                {/* Types d'organisation */}
                {personne.natures && personne.natures.length > 0 && (
                    <TechnicalInfoItem label="Types d'organisation">
                        <TechnicalBadgeList items={personne.natures.map(o => o.name)}/>
                    </TechnicalInfoItem>
                )}

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city.name}</div>}
                            {result.department && <div>{result.department.name}</div>}
                            {result.region && <div>{result.region.name}</div>}
                            {result.country && <div>{result.country.name}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Contributeur */}
                {hasContributors() && (
                    <TechnicalInfoItem label="Contributeur">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground"/>
                            <span>{result.contributors}</span>
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Auteur de la fiche */}
                {result.authors && result.authors.length > 0 && (
                    <TechnicalInfoItem label="Auteur de la fiche">
                        <div className="flex flex-wrap gap-1">
                            {result.authors.map((author) => (
                                <Badge key={author.name} variant="secondary" className="text-xs">
                                    {author.name}
                                </Badge>
                            ))}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Dates */}
                <TechnicalInfoItem label="Dates">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Créée le {formatDate(result.creation_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Mise à jour le {formatDate(result.update_date)}</span>
                        </div>
                    </div>
                </TechnicalInfoItem>
            </>
        );
    };

    const renderMonumentSidebarInfo = () => {
        const monument = result as MonumentLieuDetail;

        return (
            <>
                {/* Types d'éléments */}
                {monument.natures && monument.natures.length > 0 && (
                    <TechnicalInfoItem label="Types d'éléments">
                        <TechnicalBadgeList items={monument.natures.map(o => o.name)}/>
                    </TechnicalInfoItem>
                )}

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city.name}</div>}
                            {result.department && <div>{result.department.name}</div>}
                            {result.region && <div>{result.region.name}</div>}
                            {result.country && <div>{result.country.name}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Coordonnées GPS */}
                {getGeoLocation() && (
                    <TechnicalInfoItem label="Coordonnées GPS">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground"/>
                            <span>{getGeoLocation()}</span>
                            <Button variant="ghost" size="sm" asChild>
                                <a
                                    href={`https://maps.google.com/?q=${getGeoLocation()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3"/>
                                    Voir
                                </a>
                            </Button>
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Contributeur */}
                {hasContributors() && (
                    <TechnicalInfoItem label="Contributeur">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground"/>
                            <span>{result.contributors}</span>
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Auteur de la fiche */}
                {result.authors && result.authors.length > 0 && (
                    <TechnicalInfoItem label="Auteur de la fiche">
                        <div className="flex flex-wrap gap-1">
                            {result.authors.map((author) => (
                                <Badge key={author.name} variant="secondary" className="text-xs">
                                    {author.name}
                                </Badge>
                            ))}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Dates */}
                <TechnicalInfoItem label="Dates">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Créée le {formatDate(result.creation_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Mise à jour le {formatDate(result.update_date)}</span>
                        </div>
                    </div>
                </TechnicalInfoItem>
            </>
        );
    };

    const renderPersonnePhysiqueSidebarInfo = () => {
        const personne = result as PersonnePhysiqueDetail;

        return (
            <>
                {/* Identité */}
                <TechnicalInfoItem label="Identité">
                    <span>{personne.firstname}</span>
                </TechnicalInfoItem>

                {/* Professions */}
                {personne.professions && personne.professions.length > 0 && (
                    <TechnicalInfoItem label="Professions">
                        <TechnicalBadgeList items={personne.professions.map(o => o.name)}/>
                    </TechnicalInfoItem>
                )}

                {/* Modes de transport */}
                {personne.travels && personne.travels.length > 0 && (
                    <TechnicalInfoItem label="Modes de transport">
                        <TechnicalBadgeList items={personne.travels.map(o => o.name)}/>
                    </TechnicalInfoItem>
                )}

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city.name}</div>}
                            {result.department && <div>{result.department.name}</div>}
                            {result.region && <div>{result.region.name}</div>}
                            {result.country && <div>{result.country.name}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Siècles */}
                {result.centuries && result.centuries.length > 0 && (
                    <TechnicalInfoItem label="Siècles">
                        <TechnicalBadgeList items={result.centuries.map(o => o.name)}/>
                    </TechnicalInfoItem>
                )}

                {/* Contributeur */}
                {hasContributors() && (
                    <TechnicalInfoItem label="Contributeur">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground"/>
                            <span>{result.contributors}</span>
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Auteur de la fiche */}
                {result.authors && result.authors.length > 0 && (
                    <TechnicalInfoItem label="Auteur de la fiche">
                        <div className="flex flex-wrap gap-1">
                            {result.authors.map((author) => (
                                <Badge key={author.name} variant="secondary" className="text-xs">
                                    {author.name}
                                </Badge>
                            ))}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Dates de création/modification */}
                <TechnicalInfoItem label="Dates">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Créée le {formatDate(result.creation_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground"/>
                            <span>Mise à jour le {formatDate(result.update_date)}</span>
                        </div>
                    </div>
                </TechnicalInfoItem>
            </>
        );
    };

    // Fonction pour rendre les sections de contenu selon le type
    const renderContentSections = () => {
        switch (formSource) {
            case 'mobiliers_images':
                return renderMobilierSections();
            case 'personnes_morales':
                return renderPersonneMoraleSections();
            case 'monuments_lieux':
                return renderMonumentSections();
            case 'personnes_physiques':
                return renderPersonnePhysiqueSections();
            default:
                return [];
        }
    };

    const renderMobilierSections = () => {
        const mobilier = result as MobilierImageDetail;
        const sections = [];

        // Description
        if (getDescription()) {
            sections.push(
                <TechnicalSection key="description" title="Description">
                    <HtmlContent content={getDescription()} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Histoire
        if (getHistory()) {
            sections.push(
                <TechnicalSection key="history" title="Histoire">
                    <HtmlContent content={getHistory()} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Inscriptions
        if (mobilier.inscriptions) {
            sections.push(
                <TechnicalSection key="inscriptions" title="Inscriptions">
                    <HtmlContent content={mobilier.inscriptions} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                </TechnicalSection>
            );
        }

        // Informations techniques
        const hasTechnicalInfo = result.centuries?.length || mobilier.origin_place ||
            mobilier.protected !== undefined || mobilier.protection_comment ||
            mobilier.materials?.length || mobilier.conservation?.length ||
            mobilier.techniques?.length || result.themes?.length ||
            mobilier.sources || mobilier.bibliography;

        if (hasTechnicalInfo) {
            sections.push(
                <TechnicalSection key="technical" title="Informations techniques">
                    {/* Siècles */}
                    {result.centuries && result.centuries.length > 0 && (
                        <TechnicalInfoItem label="Siècles">
                            <TechnicalBadgeList items={result.centuries.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Lieu d'origine */}
                    {mobilier.origin_place && (
                        <TechnicalInfoItem label="Lieu d'origine">
                            <span>{mobilier.origin_place}</span>
                        </TechnicalInfoItem>
                    )}

                    {/* Protection */}
                    {mobilier.protected !== undefined && (
                        <TechnicalInfoItem label="Protection">
                            <div className="flex items-center gap-2">
                                {mobilier.protected ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        <Shield className="w-3 h-3 mr-1"/>
                                        Protégé
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Non protégé</Badge>
                                )}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {/* Commentaire protection */}
                    {mobilier.protection_comment && (
                        <TechnicalInfoItem label="Commentaire protection">
                            <HtmlContent content={mobilier.protection_comment} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Matériaux */}
                    {mobilier.materials && mobilier.materials.length > 0 && (
                        <TechnicalInfoItem label="Matériaux">
                            <TechnicalBadgeList items={mobilier.materials.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* État de conservation */}
                    {mobilier.conservation && mobilier.conservation.length > 0 && (
                        <TechnicalInfoItem label="État de conservation">
                            <TechnicalBadgeList items={mobilier.conservation.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Techniques */}
                    {mobilier.techniques && mobilier.techniques.length > 0 && (
                        <TechnicalInfoItem label="Techniques">
                            <TechnicalBadgeList items={mobilier.techniques.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Thèmes */}
                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes">
                            <TechnicalBadgeList items={result.themes.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Sources */}
                    {mobilier.sources && (
                        <TechnicalInfoItem label="Sources">
                            <HtmlContent content={mobilier.sources} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Bibliographie */}
                    {mobilier.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <HtmlContent content={mobilier.bibliography} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        return sections;
    };

    const renderPersonneMoraleSections = () => {
        const personne = result as PersonneMoraleDetail;
        const sections = [];

        // Histoire (première section après les images)
        if (getHistory()) {
            sections.push(
                <TechnicalSection key="history" title="Histoire">
                    <HtmlContent content={getHistory()} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Informations techniques complètes pour personnes morales
        const hasTechnicalInfo = result.centuries?.length || personne.natures?.length ||
            personne.simple_mention !== undefined || personne.foundation_deed !== undefined ||
            personne.process || personne.social_involvement || personne.objects ||
            personne.comment || personne.sources || personne.bibliography || result.themes?.length;

        if (hasTechnicalInfo) {
            sections.push(
                <TechnicalSection key="technical" title="Informations techniques">
                    {/* Siècles */}
                    {result.centuries && result.centuries.length > 0 && (
                        <TechnicalInfoItem label="Siècles">
                            <TechnicalBadgeList items={result.centuries.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Types d'organisation */}
                    {personne.natures && personne.natures.length > 0 && (
                        <TechnicalInfoItem label="Types d'organisation">
                            <TechnicalBadgeList items={personne.natures.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Simple mention */}
                    {personne.simple_mention !== undefined && (
                        <TechnicalInfoItem label="Simple mention">
                            <Badge variant={personne.simple_mention ? "secondary" : "outline"}>
                                {personne.simple_mention ? 'Oui' : 'Non'}
                            </Badge>
                        </TechnicalInfoItem>
                    )}

                    {/* Acte de fondation */}
                    {personne.foundation_deed !== undefined && (
                        <TechnicalInfoItem label="Acte de fondation">
                            <Badge variant={personne.foundation_deed ? "secondary" : "outline"}>
                                {personne.foundation_deed ? 'Oui' : 'Non'}
                            </Badge>
                        </TechnicalInfoItem>
                    )}

                    {/* Fonctionnement */}
                    {personne.process && (
                        <TechnicalInfoItem label="Fonctionnement">
                            <HtmlContent content={personne.process} className="text-sm leading-relaxed" />
                        </TechnicalInfoItem>
                    )}

                    {/* Participation à la vie sociale */}
                    {personne.social_involvement && (
                        <TechnicalInfoItem label="Participation à la vie sociale">
                            <HtmlContent content={personne.social_involvement} className="text-sm leading-relaxed" />
                        </TechnicalInfoItem>
                    )}

                    {/* Objets liés */}
                    {personne.objects && (
                        <TechnicalInfoItem label="Objets liés">
                            <HtmlContent content={personne.objects} className="text-sm leading-relaxed" />
                        </TechnicalInfoItem>
                    )}

                    {/* Commentaire */}
                    {personne.comment && (
                        <TechnicalInfoItem label="Commentaire">
                            <HtmlContent content={personne.comment} className="text-sm leading-relaxed" />
                        </TechnicalInfoItem>
                    )}

                    {/* Sources */}
                    {personne.sources && (
                        <TechnicalInfoItem label="Sources">
                            <HtmlContent content={personne.sources} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Bibliographie */}
                    {personne.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <HtmlContent content={personne.bibliography} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Thèmes */}
                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes">
                            <TechnicalBadgeList items={result.themes.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        return sections;
    };

    const renderMonumentSections = () => {
        const monument = result as MonumentLieuDetail;
        const sections = [];

        // Description
        if (getDescription()) {
            sections.push(
                <TechnicalSection key="description" title="Description">
                    <HtmlContent content={getDescription()} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Histoire
        if (getHistory()) {
            sections.push(
                <TechnicalSection key="history" title="Histoire">
                    <HtmlContent content={getHistory()} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Bibliographie/Sources
        if (monument.bibliography || monument.sources) {
            sections.push(
                <TechnicalSection key="bibliography" title="Bibliographie/Sources">
                    {monument.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <HtmlContent content={monument.bibliography} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}
                    {monument.sources && (
                        <TechnicalInfoItem label="Sources">
                            <HtmlContent content={monument.sources} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        // Informations techniques
        const hasTechnicalInfo = monument.centuries?.length || monument.natures?.length ||
            monument.protected !== undefined || monument.protection_comment ||
            monument.materials?.length || monument.conservation?.length ||
            monument.themes?.length;

        if (hasTechnicalInfo) {
            sections.push(
                <TechnicalSection key="technical" title="Informations techniques">
                    {/* Siècles */}
                    {result.centuries && result.centuries.length > 0 && (
                        <TechnicalInfoItem label="Siècles">
                            <TechnicalBadgeList items={result.centuries.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Types d'éléments */}
                    {monument.natures && monument.natures.length > 0 && (
                        <TechnicalInfoItem label="Types d'éléments">
                            <TechnicalBadgeList items={monument.natures.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Protection */}
                    {monument.protected !== undefined && (
                        <TechnicalInfoItem label="Protection">
                            <div className="flex items-center gap-2">
                                {monument.protected ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        <Shield className="w-3 h-3 mr-1"/>
                                        Protégé
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Non protégé</Badge>
                                )}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {/* Commentaire protection */}
                    {monument.protection_comment && (
                        <TechnicalInfoItem label="Commentaire protection">
                            <HtmlContent content={monument.protection_comment} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Matériaux */}
                    {monument.materials && monument.materials.length > 0 && (
                        <TechnicalInfoItem label="Matériaux">
                            <TechnicalBadgeList items={monument.materials.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* État de conservation */}
                    {monument.conservation && monument.conservation.length > 0 && (
                        <TechnicalInfoItem label="État de conservation">
                            <TechnicalBadgeList items={monument.conservation.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}

                    {/* Thèmes */}
                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes">
                            <TechnicalBadgeList items={result.themes.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        return sections;
    };

    const renderPersonnePhysiqueSections = () => {
        const personne = result as PersonnePhysiqueDetail;
        const sections = [];

        // Section Dates (naissance et mort)
        if (personne.birthdate || personne.death) {
            sections.push(
                <TechnicalSection key="dates" title="Dates">
                    {personne.birthdate && (
                        <TechnicalInfoItem label="Date de naissance">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground"/>
                                <span>{personne.birthdate}</span>
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.death && (
                        <TechnicalInfoItem label="Date de décès">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground"/>
                                <span>{personne.death}</span>
                            </div>
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        // Section Attestation
        if (personne.attestation) {
            sections.push(
                <TechnicalSection key="attestation" title="Attestation">
                    <HtmlContent content={personne.attestation} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Éléments biographiques
        if (personne.biographical_elements) {
            sections.push(
                <TechnicalSection key="biography" title="Éléments biographiques">
                    <HtmlContent content={personne.biographical_elements} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Éléments du pèlerinage
        if (personne.pilgrimage_elements) {
            sections.push(
                <TechnicalSection key="pilgrimage" title="Éléments du pèlerinage">
                    <HtmlContent content={personne.pilgrimage_elements} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Nature de l'événement
        if (personne.event_nature) {
            sections.push(
                <TechnicalSection key="event-nature" title="Nature de l'événement">
                    <HtmlContent content={personne.event_nature} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Section Commentaire
        if (personne.comment) {
            sections.push(
                <TechnicalSection key="comment" title="Commentaire">
                    <HtmlContent content={personne.comment} className="text-sm leading-relaxed" />
                </TechnicalSection>
            );
        }

        // Sources et bibliographie
        if (personne.sources || personne.bibliography || result.themes?.length) {
            sections.push(
                <TechnicalSection key="sources-themes" title="Sources et références">
                    {/* Sources */}
                    {personne.sources && (
                        <TechnicalInfoItem label="Sources">
                            <HtmlContent content={personne.sources} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Bibliographie */}
                    {personne.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <HtmlContent content={personne.bibliography} className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md" />
                        </TechnicalInfoItem>
                    )}

                    {/* Thèmes */}
                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes">
                            <TechnicalBadgeList items={result.themes.map(o => o.name)}/>
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        return sections;
    };

    // Composant pour une petite carte de fiche liée
    const RelatedRecordCard = ({record, source}: { record: any; source: string }) => {
        const getRecordTitle = () => {
            if (source === 'personnes_physiques') {
                return record.firstname || record.title || 'Personne sans nom';
            }
            return record.title || 'Titre non renseigné';
        };

        const getRecordImage = () => {
            if (record.medias && record.medias.length > 0) {
                return getMediaImageUrl(record.medias[0].id);
            }
            return null;
        };

        const getRecordBadge = () => {
            return getTypeBadge(source);
        };

        const handleClick = () => {
            onViewDetail(record.id, source);
        };

        const badge = getRecordBadge();
        const badgeClassName = `mb-1 text-xs ${badge.color}`

        return (
            <div
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={handleClick}
            >
                {/* Image */}
                <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                    {getRecordImage() ? (
                        <ImageWithFallback
                            src={getRecordImage()!}
                            alt={getRecordTitle()}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            Pas d'image
                        </div>
                    )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    <Badge className={badgeClassName} variant="outline">
                        {badge.label}
                    </Badge>
                    <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {getRecordTitle()}
                    </h4>
                    {/* Localisation courte */}
                    {(record.city || record.department) && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {[record.city, record.department].filter(Boolean).join(', ')}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    // Fonction pour rendre les fiches liées
    const renderRelatedRecords = () => {
        if (loadingRelated) {
            return (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div
                            className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"/>
                        Chargement des fiches liées...
                    </div>
                </div>
            );
        }

        const hasRelatedRecords = Object.values(relatedRecords).some(records => records && records.length > 0);

        if (!hasRelatedRecords) {
            return null; // Ne pas afficher la section si aucune fiche liée
        }

        return (
            <div className="space-y-4">
                {Object.entries(relatedRecords).map(([source, records]) => {
                    if (!records || records.length === 0) return null;

                    const sourceLabel = getTypeBadge(source).label;

                    return (
                        <div key={source} className="space-y-2">
                            <h5 className="text-sm font-medium text-muted-foreground">
                                {sourceLabel}s ({records.length})
                            </h5>
                            <div className="space-y-2">
                                {records.map((record: any) => (
                                    <RelatedRecordCard
                                        key={`${source}-${record.id}`}
                                        record={record}
                                        source={source}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const typeBadge = getTypeBadge(formSource);
    const contentSections = renderContentSections();

    return (
        <div className="min-h-screen bg-background">
            {/* En-tête avec navigation */}
            <div
                className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-2">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2 hover:bg-accent/50 flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4"/>
                            <span className="hidden sm:inline">Retour à la liste</span>
                            <span className="sm:hidden">Retour</span>
                        </Button>

                        {/* Conteneur responsive pour badge et boutons */}
                        <div className="flex items-center gap-2 min-w-0 flex-shrink">
                            <Badge className={`${typeBadge.color} hidden sm:flex`} variant="outline">
                                {typeBadge.label}
                            </Badge>

                            {/* Badge de type de document */}
                            {isModification() ? (
                                <Badge className="bg-amber-100 text-amber-800 hidden sm:flex" variant="secondary">
                                    <Edit className="w-3 h-3 mr-1"/>
                                    Modification
                                </Badge>
                            ) : (
                                <Badge className="bg-emerald-100 text-emerald-800 hidden sm:flex" variant="secondary">
                                    <FilePlus className="w-3 h-3 mr-1"/>
                                    Nouvelle fiche
                                </Badge>
                            )}

                            {/* Boutons de validation avec responsive */}
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleValidation('activate')}
                                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 h-auto"
                                    disabled={isValidating}
                                >
                                    <CheckCircle className="w-4 h-4 sm:mr-2"/>
                                    <span className="hidden sm:inline">Approuver</span>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleValidation('reject')}
                                    disabled={isValidating}
                                    className="text-sm px-3 py-1.5 h-auto"
                                >
                                    <XCircle className="w-4 h-4 sm:mr-2"/>
                                    <span className="hidden sm:inline">Rejeter</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alerte de modification avec aperçu de l'original */}
                {isModification() && (
                    <Card className="mb-8 border-amber-200 bg-amber-50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div
                                        className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <Edit className="w-5 h-5 text-amber-700"/>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-amber-900 mb-1">
                                            Modification soumise à relecture
                                        </h3>
                                        <p className="text-sm text-amber-800">
                                            Cette fiche est une modification d'une fiche existante.
                                            Elle remplacera la version originale après validation.
                                        </p>
                                    </div>

                                    {loadingParent ? (
                                        <div className="text-sm text-amber-700 flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"/>
                                            Chargement de la fiche originale...
                                        </div>
                                    ) : parentRecord ? (
                                        <div className="bg-white rounded-md border border-amber-200 p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-sm font-medium text-amber-900">
                                                    Fiche originale :
                                                </h4>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => onViewDetail(parentRecord.id, formSource)}
                                                    className="text-xs h-auto p-0 text-amber-700 hover:text-amber-900"
                                                >
                                                    Voir les détails complets
                                                    <ExternalLink className="w-3 h-3 ml-1"/>
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-3">
                                                    {parentRecord.medias && parentRecord.medias.length > 0 && (
                                                        <div className="flex-shrink-0">
                                                            <AspectRatio ratio={16 / 9}
                                                                         className="w-24 bg-muted rounded overflow-hidden">
                                                                <ImageWithFallback
                                                                    src={getMediaImageUrl(parentRecord.medias[0].id)}
                                                                    alt={parentRecord.medias[0].title || getTitle(parentRecord)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </AspectRatio>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {getTitle(parentRecord)}
                                                        </p>
                                                        {"natures" in parentRecord && parentRecord.natures && parentRecord.natures.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {parentRecord.natures.slice(0, 2).map((nature) => (
                                                                    <Badge key={nature.id} variant="secondary"
                                                                           className="text-xs">
                                                                        {nature.name}
                                                                    </Badge>
                                                                ))}
                                                                {parentRecord.natures.length > 2 && (
                                                                    <Badge variant="secondary"
                                                                           className="text-xs text-muted-foreground">
                                                                        +{parentRecord.natures.length - 2}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                        {parentRecord.centuries && parentRecord.centuries.length > 0 && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {parentRecord.centuries.map(c => c.name).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-amber-700">
                                            <AlertCircle className="w-4 h-4 inline mr-1"/>
                                            La fiche originale n'a pas pu être chargée.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Nom prénom et localisation */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>

                            {/* Localisation + siècles */}
                            {getShortDescription() && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4"/>
                                    <span>{getShortDescription()}</span>
                                </div>
                            )}
                        </div>

                        {/* Images */}
                        {allImages.length > 0 && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                                        <ImageWithFallback
                                            src={getMediaImageUrl(allImages[currentImageIndex].id)}
                                            alt={getCurrentImageCaption()}
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={() => handleImageClick(currentImageIndex)}

                                        />

                                        {/* Navigation des images */}
                                        {allImages.length > 1 && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                                    onClick={prevImage}
                                                >
                                                    <ChevronLeft className="w-4 h-4"/>
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                                    onClick={nextImage}
                                                >
                                                    <ChevronRight className="w-4 h-4"/>
                                                </Button>

                                                {/* Indicateur de position */}
                                                <div
                                                    className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-sm">
                                                    {currentImageIndex + 1} / {allImages.length}
                                                </div>
                                            </>
                                        )}
                                    </AspectRatio>
                                </div>

                                {/* Légende de l'image */}
                                <div className="text-sm text-muted-foreground">
                                    {getCurrentImageCaption()}
                                </div>
                            </div>
                        )}

                        {/* Sections de contenu */}
                        <div className="space-y-6">
                            {contentSections.map((section, index) => (
                                <div key={index}>{section}</div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar - Informations générales */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations générales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {renderSidebarInfo()}
                            </CardContent>
                        </Card>

                        {/* Fiches liées */}
                        {renderRelatedRecords() && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fiches liées</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderRelatedRecords()}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de validation */}
            <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>
                            {validationType === 'activate' ? 'Approuver la fiche' : 'Rejeter la fiche'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {validationType === 'activate'
                                ? 'Vous allez approuver cette fiche. Elle sera alors publiée et visible par tous les utilisateurs.'
                                : 'Vous allez rejeter cette fiche. Elle ne sera pas publiée.'}
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowValidationModal(false)}
                                disabled={isValidating}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant={validationType === 'activate' ? 'default' : 'destructive'}
                                onClick={confirmValidation}
                                disabled={isValidating}
                                className={validationType === 'activate' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                {isValidating ? (
                                    <>
                                        <div
                                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"/>
                                        {validationType === 'activate' ? 'Approbation...' : 'Rejet...'}
                                    </>
                                ) : (
                                    <>
                                        {validationType === 'activate' ? (
                                            <Check className="w-4 h-4 mr-2"/>
                                        ) : (
                                            <X className="w-4 h-4 mr-2"/>
                                        )}
                                        {validationType === 'activate' ? 'Approuver' : 'Rejeter'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Modal d'image */}
            <ImageModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                images={modalImages}
                initialIndex={modalImageIndex}
            />
        </div>

    );
}