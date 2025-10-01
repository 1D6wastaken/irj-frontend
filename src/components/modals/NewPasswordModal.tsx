import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Lock, CheckCircle, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { apiService, ApiError } from "../../config/api";
import { validatePassword } from "../../utils/passwordValidation";

interface NewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: () => void;
}

export function NewPasswordModal({ isOpen, onClose, token, onSuccess }: NewPasswordModalProps) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer les erreurs spécifiques au champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation du mot de passe
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]; // Afficher la première erreur
    }

    // Validation de la confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
      // Appel API pour confirmer le nouveau mot de passe
      await apiService.confirmPasswordReset(token, formData.password);
      
      // 204: Succès - mot de passe réinitialisé
      onSuccess();
      handleClose();
      
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            setGeneralError('Le mot de passe ne respecte pas les contraintes de sécurité requises.');
            break;
          case 404:
            setGeneralError('Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.');
            break;
          default:
            setGeneralError('Une erreur est survenue lors de la réinitialisation. Veuillez réessayer plus tard.');
            break;
        }
      } else {
        setGeneralError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setFormData({ password: '', confirmPassword: '' });
      setErrors({});
      setGeneralError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  };

  // Afficher les critères de validation du mot de passe
  const passwordValidation = validatePassword(formData.password);

  // Créer les critères de validation avec leur état
  const getPasswordCriteria = (password: string) => {
    return [
      {
        text: 'Au moins 8 caractères',
        met: password.length >= 8
      },
      {
        text: 'Au moins une majuscule (A-Z)',
        met: /[A-Z]/.test(password)
      },
      {
        text: 'Au moins une minuscule (a-z)',
        met: /[a-z]/.test(password)
      },
      {
        text: 'Au moins un chiffre (0-9)',
        met: /\d/.test(password)
      },
      {
        text: 'Au moins un caractère spécial (!@#$%...)',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }
    ];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Nouveau mot de passe
          </DialogTitle>
          <DialogDescription>
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
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
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  placeholder="Votre nouveau mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
              
              {/* Critères de validation du mot de passe */}
              {formData.password && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm mb-2">Critères de sécurité :</p>
                  <div className="space-y-1">
                    {getPasswordCriteria(formData.password).map((criterion, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle 
                          className={`w-3 h-3 ${criterion.met ? 'text-green-500' : 'text-muted-foreground'}`}
                        />
                        <span className={criterion.met ? 'text-green-700' : 'text-muted-foreground'}>
                          {criterion.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  placeholder="Confirmez votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
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
              disabled={isLoading || !passwordValidation.isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}