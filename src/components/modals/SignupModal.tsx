import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { User, Mail, Lock, FileText, Building, Eye, EyeOff } from "lucide-react";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "../../utils/passwordValidation";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    firstname: string;
    lastname: string;
    mail: string;
    password: string;
    phone?: string;
    organization?: string;
    domain: string;
    motivation: string;
  }) => Promise<void>;
}

export function SignupModal({ isOpen, onClose, onSubmit }: SignupModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
    expertise: '',
    motivation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validation en temps réel pour le mot de passe
    if (field === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    // Validation stricte du mot de passe
    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      newErrors.password = passwordCheck.errors[0]; // Premier erreur
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.expertise) newErrors.expertise = 'Veuillez sélectionner votre domaine d\'expertise';
    if (!formData.motivation.trim()) newErrors.motivation = 'La motivation est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Préparer les données selon le format API requis
        const userData = {
          firstname: formData.firstName,
          lastname: formData.lastName,
          mail: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          organization: formData.organization || undefined,
          domain: formData.expertise,
          motivation: formData.motivation
        };

        // Appeler la fonction de App.tsx qui gère l'API et les codes de retour
        await onSubmit(userData);
        
        // En cas de succès, la modal sera fermée depuis App.tsx
        // et PendingApprovalModal sera ouverte depuis App.tsx
        
      } catch (error) {
        // Les erreurs sont gérées dans App.tsx avec des toasts
        console.error('Erreur lors de la soumission:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      organization: '',
      expertise: '',
      motivation: ''
    });
    setErrors({});
    setPasswordValidation(validatePassword(''));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Devenir contributeur
          </DialogTitle>
          <DialogDescription>
            Rejoignez notre communauté de contributeurs et participez à la préservation du patrimoine religieux de Saint-Jacques.
          </DialogDescription>
        </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg border-b pb-2">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      placeholder="votre@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        placeholder="Mot de passe sécurisé"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Indicateur de force du mot de passe */}
                    {formData.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Force du mot de passe :</span>
                          <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                            {getPasswordStrengthText(passwordValidation.strength)}
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordValidation.strength === 'weak' 
                                ? 'w-1/3 bg-destructive' 
                                : passwordValidation.strength === 'medium'
                                ? 'w-2/3 bg-yellow-500'
                                : 'w-full bg-green-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Messages d'erreur de validation */}
                    {!passwordValidation.isValid && formData.password && (
                      <div className="mt-2 space-y-1">
                        {passwordValidation.errors.map((error, index) => (
                          <p key={index} className="text-destructive text-xs">{error}</p>
                        ))}
                      </div>
                    )}

                    {/* Critères de validation */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Le mot de passe doit contenir :</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                          Au moins 1 majuscule
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                          Au moins 1 minuscule
                        </li>
                        <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                          Au moins 1 chiffre
                        </li>
                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : ''}>
                          Au moins 1 caractère spécial
                        </li>
                        <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                          Au moins 8 caractères
                        </li>
                      </ul>
                    </div>

                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg border-b pb-2">Informations professionnelles</h3>
                
                <div>
                  <Label htmlFor="organization">Organisation / Institution</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => handleChange('organization', e.target.value)}
                      className="pl-10"
                      placeholder="Université, musée, association..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expertise">Domaine d'expertise *</Label>
                  <Select onValueChange={(value) => handleChange('expertise', value)}>
                    <SelectTrigger className={errors.expertise ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Sélectionnez votre domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ART">Histoire de l'art</SelectItem>
                      <SelectItem value="ARCHITECTURE">Architecture religieuse</SelectItem>
                      <SelectItem value="MEDIEVAL">Histoire médiévale</SelectItem>
                      <SelectItem value="ARCHEOLOGIE">Archéologie</SelectItem>
                      <SelectItem value="PATRIMOINE">Conservation du patrimoine</SelectItem>
                      <SelectItem value="THEOLOGIE">Théologie</SelectItem>
                      <SelectItem value="PELERINAGE">Pèlerinages</SelectItem>
                      <SelectItem value="AUTRE">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.expertise && <p className="text-destructive text-sm mt-1">{errors.expertise}</p>}
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg border-b pb-2">Motivation</h3>
                
                <div>
                  <Label htmlFor="motivation">Pourquoi souhaitez-vous contribuer à ce projet ? *</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleChange('motivation', e.target.value)}
                    className={`min-h-[100px] ${errors.motivation ? 'border-destructive' : ''}`}
                    placeholder="Expliquez vos motivations, votre expérience pertinente, et comment vous souhaitez contribuer..."
                  />
                  {errors.motivation && <p className="text-destructive text-sm mt-1">{errors.motivation}</p>}
                </div>
              </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground"
                disabled={isSubmitting}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}