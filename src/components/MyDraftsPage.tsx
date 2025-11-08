import {useState} from "react";
import {ArrowLeft, Eye, MapPin, Calendar, User, FileText, Clock, RefreshCw, Trash2} from "lucide-react";
import {Button} from "./ui/button";
import {Card, CardContent} from "./ui/card";
import {Badge} from "./ui/badge";
import {AspectRatio} from "./ui/aspect-ratio";
import {ImageWithFallback} from "./ImageWithFallback.tsx";
import { PendingForm, apiService, ApiError } from "../config/api";
import { formatCreationDate } from "../config/api";
import {toast} from "sonner";
import {getMediaImageUrl} from "../utils/searchUtils";

interface MyDraftsPageProps {
    onBack: () => void;
    draftForms: {
        monuments_lieux: PendingForm[];
        mobiliers_images: PendingForm[];
        personnes_morales: PendingForm[];
        personnes_physiques: PendingForm[];
    };
    onRefresh: () => void;
    onSessionExpired: (message?: string) => void;
    onViewFormDetail: (formId: string, formSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => void;
}

export function MyDraftsPage({onBack, draftForms, onRefresh, onSessionExpired, onViewFormDetail}: MyDraftsPageProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Calculer le nombre total de brouillons
    const totalDrafts = draftForms.monuments_lieux.length +
        draftForms.mobiliers_images.length +
        draftForms.personnes_morales.length +
        draftForms.personnes_physiques.length;

    // Aplatir tous les brouillons avec leur source
    const allDrafts = [
        ...draftForms.monuments_lieux.map(form => ({...form, source: 'monuments_lieux'})),
        ...draftForms.mobiliers_images.map(form => ({...form, source: 'mobiliers_images'})),
        ...draftForms.personnes_morales.map(form => ({...form, source: 'personnes_morales'})),
        ...draftForms.personnes_physiques.map(form => ({...form, source: 'personnes_physiques'}))
    ];

    const getCategoryLabel = (source: string) => {
        const labels: Record<string, string> = {
            'monuments_lieux': 'Monuments & Lieux',
            'mobiliers_images': 'Mobiliers & Images',
            'personnes_morales': 'Personnes Morales',
            'personnes_physiques': 'Personnes Physiques'
        };
        return labels[source] || source;
    };

    const getCategoryColor = (source: string) => {
        const colors: Record<string, string> = {
            'monuments_lieux': 'bg-blue-100 text-blue-800',
            'mobiliers_images': 'bg-green-100 text-green-800',
            'personnes_morales': 'bg-purple-100 text-purple-800',
            'personnes_physiques': 'bg-orange-100 text-orange-800'
        };
        return colors[source] || 'bg-gray-100 text-gray-800';
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
            toast.success('Liste des brouillons mise à jour');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsRefreshing(false);
        }
    };

    const viewFormDetails = (form: PendingForm & { source: string }) => {
        onViewFormDetail(form.id, form.source as 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques');
    };

    const getLocationString = (form: PendingForm) => {
        const parts = [form.city, form.department, form.region, form.country].filter(Boolean);
        return parts.join(', ') || 'Localisation non renseignée';
    };

    const formatAuthors = (authors: string[]) => {
        if (authors.length === 0) return 'Auteur non renseigné';
        if (authors.length === 1) return authors[0];
        if (authors.length === 2) return authors.join(' et ');
        return `${authors.slice(0, -1).join(', ')} et ${authors[authors.length - 1]}`;
    };

    const deleteDraft = async (formId: string, source: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => {
        try {
            await apiService.deleteDraft(source, formId);
            toast.success('Brouillon supprimé avec succès');
            onRefresh();
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                onSessionExpired('Votre session a expiré. Veuillez vous reconnecter.');
            } else {
                toast.error('Erreur lors de la suppression du brouillon');
            }
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                Retour à l'accueil
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Mes brouillons</h1>
                                <p className="text-muted-foreground">
                                    {totalDrafts} brouillon{totalDrafts !== 1 ? 's' : ''} enregistré{totalDrafts !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}/>
                            Actualiser
                        </Button>
                    </div>

                    {totalDrafts === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    Aucun brouillon enregistré
                                </h3>
                                <p className="text-muted-foreground">
                                    Vous n'avez pas encore de brouillons en cours.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {allDrafts.map((form) => (
                                <Card key={`${form.source}-${form.id}`}
                                      className="hover:shadow-md transition-shadow cursor-pointer"
                                      onClick={() => viewFormDetails(form)}>
                                    <CardContent className="p-6">
                                        {/* Badge de catégorie et date */}
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge className={getCategoryColor(form.source)} variant="secondary">
                                                {getCategoryLabel(form.source)}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3"/>
                                                {formatCreationDate(form.creation_date)}
                                            </div>
                                        </div>

                                        {/* Badge Brouillon */}
                                        <div className="mb-4">
                                            <Badge variant="outline"
                                                   className="bg-blue-50 text-blue-700 border-blue-200">
                                                <FileText className="w-3 h-3 mr-1"/>
                                                Brouillon
                                            </Badge>
                                        </div>

                                        {/* Image si disponible */}
                                        {form.medias && form.medias.length > 0 && (
                                            <div className="mb-4">
                                                <AspectRatio ratio={16 / 9}
                                                             className="bg-muted rounded-md overflow-hidden">
                                                    <ImageWithFallback
                                                        src={getMediaImageUrl(form.medias[0].id)}
                                                        alt={form.medias[0].title || form.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </AspectRatio>
                                            </div>
                                        )}

                                        {/* Titre */}
                                        <h3 className="font-medium text-foreground mb-3 line-clamp-2">
                                            {form.title}
                                        </h3>

                                        {/* Localisation */}
                                        {(form.city || form.department || form.region || form.country) && (
                                            <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                                                <span className="line-clamp-2">{getLocationString(form)}</span>
                                            </div>
                                        )}

                                        {/* Auteur */}
                                        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                                            <User className="w-4 h-4"/>
                                            <span className="line-clamp-1">{formatAuthors(form.authors)}</span>
                                        </div>

                                        {/* Métadonnées */}
                                        <div className="space-y-2 mb-4">
                                            {/* Siècles */}
                                            {form.centuries && form.centuries.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-muted-foreground"/>
                                                    <div className="flex flex-wrap gap-1">
                                                        {form.centuries.slice(0, 3).map((century) => (
                                                            <Badge key={century} variant="outline" className="text-xs">
                                                                {century}
                                                            </Badge>
                                                        ))}
                                                        {form.centuries.length > 3 && (
                                                            <Badge variant="outline"
                                                                   className="text-xs text-muted-foreground">
                                                                +{form.centuries.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Natures */}
                                            {form.natures && form.natures.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {form.natures.slice(0, 2).map((nature) => (
                                                        <Badge key={nature} variant="secondary" className="text-xs">
                                                            {nature}
                                                        </Badge>
                                                    ))}
                                                    {form.natures.length > 2 && (
                                                        <Badge variant="secondary"
                                                               className="text-xs text-muted-foreground">
                                                            +{form.natures.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Professions (pour les personnes physiques) */}
                                            {form.professions && form.professions.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {form.professions.slice(0, 2).map((profession) => (
                                                        <Badge key={profession} variant="secondary" className="text-xs">
                                                            {profession}
                                                        </Badge>
                                                    ))}
                                                    {form.professions.length > 2 && (
                                                        <Badge variant="secondary"
                                                               className="text-xs text-muted-foreground">
                                                            +{form.professions.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    viewFormDetails(form);
                                                }}
                                                className="flex-1 flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4"/>
                                                Voir le brouillon
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteDraft(form.id, form.source as 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques');
                                                }}
                                                className="flex-1 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Supprimer
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
