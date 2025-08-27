import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Mail, AlertTriangle } from "lucide-react";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailConfirmationModal({ isOpen, onClose }: EmailConfirmationModalProps) {
  const handleContactSupport = () => {
    window.location.href = 'mailto:institut.irj@gmail.com?subject=Problème de validation d\'email';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <DialogTitle>Confirmez votre adresse email</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left space-y-4">
            <p>
              Vous devez confirmer votre adresse email avant de pouvoir vous connecter à votre compte.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-800 text-sm">
                    <strong>Vérifiez votre boîte email</strong><br />
                    Un email de validation a été envoyé à votre adresse lors de l'activation de votre compte par un administrateur.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-yellow-800 text-sm">
                    <strong>Vérifiez vos spams</strong><br />
                    L'email de validation peut se trouver dans votre dossier de courriers indésirables ou spams.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Si vous ne trouvez pas l'email de validation, contactez notre support technique qui pourra vous aider à résoudre le problème.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Fermer
          </Button>
          <Button 
            onClick={handleContactSupport}
            className="flex-1"
          >
            Contacter le support
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}