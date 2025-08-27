import { useState } from "react";
import { ArrowLeft, Check, X, User, Mail, Phone, Building, Calendar, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { PendingUser, DOMAIN_MAPPING, apiService, ApiError } from "../config/api";
import { toast } from "sonner";

interface ValidateContributorsPageProps {
  onBack: () => void;
  pendingUsers: PendingUser[];
  onRefresh: () => void;
  onSessionExpired?: () => void;
}

export function ValidateContributorsPage({ onBack, pendingUsers, onRefresh, onSessionExpired }: ValidateContributorsPageProps) {
  const [selectedContributor, setSelectedContributor] = useState<PendingUser | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationType, setValidationType] = useState<'approve' | 'reject'>('approve');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non renseignée';
    
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getExpertiseLabel = (domain: string) => {
    return DOMAIN_MAPPING[domain as keyof typeof DOMAIN_MAPPING] || domain;
  };

  const getExpertiseColor = (domain: string) => {
    const colors: Record<string, string> = {
      'ART': 'bg-blue-100 text-blue-800',
      'ARCHITECTURE': 'bg-green-100 text-green-800',
      'MEDIEVAL': 'bg-purple-100 text-purple-800',
      'ARCHEOLOGIE': 'bg-orange-100 text-orange-800',
      'PATRIMOINE': 'bg-red-100 text-red-800',
      'THEOLOGIE': 'bg-indigo-100 text-indigo-800',
      'PELERINAGE': 'bg-yellow-100 text-yellow-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[domain] || 'bg-gray-100 text-gray-800';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleValidation = (contributor: PendingUser, type: 'approve' | 'reject') => {
    setSelectedContributor(contributor);
    setValidationType(type);
    setShowValidationModal(true);
  };

  // Action rapide sans modal pour approuver
  const handleQuickApprove = async (contributor: PendingUser, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setProcessingUsers(prev => new Set([...prev, contributor.id]));
    
    try {
      await apiService.validateUser(contributor.id, 'activate');
      
      toast.success(`${contributor.firstname} ${contributor.lastname} a été approuvé(e) avec succès.`);
      await onRefresh();

      // Si on est dans la vue détaillée et qu'on valide ce contributeur, fermer la vue
      if (selectedContributor && selectedContributor.id === contributor.id) {
        setSelectedContributor(null);
      }
      
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            toast.error("Erreur dans les paramètres envoyés. Veuillez réessayer.");
            break;
          case 401:
            toast.error("Votre session a expiré. Veuillez vous reconnecter.");
            if (onSessionExpired) {
              onSessionExpired();
            }
            break;
          case 403:
            toast.error("Vous n'avez pas les droits pour effectuer cette action.");
            break;
          case 404:
            toast.error("Utilisateur introuvable. La liste va être actualisée.");
            await onRefresh();
            break;
          default:
            toast.error("Une erreur est survenue. Veuillez réessayer.");
            break;
        }
      } else {
        toast.error("Erreur de connexion. Veuillez vérifier votre réseau.");
      }
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(contributor.id);
        return newSet;
      });
    }
  };

  // Action rapide sans modal pour rejeter
  const handleQuickReject = async (contributor: PendingUser, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setProcessingUsers(prev => new Set([...prev, contributor.id]));
    
    try {
      await apiService.validateUser(contributor.id, 'reject');
      
      toast.success(`La candidature de ${contributor.firstname} ${contributor.lastname} a été rejetée.`);
      await onRefresh();

      // Si on est dans la vue détaillée et qu'on rejette ce contributeur, fermer la vue
      if (selectedContributor && selectedContributor.id === contributor.id) {
        setSelectedContributor(null);
      }
      
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            toast.error("Erreur dans les paramètres envoyés. Veuillez réessayer.");
            break;
          case 401:
            toast.error("Votre session a expiré. Veuillez vous reconnecter.");
            if (onSessionExpired) {
              onSessionExpired();
            }
            break;
          case 403:
            toast.error("Vous n'avez pas les droits pour effectuer cette action.");
            break;
          case 404:
            toast.error("Utilisateur introuvable. La liste va être actualisée.");
            await onRefresh();
            break;
          default:
            toast.error("Une erreur est survenue. Veuillez réessayer.");
            break;
        }
      } else {
        toast.error("Erreur de connexion. Veuillez vérifier votre réseau.");
      }
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(contributor.id);
        return newSet;
      });
    }
  };

  const confirmValidation = async () => {
    if (!selectedContributor) return;

    setIsValidating(true);

    try {
      const action = validationType === 'approve' ? 'activate' : 'reject';
      await apiService.validateUser(selectedContributor.id, action);
      
      // 204: Succès
      toast.success(
        validationType === 'approve' 
          ? `${selectedContributor.firstname} ${selectedContributor.lastname} a été approuvé(e) avec succès.`
          : `La candidature de ${selectedContributor.firstname} ${selectedContributor.lastname} a été rejetée.`
      );
      
      // Rafraîchir les données après validation
      await onRefresh();
      
      // Fermer la modal et réinitialiser
      setShowValidationModal(false);

      // Fermer aussi la vue détaillée et revenir à la liste
      setSelectedContributor(null);
      
    } catch (error) {
      // En cas d'erreur, fermer la modal mais rester sur la vue détaillée
      setShowValidationModal(false);
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            toast.error("Erreur dans les paramètres envoyés. Veuillez réessayer.");
            break;
          case 401:
            toast.error("Votre session a expiré. Veuillez vous reconnecter.");
            if (onSessionExpired) {
              onSessionExpired();
            }
            break;
          case 403:
            toast.error("Vous n'avez pas les droits pour effectuer cette action.");
            break;
          case 404:
            toast.error("Utilisateur introuvable. La liste va être actualisée.");
            await onRefresh();
            // En cas de 404, fermer aussi la vue détaillée car l'utilisateur n'existe plus
            setSelectedContributor(null);
            break;
          default:
            toast.error("Une erreur est survenue. Veuillez réessayer.");
            break;
        }
      } else {
        toast.error("Erreur de connexion. Veuillez vérifier votre réseau.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  const viewContributorDetails = (contributor: PendingUser) => {
    setSelectedContributor(contributor);
  };

  const handleCardClick = (contributor: PendingUser) => {
    viewContributorDetails(contributor);
  };

  return (
    <div className="min-h-screen bg-secondary py-8">
      {/* Vue détaillée d'un contributeur */}
      {selectedContributor && (
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedContributor(null)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Candidature de contributeur
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Soumise le {formatDate(selectedContributor.creation_date)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleValidation(selectedContributor, 'reject')}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    disabled={processingUsers.has(selectedContributor.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={(e) => handleQuickApprove(selectedContributor, e)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={processingUsers.has(selectedContributor.id)}
                  >
                    {processingUsers.has(selectedContributor.id) ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {processingUsers.has(selectedContributor.id) ? 'Approbation...' : 'Approuver'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedContributor.firstname} {selectedContributor.lastname}
                    </h2>
                    <Badge className={getExpertiseColor(selectedContributor.domain)}>
                      {getExpertiseLabel(selectedContributor.domain)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p>{selectedContributor.mail}</p>
                      </div>
                    </div>

                    {selectedContributor.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                          <p>{selectedContributor.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedContributor.organization && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Organisation</Label>
                          <p>{selectedContributor.organization}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Motivation et profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Pourquoi souhaitez-vous contribuer à ce projet ?
                  </Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedContributor.motivation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de candidature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date de soumission</Label>
                    <p>{formatDate(selectedContributor.creation_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Vue liste des contributeurs */}
      {!selectedContributor && (
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Validation des contributeurs
              </h1>
              <p className="text-muted-foreground mt-2">
                {pendingUsers.length} candidature{pendingUsers.length > 1 ? 's' : ''} en attente de validation
              </p>
            </div>

            {/* Liste des contributeurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.map((contributor) => (
                <Card 
                  key={contributor.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(contributor)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={getExpertiseColor(contributor.domain)}>
                        {getExpertiseLabel(contributor.domain)}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(contributor.creation_date)}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {contributor.firstname} {contributor.lastname}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{contributor.mail}</span>
                    </div>
                    
                    {contributor.organization && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{contributor.organization}</span>
                      </div>
                    )}

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {contributor.motivation}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewContributorDetails(contributor);
                        }}
                        className="flex-1"
                        disabled={processingUsers.has(contributor.id)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        Voir profil
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => handleQuickReject(contributor, e)}
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={processingUsers.has(contributor.id)}
                      >
                        {processingUsers.has(contributor.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => handleQuickApprove(contributor, e)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={processingUsers.has(contributor.id)}
                      >
                        {processingUsers.has(contributor.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pendingUsers.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">
                  Aucune candidature en attente
                </h3>
                <p className="text-muted-foreground">
                  Toutes les candidatures ont été traitées.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de validation - toujours au niveau le plus haut pour être accessible depuis toute vue */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationType === 'approve' ? 'Approuver le contributeur' : 'Rejeter la candidature'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {validationType === 'approve' 
                ? `Vous êtes sur le point d'approuver la candidature de ${selectedContributor?.firstname} ${selectedContributor?.lastname}. Cette personne pourra alors contribuer au site.`
                : `Vous êtes sur le point de rejeter la candidature de ${selectedContributor?.firstname} ${selectedContributor?.lastname}. Cette personne sera notifiée par email.`
              }
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowValidationModal(false)}
              disabled={isValidating}
            >
              Annuler
            </Button>
            <Button 
              onClick={confirmValidation}
              className={validationType === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-destructive hover:bg-destructive/90'
              }
              disabled={isValidating}
            >
              {isValidating 
                ? (validationType === 'approve' ? 'Approbation...' : 'Rejet...')
                : (validationType === 'approve' ? 'Approuver' : 'Rejeter')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}