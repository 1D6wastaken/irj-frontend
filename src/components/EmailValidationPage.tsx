import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { apiService, ApiError } from "../config/api";

type ValidationStatus = 'loading' | 'success' | 'already-verified' | 'invalid-token' | 'error';

interface EmailValidationPageProps {
  token: string;
  onBack: () => void;
}

export function EmailValidationPage({ token, onBack }: EmailValidationPageProps) {
  const [status, setStatus] = useState<ValidationStatus>('loading');

  useEffect(() => {
    const validateEmail = async () => {
      if (!token) {
        setStatus('invalid-token');
        return;
      }

      try {
        await apiService.validateEmailToken(token);
        setStatus('success');
      } catch (error) {
        if (error instanceof ApiError) {
          switch (error.status) {
            case 404:
              setStatus('invalid-token');
              break;
            case 409:
              setStatus('already-verified');
              break;
            default:
              setStatus('error');
              break;
          }
        } else {
          setStatus('error');
        }
      }
    };

    validateEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h1 className="mb-4">Validation de votre adresse email</h1>
            <p className="text-muted-foreground">
              Vérification en cours, veuillez patienter...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="mb-4 text-green-700">Email validé avec succès !</h1>
            <p className="text-muted-foreground mb-6">
              Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter à votre compte pour contribuer au patrimoine jacquaire.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack}>
                Retourner à l'accueil
              </Button>
            </div>
          </div>
        );

      case 'already-verified':
        return (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-600" />
            </div>
            <h1 className="mb-4 text-yellow-700">Email déjà vérifié</h1>
            <p className="text-muted-foreground mb-6">
              Votre adresse email a déjà été confirmée. Vous pouvez vous connecter à votre compte normalement.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack}>
                Retourner à l'accueil
              </Button>
            </div>
          </div>
        );

      case 'invalid-token':
        return (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="mb-4 text-red-700">Lien de validation invalide</h1>
            <p className="text-muted-foreground mb-6">
              Le lien de validation que vous avez utilisé est invalide ou a expiré. 
              Veuillez contacter un administrateur si le problème persiste.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack}>
                Retourner à l'accueil
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="mb-4 text-red-700">Erreur de validation</h1>
            <p className="text-muted-foreground mb-6">
              Une erreur est survenue lors de la validation de votre email. 
              Veuillez réessayer plus tard ou contacter un administrateur.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack}>
                Retourner à l'accueil
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Contenu principal */}
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}