import { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash2, User, Mail, Lock, Shield, AlertTriangle, Phone, Eye, EyeOff, Loader2, Building, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User as UserType } from "../App";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "../utils/passwordValidation";
import { apiService, ApiError, UserProfile, DOMAIN_MAPPING, formatCreationDate } from "../config/api";
import { toast } from "sonner";

interface AccountPageProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
  onBack: () => void;
  onSessionExpired: (message?: string) => void;
}

export function AccountPage({ user, onUpdateUser, onBack, onSessionExpired }: AccountPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    domain: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
  const [dataLoaded, setDataLoaded] = useState(false); // Protection contre les rechargements multiples

  // Charger les données utilisateur depuis l'API
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user.id) {
        toast.error("ID utilisateur manquant");
        onBack();
        return;
      }

      // Si les données sont déjà chargées, ne pas recharger
      if (dataLoaded) {
        return;
      }

      setIsLoading(true);
      try {
        const profile = await apiService.getUserProfile(user.id);
        setUserProfile(profile);
        
        // Remplir le formulaire avec les données de l'API
        setFormData({
          firstName: profile.firstname,
          lastName: profile.lastname,
          email: profile.mail,
          phone: profile.phone || '',
          organization: profile.organization || '',
          domain: profile.domain,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Mettre à jour les données utilisateur dans l'app
        const updatedUser: UserType = {
          ...user,
          firstName: profile.firstname,
          lastName: profile.lastname,
          email: profile.mail,
          phone: profile.phone
        };
        onUpdateUser(updatedUser);

        setDataLoaded(true); // Marquer les données comme chargées

      } catch (error) {
        if (error instanceof ApiError) {
          switch (error.status) {
            case 401:
              onSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
              break;
            case 404:
              onSessionExpired("Votre compte n'existe plus. Veuillez vous reconnecter.");
              break;
            case 403:
              toast.error("Vous n'avez pas les droits pour accéder à ces informations.");
              onBack();
              break;
            default:
              toast.error("Erreur lors du chargement des données utilisateur.");
              onBack();
          }
        } else {
          toast.error("Impossible de charger les données utilisateur.");
          onBack();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user.id, dataLoaded, user, onBack, onUpdateUser, onSessionExpired]); // Seulement user.id et dataLoaded comme dépendances

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validation en temps réel pour le nouveau mot de passe
    if (field === 'newPassword') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) newErrors.currentPassword = 'Le mot de passe actuel est requis';
      
      // Validation stricte du nouveau mot de passe
      if (!formData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe est requis';
      } else {
        const passwordCheck = validatePassword(formData.newPassword);
        if (!passwordCheck.isValid) {
          newErrors.newPassword = passwordCheck.errors[0]; // Premier erreur
        }
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Préparer les données pour l'API
      const updateData: {
        firstname: string;
        lastname: string;
        mail: string;
        password?: string;
        old_password?: string;
        phone?: string;
        organization?: string;
        domain: 'ART' | 'ARCHITECTURE' | 'MEDIEVAL' | 'ARCHEOLOGIE' | 'PATRIMOINE' | 'THEOLOGIE' | 'PELERINAGE' | 'AUTRE';
      } = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        mail: formData.email,
        domain: formData.domain as 'ART' | 'ARCHITECTURE' | 'MEDIEVAL' | 'ARCHEOLOGIE' | 'PATRIMOINE' | 'THEOLOGIE' | 'PELERINAGE' | 'AUTRE'
      };

      // Ajouter les mots de passe seulement si fournis
      if (formData.currentPassword && formData.newPassword) {
        updateData.password = formData.newPassword;
        updateData.old_password = formData.currentPassword;
      }

      // Ajouter les champs optionnels seulement si non vides
      if (formData.phone.trim()) {
        updateData.phone = formData.phone;
      }
      
      if (formData.organization.trim()) {
        updateData.organization = formData.organization;
      }

      // Appel API pour mettre à jour le profil
      await apiService.updateUserProfile(user.id, updateData);
      
      // Mettre à jour les données utilisateur locales
      const updatedUser: UserType = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined
      };
      
      onUpdateUser(updatedUser);
      setSaved(true);
      
      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setPasswordValidation(validatePassword(''));
      
      toast.success("Vos informations ont été mises à jour avec succès !");
      setTimeout(() => setSaved(false), 3000);

    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            toast.error("Paramètres invalides. Vérifiez les informations saisies.");
            break;
          case 401:
            onSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
            break;
          case 403:
            onSessionExpired("Accès non autorisé. Veuillez vous reconnecter.");
            break;
          case 404:
            onSessionExpired("Votre compte n'existe plus. Veuillez vous reconnecter.");
            break;
          case 409:
            setErrors({ email: "Cette adresse email est déjà utilisée par un autre compte." });
            toast.error("Cette adresse email est déjà utilisée par un autre compte.");
            break;
          default:
            toast.error("Erreur lors de la mise à jour des informations.");
        }
      } else {
        toast.error("Erreur lors de la mise à jour des informations.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiService.deleteUserAccount(user.id);
      
      // Succès (204) - Déconnecter l'utilisateur et retourner à l'accueil
      toast.success("Votre compte a été supprimé avec succès.");
      setShowDeleteDialog(false);
      
      // Déconnexion automatique
      setTimeout(() => {
        onSessionExpired("Votre compte a été supprimé.");
      }, 1500);
      
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            // Authorization invalide - déconnecter
            setShowDeleteDialog(false);
            onSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
            break;
          case 403:
            // Interdiction de supprimer l'utilisateur
            toast.error("Vous n'êtes pas autorisé à supprimer ce compte.");
            setShowDeleteDialog(false);
            break;
          case 404:
            // Utilisateur non trouvé - déconnecter
            setShowDeleteDialog(false);
            onSessionExpired("Votre compte n'existe plus.");
            break;
          default:
            toast.error("Erreur lors de la suppression du compte. Veuillez réessayer.");
            setShowDeleteDialog(false);
        }
      } else {
        toast.error("Erreur lors de la suppression du compte. Veuillez réessayer.");
        setShowDeleteDialog(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Mon compte</h1>
                <p className="text-muted-foreground">Chargement des informations...</p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Prénom</Label>
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Mon compte</h1>
              <p className="text-muted-foreground">Gérez vos informations personnelles</p>
            </div>
          </div>

          {saved && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Vos informations ont été mises à jour avec succès !
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nom</Label>
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium">Statut du compte</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rôle : <span className="font-medium capitalize">{user.role}</span>
                    <br />
                    {userProfile?.creation_date && (
                      <>Membre depuis : <span className="font-medium">{formatCreationDate(userProfile.creation_date)}</span></>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informations professionnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="organization">Organisation / Établissement</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => handleChange('organization', e.target.value)}
                      className="pl-10"
                      placeholder="Nom de votre organisation (optionnel)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="domain">Domaine d'expertise</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={formData.domain} onValueChange={(value) => handleChange('domain', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOMAIN_MAPPING).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Changement de mot de passe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Changer le mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleChange('currentPassword', e.target.value)}
                      className={`pl-10 pr-10 ${errors.currentPassword ? 'border-destructive' : ''}`}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-destructive text-sm mt-1">{errors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                        placeholder="Nouveau mot de passe sécurisé"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    {formData.newPassword && (
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
                    {!passwordValidation.isValid && formData.newPassword && (
                      <div className="mt-2 space-y-1">
                        {passwordValidation.errors.map((error, index) => (
                          <p key={index} className="text-destructive text-xs">{error}</p>
                        ))}
                      </div>
                    )}

                    {errors.newPassword && <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        placeholder="Répétez le nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Critères de validation affichés quand on saisit un nouveau mot de passe */}
                {formData.newPassword && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Le mot de passe doit contenir :</p>
                    <ul className="space-y-1 text-xs">
                      <li className={`flex items-center gap-2 ${
                        /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`} />
                        Au moins 1 majuscule
                      </li>
                      <li className={`flex items-center gap-2 ${
                        /[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          /[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`} />
                        Au moins 1 minuscule
                      </li>
                      <li className={`flex items-center gap-2 ${
                        /\d/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          /\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`} />
                        Au moins 1 chiffre
                      </li>
                      <li className={`flex items-center gap-2 ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`} />
                        Au moins 1 caractère spécial
                      </li>
                      <li className={`flex items-center gap-2 ${
                        formData.newPassword.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`} />
                        Au moins 8 caractères
                      </li>
                    </ul>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe.
                </p>
              </CardContent>
            </Card>

            {/* Zone dangereuse */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Zone dangereuse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
                  <div>
                    <h4 className="font-medium">Supprimer le compte</h4>
                    <p className="text-sm text-muted-foreground">
                      Cette action est irréversible et supprimera toutes vos données.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                Retour
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Dialog de confirmation de suppression */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données et contributions.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Supprimer définitivement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}