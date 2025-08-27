import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { apiService, ApiError } from "../../config/api";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('L\'email est requis');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Appel API pour la réinitialisation de mot de passe
      await apiService.resetPassword(email);
      
      // 204: Succès - l'email sera envoyé
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        setEmail('');
        setError('');
      }, 3000);
      
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            setError('Adresse email invalide. Veuillez vérifier votre saisie.');
            break;
          default:
            setError('Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer plus tard.');
            break;
        }
      } else {
        setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitted && !isLoading) {
      onClose();
      setEmail('');
      setError('');
      setIsSubmitted(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl mb-4">Email envoyé !</DialogTitle>
            <DialogDescription className="text-lg">
              Un lien de réinitialisation a été envoyé à votre adresse email.
              <br />
              Vérifiez votre boîte de réception et vos spams.
              <br />
              <span className="text-sm text-muted-foreground mt-4 block">
                Cette fenêtre se fermera automatiquement...
              </span>
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <ArrowLeft className="w-6 h-6 text-primary" />
                Mot de passe oublié
              </DialogTitle>
              <DialogDescription>
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`pl-10 ${error ? 'border-destructive' : ''}`}
                      placeholder="votre@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  {error && <p className="text-destructive text-sm mt-1">{error}</p>}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer le lien
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="bg-muted rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">Besoin d'aide ?</h4>
              <p className="text-sm text-muted-foreground">
                Si vous n'avez pas reçu l'email dans quelques minutes, vérifiez votre dossier spam ou contactez-nous.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}