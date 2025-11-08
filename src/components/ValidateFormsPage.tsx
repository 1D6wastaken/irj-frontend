import { useState } from "react";
import { ArrowLeft, Eye, Check, X, MapPin, Calendar, User, FileText, Clock, RefreshCw, Edit, FilePlus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { AspectRatio } from "./ui/aspect-ratio";
import { ImageWithFallback } from "./ImageWithFallback.tsx";
import { PendingForm, apiService, ApiError } from "../config/api";
import { formatCreationDate } from "../config/api";
import { toast } from "sonner";
import { getMediaImageUrl } from "../utils/searchUtils";

interface ValidateFormsPageProps {
  onBack: () => void;
  pendingForms: {
    monuments_lieux: PendingForm[];
    mobiliers_images: PendingForm[];
    personnes_morales: PendingForm[];
    personnes_physiques: PendingForm[];
  };
  onRefresh: () => void;
  onSessionExpired: (message?: string) => void;
  onViewFormDetail: (formId: string, formSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => void;
}

export function ValidateFormsPage({ onBack, pendingForms, onRefresh, onSessionExpired, onViewFormDetail }: ValidateFormsPageProps) {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<PendingForm & { source: string } | null>(null);
  const [validationType, setValidationType] = useState<'activate' | 'reject'>('activate');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Calculer le nombre total de fiches
  const totalForms = pendingForms.monuments_lieux.length + 
                    pendingForms.mobiliers_images.length + 
                    pendingForms.personnes_morales.length + 
                    pendingForms.personnes_physiques.length;

  // Aplatir toutes les fiches avec leur source
  const allForms = [
    ...pendingForms.monuments_lieux.map(form => ({ ...form, source: 'monuments_lieux' })),
    ...pendingForms.mobiliers_images.map(form => ({ ...form, source: 'mobiliers_images' })),
    ...pendingForms.personnes_morales.map(form => ({ ...form, source: 'personnes_morales' })),
    ...pendingForms.personnes_physiques.map(form => ({ ...form, source: 'personnes_physiques' }))
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

  const handleValidation = (form: PendingForm & { source: string }, type: 'activate' | 'reject') => {
    setSelectedForm(form);
    setValidationType(type);
    setShowValidationModal(true);
  };

  const confirmValidation = async () => {
    if (!selectedForm) return;

    setIsValidating(true);
    try {
      await apiService.validateForm(
        selectedForm.source as 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques',
        selectedForm.id,
        validationType,
      );

      if (validationType === 'activate') {
        toast.success('Fiche approuvée avec succès');
      } else {
        toast.success('Fiche rejetée avec succès');
      }
      
      setShowValidationModal(false);
      setSelectedForm(null);
      
      // Rafraîchir les données après validation
      onRefresh();
      
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
          onRefresh(); // Rafraîchir pour mettre à jour la liste
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success('Liste des fiches mise à jour');
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

    const getDocumentTypeLabel = (form: PendingForm) => {
        return form.parent_id ? 'Modification' : 'Nouvelle fiche';
    };

    const getDocumentTypeColor = (form: PendingForm) => {
        return form.parent_id ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
    };

    const getDocumentTypeIcon = (form: PendingForm) => {
        return form.parent_id ? Edit : FilePlus;
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
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Validation des fiches</h1>
                <p className="text-muted-foreground">
                  {totalForms} fiche{totalForms !== 1 ? 's' : ''} en attente de validation
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {totalForms === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucune fiche en attente
                </h3>
                <p className="text-muted-foreground">
                  Toutes les fiches soumises ont été traitées.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allForms.map((form) => (
                <Card key={`${form.source}-${form.id}`} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewFormDetails(form)}>
                    <CardContent className="p-6">
                        {/* Badge de catégorie, type de document et date */}
                        <div className="flex items-start justify-between mb-4 gap-2">
                            <div className="flex flex-col gap-2">
                                <Badge className={getCategoryColor(form.source)} variant="secondary">
                                    {getCategoryLabel(form.source)}
                                </Badge>
                                {(() => {
                                    const Icon = getDocumentTypeIcon(form);
                                    return (
                                        <Badge className={getDocumentTypeColor(form)} variant="secondary">
                                            <Icon className="w-3 h-3 mr-1" />
                                            {getDocumentTypeLabel(form)}
                                        </Badge>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatCreationDate(form.creation_date)}
                            </div>
                        </div>

                    {/* Image si disponible */}
                    {form.medias && form.medias.length > 0 && (
                      <div className="mb-4">
                        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
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
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{getLocationString(form)}</span>
                      </div>
                    )}

                    {/* Auteur */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="line-clamp-1">{formatAuthors(form.authors)}</span>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-2 mb-4">
                      {/* Siècles */}
                      {form.centuries && form.centuries.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {form.centuries.slice(0, 3).map((century) => (
                              <Badge key={century} variant="outline" className="text-xs">
                                {century}
                              </Badge>
                            ))}
                            {form.centuries.length > 3 && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
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
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
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
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
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
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidation(form, 'activate');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidation(form, 'reject');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de validation */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {validationType === 'activate' ? 'Approuver la fiche' : 'Rejeter la fiche'}
            </DialogTitle>
          </DialogHeader>

            {selectedForm && (
                <div className="space-y-4">
                    {/* Informations de la fiche */}
                    <div className="bg-muted/30 p-4 rounded-md">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className={getCategoryColor(selectedForm.source)} variant="secondary">
                                {getCategoryLabel(selectedForm.source)}
                            </Badge>
                            {(() => {
                                const Icon = getDocumentTypeIcon(selectedForm);
                                return (
                                    <Badge className={getDocumentTypeColor(selectedForm)} variant="secondary">
                                        <Icon className="w-3 h-3 mr-1" />
                                        {getDocumentTypeLabel(selectedForm)}
                                    </Badge>
                                );
                            })()}
                        </div>
                        <h4 className="font-medium mb-1">{selectedForm.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            Par {formatAuthors(selectedForm.authors)}
                        </p>
                    </div>

                    {/* Message d'information sur le type de document */}
                    {selectedForm.parent_id && validationType === 'activate' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                            <p className="text-sm text-amber-800">
                                <strong>Note :</strong> Cette fiche est une modification soumise à relecture.
                                Elle remplacera la fiche existante après validation.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowValidationModal(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant={validationType === 'activate' ? 'default' : 'destructive'}
                            onClick={confirmValidation}
                            className={validationType === 'activate' ? 'flex-1 bg-green-600 hover:bg-green-700' : 'flex-1'}
                        >
                            {isValidating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {validationType === 'activate' ? 'Approbation...' : 'Rejet...'}
                                </div>
                            ) : (
                                validationType === 'activate' ? 'Approuver' : 'Rejeter'
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}