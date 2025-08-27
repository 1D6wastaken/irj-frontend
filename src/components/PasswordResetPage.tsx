import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Loader2, Lock } from "lucide-react";
import { apiService, ApiError } from "../config/api";
import { NewPasswordModal } from "./modals/NewPasswordModal";

interface PasswordResetPageProps {
  token: string;
  onBack: () => void;
}

export function PasswordResetPage({ token, onBack }: PasswordResetPageProps) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'error' | 'success'>('loading');
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const validateToken = async () => {
      try {
        await apiService.validateResetToken(token);
        // 204: Token valide
        setStatus('valid');
        setShowNewPasswordModal(true);
      } catch (error) {
        if (error instanceof ApiError) {
          switch (error.status) {
            case 404:
              setStatus('invalid');
              setErrorMessage('Ce lien de réinitialisation est invalide ou a expiré.');
              break;
            default:
              setStatus('error');
              setErrorMessage('Une erreur est survenue lors de la vérification du lien. Veuillez réessayer plus tard.');
              break;
          }
        } else {
          setStatus('error');
          setErrorMessage('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
        }
      }
    };

    validateToken();
  }, [token]);

  const handleSuccess = () => {
    setStatus('success');
    setShowNewPasswordModal(false);
  };

  const handleModalClose = () => {
    setShowNewPasswordModal(false);
    // Si la modal se ferme sans succès, revenir à l'accueil
    if (status === 'valid') {
      onBack();
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="mb-4">Vérification en cours...</h1>
            <p className="text-muted-foreground">
              Nous vérifions la validité de votre lien de réinitialisation.
            </p>
          </div>
        );

      case 'valid':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="mb-4">Lien valide</h1>
            <p className="text-muted-foreground mb-6">
              Votre lien de réinitialisation est valide. Une fenêtre va s'ouvrir pour définir votre nouveau mot de passe.
            </p>
            <Button 
              onClick={() => setShowNewPasswordModal(true)}
              className="bg-primary text-primary-foreground"
            >
              <Lock className="w-4 h-4 mr-2" />
              Définir mon nouveau mot de passe
            </Button>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="mb-4">Lien invalide</h1>
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Ce lien de réinitialisation n'est plus valide. Les liens de réinitialisation expirent après un certain temps pour des raisons de sécurité.
              </p>
              <p className="text-sm text-muted-foreground">
                Vous pouvez demander un nouveau lien de réinitialisation depuis la page de connexion.
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="mb-4">Erreur de connexion</h1>
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Une erreur technique est survenue lors de la vérification de votre lien.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="mb-4">Mot de passe réinitialisé !</h1>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Pour votre sécurité, nous vous recommandons de vous connecter immédiatement et de vérifier que tout fonctionne correctement.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-lg border shadow-sm p-8">
            {renderContent()}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="mb-2">Besoin d'aide ?</h4>
            <p className="text-sm text-muted-foreground">
              Si vous rencontrez des difficultés, n'hésitez pas à contacter notre support technique à l'adresse institut.irj@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Modal pour nouveau mot de passe */}
      <NewPasswordModal
        isOpen={showNewPasswordModal}
        onClose={handleModalClose}
        token={token}
        onSuccess={handleSuccess}
      />
    </div>
  );
}