import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { apiService, ApiError } from "../../config/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  onForgotPassword?: () => void;
  onPendingApproval?: () => void;
  onEmailConfirmation?: () => void;
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onForgotPassword,
  onPendingApproval,
  onEmailConfirmation
}: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      // Appel API pour la connexion
      await apiService.login(formData.email, formData.password);
      
      // Succès : fermer la modal et notifier le parent
      onSubmit(formData.email);
      handleClose();
      
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            setGeneralError('Données de connexion incorrectes. Veuillez vérifier votre email et mot de passe.');
            break;
          
          case 401:
            // Email non confirmé - ouvrir la modal de confirmation d'email
            if (onEmailConfirmation) {
              handleClose();
              onEmailConfirmation();
            } else {
              setGeneralError('Vous devez confirmer votre adresse email avant de pouvoir vous connecter.');
            }
            break;
          
          case 403:
            // Candidature en attente - ouvrir la modal spécifique
            if (onPendingApproval) {
              handleClose();
              onPendingApproval();
            } else {
              setGeneralError('Votre candidature est en cours de validation. Vous recevrez un email de confirmation dès qu\'elle sera approuvée.');
            }
            break;
          
          case 404:
            setGeneralError('Email ou mot de passe incorrect. Veuillez réessayer.');
            break;
          
          default:
            setGeneralError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
        }
      } else {
        setGeneralError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ email: '', password: '' });
    setErrors({});
    setGeneralError('');
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <LogIn className="w-6 h-6 text-primary" />
            Connexion
          </DialogTitle>
          <DialogDescription>
            Connectez-vous à votre compte contributeur pour accéder aux fonctionnalités avancées.
          </DialogDescription>
        </DialogHeader>

        {generalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="text-right">
            <Button 
              type="button" 
              variant="link" 
              className="text-sm text-primary p-0"
              onClick={onForgotPassword}
              disabled={isLoading}
            >
              Mot de passe oublié ?
            </Button>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}