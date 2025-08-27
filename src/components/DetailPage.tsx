import {useState, useEffect} from "react";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    CheckCircle,
    XCircle
} from "lucide-react";
import {Button} from "./ui/button";
import {Badge} from "./ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Separator} from "./ui/separator";
import {AspectRatio} from "./ui/aspect-ratio";
import {ImageWithFallback} from "./ImageWithFallback.tsx";
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

interface DetailPageProps {
    resultId: string;
    onBack: () => void;
    onViewDetail?: (resultId: string) => void;
}

// Fonction pour extraire le type de source et l'ID réel depuis l'ID combiné
function extractSourceAndId(combinedId: string): {
    source: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques';
    id: string
} {
    // Si l'ID contient le type de source (format "source:id")
    if (combinedId.includes(':')) {
        const [source, id] = combinedId.split(':', 2);
        return {
            source: source as 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques',
            id: id
        };
    }

    return {
        source: 'monuments_lieux',
        id: '',
    }
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

export function DetailPage({resultId, onBack, onViewDetail}: DetailPageProps) {
    const [result, setResult] = useState<DetailResult | null>(null);
    const [source, setSource] = useState<'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques' | null>(null);
    const [relatedCards, setRelatedCards] = useState<{ [key: string]: DetailResult[] }>({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});

        const loadDetailResult = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Extraire le type de source et l'ID réel
                const {source: extractedSource, id: actualId} = extractSourceAndId(resultId);
                setSource(extractedSource);

                // Tenter de charger avec le type déterminé
                try {
                    const detailResult = await apiService.getRecordDetail(extractedSource, actualId);
                    setResult(detailResult);

                    // Charger les fiches liées
                    await loadRelatedRecords(detailResult, extractedSource);
                } catch (initialError) {
                    // Si le premier type échoue, essayer les autres types
                    const sourceTypes: ('monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques')[] =
                        ['monuments_lieux', 'mobiliers_images', 'personnes_morales', 'personnes_physiques'];

                    let found = false;
                    for (const sourceType of sourceTypes) {
                        if (sourceType === extractedSource) continue; // Déjà essayé

                        try {
                            const detailResult = await apiService.getRecordDetail(sourceType, actualId);
                            setResult(detailResult);
                            setSource(sourceType);


                            // Charger les fiches liées
                            await loadRelatedRecords(detailResult, sourceType);

                            found = true;
                            break;
                        } catch (typeError) {
                            console.warn(`Type ${sourceType} ne fonctionne pas pour ID ${actualId}`);
                        }
                    }

                    if (!found) {
                        throw initialError;
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la fiche:', error);
                if (error instanceof ApiError && error.status === 404) {
                    setError(`Fiche non trouvée pour l'ID: ${resultId}`);
                } else {
                    setError('Une erreur est survenue lors du chargement de la fiche.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadDetailResult();
    }, [resultId]);

    // Fonction pour charger les fiches liées
    const loadRelatedRecords = async (record: DetailResult, recordSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => {
        setIsLoadingRelated(true);
        const relatedData: { [key: string]: DetailResult[] } = {};

        try {
            // Récupérer les IDs des fiches liées selon le type de fiche
            const relatedIds = getRelatedIds(record, recordSource);

            // Charger chaque fiche liée
            for (const [sourceType, ids] of Object.entries(relatedIds)) {
                if (ids && ids.length > 0) {
                    relatedData[sourceType] = [];

                    for (const id of ids) {
                        try {
                            const relatedRecord = await apiService.getRecordDetail(
                                sourceType as 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques',
                                id.toString()
                            );
                            relatedData[sourceType].push(relatedRecord);
                        } catch (error) {
                            console.warn(`Impossible de charger la fiche liée ${sourceType}:${id}`, error);
                        }
                    }
                }
            }

            setRelatedCards(relatedData);
        } catch (error) {
            console.error('Erreur lors du chargement des fiches liées:', error);
        } finally {
            setIsLoadingRelated(false);
        }
    };

    // Fonction pour extraire les IDs des fiches liées selon le type
    const getRelatedIds = (record: DetailResult, recordSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => {
        const relatedIds: { [key: string]: number[] } = {};

        if (recordSource === 'monuments_lieux') {
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
        } else if (recordSource === 'mobiliers_images') {
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
        } else if (recordSource === 'personnes_morales') {
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
        } else if (recordSource === 'personnes_physiques') {
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
                        {error || `Aucune fiche trouvée pour l'ID: ${resultId}`}
                    </p>
                    <Button onClick={onBack}>Retour aux résultats</Button>
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
    const getTitle = () => {
        if (!result) return '';

        if (source === 'personnes_physiques') {
            return (result as PersonnePhysiqueDetail).firstname;
        }

        return "title" in result ? result.title : '';
    };

    // Fonction pour obtenir la description selon le type de fiche
    const getDescription = () => {
        if (!result) return '';

        if (source === 'personnes_morales') {
            return (result as PersonneMoraleDetail).comment || '';
        } else if (source === 'personnes_physiques') {
            return (result as PersonnePhysiqueDetail).comment || '';
        }
        return (result as MonumentLieuDetail | MobilierImageDetail).description || '';
    };

    // Fonction pour obtenir l'histoire selon le type de fiche
    const getHistory = () => {
        if (!result) return '';

        if (source === 'personnes_morales') {
            return (result as PersonneMoraleDetail).history || '';
        } else if (source === 'monuments_lieux' || source === 'mobiliers_images') {
            return (result as MonumentLieuDetail | MobilierImageDetail).history || '';
        }

        return '';
    };

    // Fonction pour obtenir la géolocalisation
    const getGeoLocation = () => {
        if (!result || source !== 'monuments_lieux') return null;
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
            if (result.city) locationParts.push(result.city);
            if (result.department) locationParts.push(result.department);
            if (result.region) locationParts.push(result.region);
            if (result.country) locationParts.push(result.country);

            if (locationParts.length > 0) {
                parts.push(locationParts.join(', '));
            }
        }

        // Ajouter les siècles
        if (result?.centuries && result.centuries.length > 0) {
            const centuriesText = result.centuries.join(', ');
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


    // Composant pour afficher une carte de fiche liée
    const RelatedCard = ({record, sourceType}: { record: DetailResult; sourceType: string }) => {
        const typeBadge = getTypeBadge(sourceType);
        const title = sourceType === 'personnes_physiques'
            ? (record as PersonnePhysiqueDetail).firstname
            : (record as MonumentLieuDetail).title;

        // Description courte pour la localisation
        const getLocationText = () => {
            const parts = [];
            if (record.city) parts.push(record.city);
            if (record.department) parts.push(record.department);
            return parts.length > 0 ? parts.join(', ') : '';
        };

        // Siècles
        const centuriesText = record.centuries && record.centuries.length > 0
            ? record.centuries.join(', ')
            : '';

        const handleClick = () => {
            if (onViewDetail) {
                setCurrentImageIndex(0);
                onViewDetail(`${sourceType}:${record.id}`);
            }
        };

        return (
            <Card
                className="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-border/50 hover:border-border"
                onClick={handleClick}
            >
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* En-tête avec badge de type */}
                        <div className="flex items-start justify-between gap-2">
                            <Badge className={typeBadge.color} variant="secondary">
                                {typeBadge.label}
                            </Badge>
                        </div>

                        {/* Titre */}
                        <div>
                            <h4 className="font-medium text-foreground line-clamp-2 text-sm">
                                {title}
                            </h4>
                        </div>

                        {/* Informations complémentaires */}
                        {(getLocationText() || centuriesText) && (
                            <div className="space-y-1 text-xs text-muted-foreground">
                                {getLocationText() && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 flex-shrink-0"/>
                                        <span className="line-clamp-1">{getLocationText()}</span>
                                    </div>
                                )}
                                {centuriesText && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 flex-shrink-0"/>
                                        <span className="line-clamp-1">{centuriesText}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Fonction pour rendre la section des fiches liées
    const renderRelatedRecords = () => {
        const hasRelatedRecords = Object.values(relatedCards).some(records => records.length > 0);

        if (!hasRelatedRecords && !isLoadingRelated) {
            return null;
        }

        return (
            <div className="space-y-4">
                <Separator/>
                <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">Fiches liées</h3>

                    {isLoadingRelated ? (
                        <div className="text-center py-4">
                            <div className="text-sm text-muted-foreground">
                                Chargement des fiches liées...
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(relatedCards).map(([sourceType, records]) => {
                                if (!records || records.length === 0) return null;

                                const typeBadge = getTypeBadge(sourceType);

                                return (
                                    <div key={sourceType} className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            {typeBadge.label} ({records.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {records.map((record: DetailResult) => (
                                                <RelatedCard
                                                    key={`${sourceType}-${record.id}`}
                                                    record={record}
                                                    sourceType={sourceType}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Fonction pour rendre les informations de la sidebar selon le type
    const renderSidebarInfo = () => {
        switch (source) {
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
                        <TechnicalBadgeList items={mobilier.natures}/>
                    </TechnicalInfoItem>
                )}

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city}</div>}
                            {result.department && <div>{result.department}</div>}
                            {result.region && <div>{result.region}</div>}
                            {result.country && <div>{result.country}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Emplacement actuel */}
                {mobilier.conversation_place && (
                    <TechnicalInfoItem label="Emplacement actuel">
                        <span>{mobilier.conversation_place}</span>
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
                                <Badge key={author} variant="secondary" className="text-xs">
                                    {author}
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
                {/* Localisation */}
                {(personne.city || personne.department || personne.region || personne.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {personne.city && <div>{personne.city}</div>}
                            {personne.department && <div>{personne.department}</div>}
                            {personne.region && <div>{personne.region}</div>}
                            {personne.country && <div>{personne.country}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Types d'organisation */}
                {personne.natures && personne.natures.length > 0 && (
                    <TechnicalInfoItem label="Types d'organisation">
                        <TechnicalBadgeList items={personne.natures}/>
                    </TechnicalInfoItem>
                )}

                {/* Contributeur */}
                {hasContributors() && (
                    <TechnicalInfoItem label="Contributeur">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground"/>
                            <span>{personne.contributors}</span>
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Auteur de la fiche */}
                {result.authors && result.authors.length > 0 && (
                    <TechnicalInfoItem label="Auteur de la fiche">
                        <div className="flex flex-wrap gap-1">
                            {result.authors.map((author) => (
                                <Badge key={author} variant="secondary" className="text-xs">
                                    {author}
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
                        <TechnicalBadgeList items={monument.natures}/>
                    </TechnicalInfoItem>
                )}

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city}</div>}
                            {result.department && <div>{result.department}</div>}
                            {result.region && <div>{result.region}</div>}
                            {result.country && <div>{result.country}</div>}
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
                                <Badge key={author} variant="secondary" className="text-xs">
                                    {author}
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
                {/* Identité - on peut ajouter des informations d'identité si disponibles */}
                <TechnicalInfoItem label="Identité">
                    <span>{personne.firstname}</span>
                </TechnicalInfoItem>

                {/* Localisation */}
                {(result.city || result.department || result.region || result.country) && (
                    <TechnicalInfoItem label="Localisation">
                        <div className="space-y-1 text-sm">
                            {result.city && <div>{result.city}</div>}
                            {result.department && <div>{result.department}</div>}
                            {result.region && <div>{result.region}</div>}
                            {result.country && <div>{result.country}</div>}
                        </div>
                    </TechnicalInfoItem>
                )}

                {/* Siècles */}
                {result.centuries && result.centuries.length > 0 && (
                    <TechnicalInfoItem label="Siècles">
                        <TechnicalBadgeList items={result.centuries}/>
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
                                <Badge key={author} variant="secondary" className="text-xs">
                                    {author}
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

    // Fonction pour rendre les sections de contenu selon le type
    const renderContentSections = () => {
        switch (source) {
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
                    <div className="text-sm leading-relaxed">
                        {getDescription()}
                    </div>
                </TechnicalSection>
            );
        }

        // Histoire
        if (getHistory()) {
            sections.push(
                <TechnicalSection key="history" title="Histoire">
                    <div className="text-sm leading-relaxed">
                        {getHistory()}
                    </div>
                </TechnicalSection>
            );
        }

        // Inscriptions
        if (mobilier.inscriptions) {
            sections.push(
                <TechnicalSection key="inscriptions" title="Inscriptions">
                    <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                        {mobilier.inscriptions}
                    </div>
                </TechnicalSection>
            );
        }

        // Informations techniques
        const hasTechnicalInfo = mobilier.centuries?.length || mobilier.origin_place ||
            mobilier.protected !== undefined || mobilier.protection_comment ||
            mobilier.materials?.length || mobilier.conservation?.length ||
            mobilier.techniques?.length || result.themes?.length ||
            mobilier.sources || mobilier.bibliography;

        if (hasTechnicalInfo) {
            sections.push(
                <TechnicalSection key="technical" title="Informations techniques">
                    {result.centuries && result.centuries.length > 0 && (
                        <TechnicalInfoItem label="Siècles">
                            <TechnicalBadgeList items={result.centuries}/>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.origin_place && (
                        <TechnicalInfoItem label="Emplacement d'origine">
                            <span>{mobilier.origin_place}</span>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.protected !== undefined && (
                        <TechnicalInfoItem label="État de protection">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {mobilier.protected ? (
                                        <CheckCircle className="w-4 h-4 text-green-500"/>
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500"/>
                                    )}
                                    <span>{mobilier.protected ? 'Oui' : 'Non'}</span>
                                </div>
                                {mobilier.protection_comment && (
                                    <div className="text-sm text-muted-foreground italic">
                                        {mobilier.protection_comment}
                                    </div>
                                )}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.materials && mobilier.materials.length > 0 && (
                        <TechnicalInfoItem label="Matériaux">
                            <TechnicalBadgeList items={mobilier.materials}/>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.conservation && mobilier.conservation.length > 0 && (
                        <TechnicalInfoItem label="États de conservation">
                            <TechnicalBadgeList items={mobilier.conservation}/>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.techniques && mobilier.techniques.length > 0 && (
                        <TechnicalInfoItem label="Techniques utilisées">
                            <TechnicalBadgeList items={mobilier.techniques}/>
                        </TechnicalInfoItem>
                    )}

                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes">
                            <TechnicalBadgeList items={result.themes}/>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.sources && (
                        <TechnicalInfoItem label="Sources">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {mobilier.sources}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {mobilier.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {mobilier.bibliography}
                            </div>
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

        // Histoire
        if (getHistory()) {
            sections.push(
                <TechnicalSection key="history" title="Histoire">
                    <div className="text-sm leading-relaxed">
                        {getHistory()}
                    </div>
                </TechnicalSection>
            );
        }

        // Informations techniques
        const hasTechnicalInfo = result.centuries?.length || personne.simple_mention !== undefined ||
            personne.foundation_deed !== undefined || personne.process || personne.social_involvement ||
            personne.objects || personne.comment || personne.sources || personne.bibliography ||
            result.themes?.length;

        if (hasTechnicalInfo) {
            sections.push(
                <TechnicalSection key="technical" title="Informations techniques">
                    {result.centuries && result.centuries.length > 0 && (
                        <TechnicalInfoItem label="Siècles">
                            <TechnicalBadgeList items={result.centuries}/>
                        </TechnicalInfoItem>
                    )}

                    {personne.simple_mention !== undefined && (
                        <TechnicalInfoItem label="Simple mention">
                            <div className="flex items-center gap-2">
                                {personne.simple_mention ? (
                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500"/>
                                )}
                                <span>{personne.simple_mention ? 'Oui' : 'Non'}</span>
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.foundation_deed !== undefined && (
                        <TechnicalInfoItem label="Acte de fondation">
                            <div className="flex items-center gap-2">
                                {personne.foundation_deed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500"/>
                                )}
                                <span>{personne.foundation_deed ? 'Oui' : 'Non'}</span>
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.process && (
                        <TechnicalInfoItem label="Fonctionnement">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.process}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.social_involvement && (
                        <TechnicalInfoItem label="Participation à la vie sociale">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.social_involvement}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.objects && (
                        <TechnicalInfoItem label="Objets liés">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.objects}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.comment && (
                        <TechnicalInfoItem label="Commentaire">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.comment}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.sources && (
                        <TechnicalInfoItem label="Sources">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.sources}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.bibliography}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes associés">
                            <TechnicalBadgeList items={result.themes}/>
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
                    <div className="text-sm leading-relaxed">
                        {getDescription()}
                    </div>
                </TechnicalSection>
            );
        }

        // Histoire
        if (getHistory()) {
            sections.push(
                <TechnicalSection key="history" title="Histoire">
                    <div className="text-sm leading-relaxed">
                        {getHistory()}
                    </div>
                </TechnicalSection>
            );
        }

        // Informations techniques
        const hasTechnicalInfo = monument.centuries?.length || monument.protected !== undefined ||
            monument.protection_comment || monument.materials?.length || monument.conservation?.length ||
            result.themes?.length || monument.sources || monument.bibliography;

        if (hasTechnicalInfo) {
            sections.push(
                <TechnicalSection key="technical" title="Informations techniques">
                    {result.centuries && result.centuries.length > 0 && (
                        <TechnicalInfoItem label="Siècles">
                            <TechnicalBadgeList items={result.centuries}/>
                        </TechnicalInfoItem>
                    )}

                    {monument.protected !== undefined && (
                        <TechnicalInfoItem label="État de protection">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {monument.protected ? (
                                        <CheckCircle className="w-4 h-4 text-green-500"/>
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500"/>
                                    )}
                                    <span>{monument.protected ? 'Oui' : 'Non'}</span>
                                </div>
                                {monument.protection_comment && (
                                    <div className="text-sm text-muted-foreground italic">
                                        {monument.protection_comment}
                                    </div>
                                )}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {monument.materials && monument.materials.length > 0 && (
                        <TechnicalInfoItem label="Matériaux">
                            <TechnicalBadgeList items={monument.materials}/>
                        </TechnicalInfoItem>
                    )}

                    {monument.conservation && monument.conservation.length > 0 && (
                        <TechnicalInfoItem label="États de conservation">
                            <TechnicalBadgeList items={monument.conservation}/>
                        </TechnicalInfoItem>
                    )}

                    {result.themes && result.themes.length > 0 && (
                        <TechnicalInfoItem label="Thèmes">
                            <TechnicalBadgeList items={result.themes}/>
                        </TechnicalInfoItem>
                    )}

                    {monument.sources && (
                        <TechnicalInfoItem label="Sources">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {monument.sources}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {monument.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {monument.bibliography}
                            </div>
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

        // Dates (naissance et décès)
        if (personne.birthdate || personne.death) {
            sections.push(
                <TechnicalSection key="dates" title="Dates">
                    <div className="space-y-2">
                        {personne.birthdate && (
                            <TechnicalInfoItem label="Naissance">
                                <span>{personne.birthdate}</span>
                            </TechnicalInfoItem>
                        )}
                        {personne.death && (
                            <TechnicalInfoItem label="Décès">
                                <span>{personne.death}</span>
                            </TechnicalInfoItem>
                        )}
                    </div>
                </TechnicalSection>
            );
        }

        // Attestation
        if (personne.attestation) {
            sections.push(
                <TechnicalSection key="attestation" title="Attestation">
                    <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                        {personne.attestation}
                    </div>
                </TechnicalSection>
            );
        }

        // Éléments biographiques
        const hasBiographicalInfo = personne.biographical_elements || personne.historical_period?.length ||
            personne.professions?.length;

        if (hasBiographicalInfo) {
            sections.push(
                <TechnicalSection key="biographical" title="Éléments biographiques">
                    {personne.biographical_elements && (
                        <TechnicalInfoItem label="Éléments biographiques">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.biographical_elements}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.historical_period && personne.historical_period.length > 0 && (
                        <TechnicalInfoItem label="Périodes historiques">
                            <TechnicalBadgeList items={personne.historical_period}/>
                        </TechnicalInfoItem>
                    )}

                    {personne.professions && personne.professions.length > 0 && (
                        <TechnicalInfoItem label="Professions">
                            <TechnicalBadgeList items={personne.professions}/>
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        // Éléments du pèlerinage
        if (personne.pilgrimage_elements) {
            sections.push(
                <TechnicalSection key="pilgrimage" title="Éléments du pèlerinage">
                    <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                        {personne.pilgrimage_elements}
                    </div>
                </TechnicalSection>
            );
        }

        // Commentaire
        if (personne.comment) {
            sections.push(
                <TechnicalSection key="comment" title="Commentaire">
                    <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                        {personne.comment}
                    </div>
                </TechnicalSection>
            );
        }

        // Sources et bibliographie
        if (personne.sources || personne.bibliography) {
            sections.push(
                <TechnicalSection key="sources" title="Sources et bibliographie">
                    {personne.sources && (
                        <TechnicalInfoItem label="Sources">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.sources}
                            </div>
                        </TechnicalInfoItem>
                    )}

                    {personne.bibliography && (
                        <TechnicalInfoItem label="Bibliographie">
                            <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                                {personne.bibliography}
                            </div>
                        </TechnicalInfoItem>
                    )}
                </TechnicalSection>
            );
        }

        return sections;
    };

    const typeBadge = getTypeBadge(source || '');
    const shortDescription = getShortDescription();

    const sidebarContent = (
        <div className="space-y-6">
            {/* Informations sur la fiche */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {renderSidebarInfo()}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="mb-4 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4"/>
                            Retour aux résultats
                        </Button>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {/* Badge de type */}
                                <Badge className={`mb-3 ${typeBadge.color}`}>
                                    {typeBadge.label}
                                </Badge>

                                <h1 className="text-3xl font-bold mb-2">{getTitle()}</h1>

                                {/* Description courte avec localisation et siècles */}
                                {shortDescription && (
                                    <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                                        {shortDescription}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contenu principal */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Section des images */}
                            {allImages.length > 0 && (
                                <Card>
                                    <CardContent className="p-0">
                                        <AspectRatio ratio={16 / 9}>
                                            <ImageWithFallback
                                                src={getMediaImageUrl(allImages[currentImageIndex].id)}
                                                alt={allImages[currentImageIndex].title}
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />

                                            {/* Contrôles de navigation d'images */}
                                            {allImages.length > 1 && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                                                        onClick={prevImage}
                                                    >
                                                        <ChevronLeft className="w-4 h-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                                                        onClick={nextImage}
                                                    >
                                                        <ChevronRight className="w-4 h-4"/>
                                                    </Button>

                                                    {/* Indicateur de position */}
                                                    <div
                                                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                                        {currentImageIndex + 1} / {allImages.length}
                                                    </div>
                                                </>
                                            )}
                                        </AspectRatio>

                                        {/* Légende */}
                                        <div className="p-4 border-t">
                                            <p className="text-sm text-muted-foreground italic">
                                                {getCurrentImageCaption()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Sections de contenu selon le type */}
                            {renderContentSections()}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {sidebarContent}

                            {renderRelatedRecords()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}