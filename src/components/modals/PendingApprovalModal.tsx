import { Clock, Users, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PendingApprovalModal({ isOpen, onClose }: PendingApprovalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Clock className="w-5 h-5 text-amber-500" />
            Candidature en cours de validation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Message principal */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">
                Votre candidature est en attente
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Votre demande de contribution est actuellement examinée par notre équipe. 
                Vous recevrez un email de confirmation dès qu'elle sera approuvée.
              </p>
            </div>
          </div>

          {/* Que puis-je faire en attendant ? */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              En attendant, vous pouvez :
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Explorer notre base de données du patrimoine</li>
              <li>• Effectuer des recherches avancées</li>
              <li>• Consulter les fiches détaillées existantes</li>
              <li>• Découvrir les différentes catégories de patrimoine</li>
            </ul>
          </div>

          {/* Informations de contact */}
          <div className="bg-accent/30 border border-accent rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Questions ?</strong> Contactez-nous à{' '}
              <span className="text-primary">contact@saintjacques.fr</span>
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
          >
            Continuer la navigation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}