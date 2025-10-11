import {useState, useEffect, useRef} from "react";
import {Header} from "./components/Header";
import {HeroSection} from "./components/HeroSection";
import {CategoriesSection} from "./components/CategoriesSection";
import {SearchSection} from "./components/SearchSection";
import {WhySection} from "./components/WhySection";
import {Footer} from "./components/Footer";
import {SearchResults} from "./components/SearchResults";
import {ContributePage} from "./components/ContributePage";
import {AccountPage} from "./components/AccountPage";
import {ValidateFormsPage} from "./components/ValidateFormsPage";
import {ValidateContributorsPage} from "./components/ValidateContributorsPage";
import {DetailPage} from "./components/DetailPage";
import {ValidateFormDetailPage} from "./components/ValidateFormDetailPage";
import {EmailValidationPage} from "./components/EmailValidationPage";
import {LegalMentionsPage} from "./components/LegalMentionsPage";
import {PrivacyPolicyPage} from "./components/PrivacyPolicyPage";
import {TermsOfUsePage} from "./components/TermsOfUsePage";
import {SignupModal} from "./components/modals/SignupModal";
import {LoginModal} from "./components/modals/LoginModal";
import {ResetPasswordModal} from "./components/modals/ResetPasswordModal";
import {NewPasswordModal} from "./components/modals/NewPasswordModal";
import {PendingApprovalModal} from "./components/modals/PendingApprovalModal";
import {EmailConfirmationModal} from "./components/modals/EmailConfirmationModal";
import {CookieBanner} from "./components/CookieBanner";
import {toast, Toaster} from "sonner";
import {apiService, ApiError, PendingUser, PendingForm} from "./config/api";
import {CrashBoundary} from "./components/CrashBoundary.tsx";
import {LanguageProvider} from "./hooks/dynamicHomeText.tsx";

export interface AdvancedFilters {
    location?: {
        communes?: string[]; // Array d'IDs de communes
        departments?: string[]; // Array d'IDs de départements
        regions?: string[]; // Array d'IDs de régions
        countries?: string[]; // Array d'IDs de pays
    };
    centuries?: string[];
    naturesMonu?: string[];
    naturesMob?: string[];
    naturesOrg?: string[];
    conservationStatesMonu?: string[];
    conservationStatesMob?: string[];
    materialsMonu?: string[];
    materialsMob?: string[];
    techniques?: string[];
    professions?: string[];
    transportModes?: string[];
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'contributeur' | 'admin';
}

export default function App() {
    const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'contribute' | 'account' | 'validate-forms' | 'validate-contributors' | 'detail' | 'validate-form-detail' | 'email-validation' | 'legal-mentions' | 'privacy-policy' | 'terms-of-use'>('home');
    const [currentDetailId, setCurrentDetailId] = useState<string>('');
    const [currentValidateFormId, setCurrentValidateFormId] = useState<string>('');
    const [currentValidateFormSource, setCurrentValidateFormSource] = useState<'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques'>('monuments_lieux');
    const [emailValidationToken, setEmailValidationToken] = useState<string>('');
    const [passwordResetToken, setPasswordResetToken] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

    // États d'authentification
    const [user, setUser] = useState<User | null>(null);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
    const [showPendingApprovalModal, setShowPendingApprovalModal] = useState(false);
    const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);

    // Notifications admin
    const [pendingContributorsCount, setPendingContributorsCount] = useState(0);
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [pendingFormsCount, setPendingFormsCount] = useState(0);
    const [pendingForms, setPendingForms] = useState<{
        monuments_lieux: PendingForm[];
        mobiliers_images: PendingForm[];
        personnes_morales: PendingForm[];
        personnes_physiques: PendingForm[];
    }>({
        monuments_lieux: [],
        mobiliers_images: [],
        personnes_morales: [],
        personnes_physiques: []
    });
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const formsPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // Fonction pour charger les contributeurs en attente (pour les admins)
    const loadPendingUsers = async () => {
        if (!user || user.role !== 'admin') return;

        try {
            const pendingUsersList = await apiService.getPendingUsers();
            setPendingUsers(pendingUsersList);
            setPendingContributorsCount(pendingUsersList.length);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    handleSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
                    return;
                } else if (error.status === 403) {
                    // L'utilisateur n'est plus admin, ne pas afficher d'erreur mais arrêter le polling
                    setPendingContributorsCount(0);
                    setPendingUsers([]);
                    return;
                }
            }
            // Ne pas afficher d'erreur pour les échecs de polling en arrière-plan
            console.error('Erreur lors du chargement des contributeurs en attente:', error);
        }
    };

    // Fonction pour charger les fiches en attente de validation (pour les admins)
    const loadPendingForms = async () => {
        if (!user || user.role !== 'admin') return;

        try {
            const [
                monumentsLieux,
                mobiliersImages,
                personnesMorales,
                personnesPhysiques
            ] = await Promise.all([
                apiService.getPendingMonumentsLieux(),
                apiService.getPendingMobiliersImages(),
                apiService.getPendingPersonnesMorales(),
                apiService.getPendingPersonnesPhysiques()
            ]);

            const newPendingForms = {
                monuments_lieux: Array.isArray(monumentsLieux) ? monumentsLieux : [],
                mobiliers_images: Array.isArray(mobiliersImages) ? mobiliersImages : [],
                personnes_morales: Array.isArray(personnesMorales) ? personnesMorales : [],
                personnes_physiques: Array.isArray(personnesPhysiques) ? personnesPhysiques : []
            };

            setPendingForms(newPendingForms);

            // Calculer le nombre total de fiches en attente
            const totalCount = newPendingForms.monuments_lieux.length +
                newPendingForms.mobiliers_images.length +
                newPendingForms.personnes_morales.length +
                newPendingForms.personnes_physiques.length;

            setPendingFormsCount(totalCount);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    handleSessionExpired("Votre session a expiré. Veuillez vous reconnecter.");
                    return;
                } else if (error.status === 403) {
                    // L'utilisateur n'est plus admin, ne pas afficher d'erreur mais arrêter le polling
                    setPendingFormsCount(0);
                    setPendingForms({
                        monuments_lieux: [],
                        mobiliers_images: [],
                        personnes_morales: [],
                        personnes_physiques: []
                    });
                    return;
                }
            }
            // Ne pas afficher d'erreur pour les échecs de polling en arrière-plan
            console.error('Erreur lors du chargement des fiches en attente:', error);
        }
    };

    // Fonction pour gérer la déconnexion forcée (session expirée)
    const handleSessionExpired = (message: string = "Votre session a expiré. Veuillez vous reconnecter.") => {
        // Arrêter tous les pollings
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (formsPollingIntervalRef.current) {
            clearInterval(formsPollingIntervalRef.current);
            formsPollingIntervalRef.current = null;
        }

        apiService.logout();
        setUser(null);
        setPendingContributorsCount(0);
        setPendingUsers([]);
        setPendingFormsCount(0);
        setPendingForms({
            monuments_lieux: [],
            mobiliers_images: [],
            personnes_morales: [],
            personnes_physiques: []
        });
        setCurrentPage('home');
        toast.error(message);
    };

    // Vérifier l'authentification au chargement et détecter la route de validation d'email
    useEffect(() => {
        // Vérifier si on est sur la route de validation d'email
        const path = window.location.pathname;
        const emailValidationMatch = path.match(/^\/email\/([^/]+)\/validate$/);

        if (emailValidationMatch) {
            const token = emailValidationMatch[1];
            setEmailValidationToken(token);
            setCurrentPage('email-validation');

            // Nettoyer l'URL après avoir récupéré le token pour éviter les recharges accidentelles
            window.history.replaceState({}, '', '/');
            return; // Ne pas continuer avec l'authentification normale
        }

        // Vérifier si on est sur la route de réinitialisation de mot de passe
        const passwordResetMatch = path.match(/^\/reset\/([^/]+)$/);

        if (passwordResetMatch) {
            const token = passwordResetMatch[1];
            setPasswordResetToken(token);

            // Nettoyer l'URL après avoir récupéré le token pour éviter les recharges accidentelles
            window.history.replaceState({}, '', '/');

            // Valider le token en arrière-plan et ouvrir la modal si valide
            validatePasswordResetToken(token);

            return; // Ne pas continuer avec l'authentification normale
        }

        // Vérifier si l'utilisateur a un token valide
        if (apiService.isAuthenticated()) {
            const userData = apiService.getUserData();

            if (userData && userData.userId) {
                // Utiliser l'ID réel du JWT et les données stockées
                const user: User = {
                    id: userData.userId, // ID réel du JWT
                    firstName: userData.firstname,
                    lastName: '', // Sera rempli depuis l'API lors de l'accès au compte
                    email: userData.email || '',
                    phone: undefined, // Sera rempli depuis l'API lors de l'accès au compte
                    role: userData.role || 'contributeur'
                };
                setUser(user);
            }
        }
    }, []);

    // Polling pour les notifications des contributeurs en attente (admins seulement)
    useEffect(() => {
        if (user && user.role === 'admin') {
            // Charger immédiatement
            loadPendingUsers();
            loadPendingForms();

            // Configurer le polling toutes les minutes
            pollingIntervalRef.current = setInterval(loadPendingUsers, 60000);

            // Configurer le polling pour les fiches toutes les minutes
            formsPollingIntervalRef.current = setInterval(loadPendingForms, 60000);
        } else {
            // Arrêter tous les pollings si l'utilisateur n'est plus admin
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            if (formsPollingIntervalRef.current) {
                clearInterval(formsPollingIntervalRef.current);
                formsPollingIntervalRef.current = null;
            }
            setPendingContributorsCount(0);
            setPendingUsers([]);
            setPendingFormsCount(0);
            setPendingForms({
                monuments_lieux: [],
                mobiliers_images: [],
                personnes_morales: [],
                personnes_physiques: []
            });
        }

        // Cleanup
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            if (formsPollingIntervalRef.current) {
                clearInterval(formsPollingIntervalRef.current);
                formsPollingIntervalRef.current = null;
            }
        };
    }, [user?.role]);

    // Cleanup global au démontage du composant
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            if (formsPollingIntervalRef.current) {
                clearInterval(formsPollingIntervalRef.current);
            }
        };
    }, []);

    // Force scroll to top on page change
    useEffect(() => {
        if (currentPage === 'search' || currentPage === 'detail' || currentPage === 'validate-form-detail' || currentPage === 'contribute') {
            setTimeout(() => {window.scrollTo({top: 0, behavior: 'smooth'});}, 50);
        }
    }, [currentPage]);

    const handleSearch = (
        query: string,
        categories: string[] = [],
        filters: AdvancedFilters = {}
    ) => {
        setSearchQuery(query);
        setSelectedCategories(categories);
        setAdvancedFilters(filters);
        setCurrentPage('search');
    };

    const handleCategorySearch = (categoryId: string) => {
        // Recherche par catégorie avec une requête générique
        setSearchQuery('');
        setSelectedCategories([categoryId]);
        setAdvancedFilters({});
        setCurrentPage('search');
    };

    const handleBackToHome = () => {
        setCurrentPage('home');
        // Scroll vers le haut de la page
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleViewDetail = (resultId: string, source?: string) => {
        // Store both ID and source for DetailPage
        if (source) {
            setCurrentDetailId(`${source}:${resultId}`);
        } else {
            setCurrentDetailId(resultId);
        }

        setCurrentPage('detail');
    };

    const handleViewFormDetail = (formId: string, formSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => {
        setCurrentValidateFormId(formId);
        setCurrentValidateFormSource(formSource);
        setCurrentPage('validate-form-detail');
    };

    const handleBackToValidateForms = () => {
        setCurrentPage('validate-forms');
        // Rafraîchir les données après retour depuis les détails
        loadPendingForms();
    };

    const handleBackToSearch = () => {
        setCurrentPage('search');
    };

    const handleLogin = async (email: string) => {
        // Cette fonction sera appelée après le succès de l'API login
        // Récupérer les données utilisateur stockées par l'API
        const userData = apiService.getUserData();

        if (userData && userData.userId) {
            const user: User = {
                id: userData.userId, // ID réel du JWT
                firstName: userData.firstname,
                lastName: '', // Sera rempli depuis l'API lors de l'accès au compte
                email: userData.email || email,
                phone: undefined, // Sera rempli depuis l'API lors de l'accès au compte
                role: userData.role || 'contributeur'
            };

            setUser(user);
        } else {
            // Fallback si les données ne sont pas disponibles
            const fallbackUser: User = {
                id: 'temp-id',
                firstName: 'Utilisateur',
                lastName: 'Connecté',
                email: email,
                phone: undefined,
                role: 'contributeur'
            };
            setUser(fallbackUser);
        }

        setShowLoginModal(false);
        setCurrentPage('home');
    };

    const handleLogout = () => {
        // Arrêter tous les pollings
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (formsPollingIntervalRef.current) {
            clearInterval(formsPollingIntervalRef.current);
            formsPollingIntervalRef.current = null;
        }

        // Déconnexion via API pour nettoyer le token et les données utilisateur
        apiService.logout();
        setUser(null);
        setPendingContributorsCount(0);
        setPendingUsers([]);
        setPendingFormsCount(0);
        setPendingForms({
            monuments_lieux: [],
            mobiliers_images: [],
            personnes_morales: [],
            personnes_physiques: []
        });
        setCurrentPage('home');
    };

    const handleSignup = async (formData: {
        firstname: string;
        lastname: string;
        mail: string;
        password: string;
        phone?: string;
        organization?: string;
        domain: string;
        motivation: string;
    }) => {
        try {
            await apiService.createUser(formData);

            // 201: Utilisateur créé avec succès et en attente d'approbation
            setShowSignupModal(false);
            setShowPendingApprovalModal(true);
            toast.success("Votre candidature a été soumise avec succès !");

        } catch (error) {
            if (error instanceof ApiError) {
                switch (error.status) {
                    case 400:
                        // Erreur de paramètre
                        toast.error("Erreur dans les données du formulaire. Veuillez vérifier vos informations.");
                        // On reste sur le formulaire (ne pas fermer la modal)
                        break;
                    case 409:
                        // Mail déjà utilisé
                        toast.error("Cette adresse email est déjà utilisée. Veuillez en choisir une autre.");
                        // On reste sur le formulaire (ne pas fermer la modal)
                        break;
                    default:
                        toast.error("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
                        break;
                }
            } else {
                toast.error("Une erreur réseau est survenue. Veuillez vérifier votre connexion.");
            }
        }
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const openSignupModal = () => {
        setShowSignupModal(true);
    };

    const openResetPasswordModal = () => {
        setShowLoginModal(false);
        setShowResetPasswordModal(true);
    };

    const handlePendingApproval = () => {
        setShowPendingApprovalModal(true);
    };

    const handleEmailConfirmation = () => {
        setShowEmailConfirmationModal(true);
    };

    const handleNavigateToLegal = (page: 'legal-mentions' | 'privacy-policy' | 'terms-of-use') => {
        setCurrentPage(page);
        setTimeout(() => {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }, 50);
    };

    // Fonction pour valider le token de réinitialisation de mot de passe
    const validatePasswordResetToken = async (token: string) => {
        try {
            await apiService.validateResetToken(token);
            // 204: Token valide - ouvrir la modal de nouveau mot de passe
            setShowNewPasswordModal(true);
        } catch (error) {
            if (error instanceof ApiError) {
                switch (error.status) {
                    case 404:
                        toast.error("Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.");
                        break;
                    default:
                        toast.error("Une erreur est survenue lors de la vérification du lien. Veuillez réessayer plus tard.");
                        break;
                }
            } else {
                toast.error("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.");
            }
            // Réinitialiser le token en cas d'erreur
            setPasswordResetToken('');
        }
    };

    // Fonction pour gérer le succès de la réinitialisation de mot de passe
    const handlePasswordResetSuccess = () => {
        setShowNewPasswordModal(false);
        setPasswordResetToken('');
        toast.success("Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.");
    };

    // Page de validation d'email
    if (currentPage === 'email-validation') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                        <Header
                            user={user}
                            onSignup={openSignupModal}
                            onLogin={() => setShowLoginModal(true)}
                            onLogout={handleLogout}
                            onNavigate={setCurrentPage}
                            pendingFormsCount={pendingFormsCount}
                            pendingContributorsCount={pendingContributorsCount}
                        />
                        <EmailValidationPage
                            token={emailValidationToken}
                            onBack={handleBackToHome}
                        />
                        <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                        {/* Modals */}
                        <SignupModal
                            isOpen={showSignupModal}
                            onClose={() => setShowSignupModal(false)}
                            onSubmit={handleSignup}
                        />
                        <LoginModal
                            isOpen={showLoginModal}
                            onClose={() => setShowLoginModal(false)}
                            onSubmit={handleLogin}
                            onForgotPassword={openResetPasswordModal}
                            onPendingApproval={handlePendingApproval}
                            onEmailConfirmation={handleEmailConfirmation}
                        />
                        <ResetPasswordModal
                            isOpen={showResetPasswordModal}
                            onClose={() => setShowResetPasswordModal(false)}
                        />
                        <PendingApprovalModal
                            isOpen={showPendingApprovalModal}
                            onClose={() => setShowPendingApprovalModal(false)}
                        />
                        <EmailConfirmationModal
                            isOpen={showEmailConfirmationModal}
                            onClose={() => setShowEmailConfirmationModal(false)}
                        />

                        {/* Toast notifications */}
                        <Toaster/>

                        <CookieBanner />
                    </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    // Pages légales
    if (currentPage === 'legal-mentions') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <LegalMentionsPage onBack={handleBackToHome}/>
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Modals */}
                <SignupModal
                    isOpen={showSignupModal}
                    onClose={() => setShowSignupModal(false)}
                    onSubmit={handleSignup}
                />
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSubmit={handleLogin}
                    onForgotPassword={openResetPasswordModal}
                    onPendingApproval={handlePendingApproval}
                    onEmailConfirmation={handleEmailConfirmation}
                />
                <ResetPasswordModal
                    isOpen={showResetPasswordModal}
                    onClose={() => setShowResetPasswordModal(false)}
                />
                <PendingApprovalModal
                    isOpen={showPendingApprovalModal}
                    onClose={() => setShowPendingApprovalModal(false)}
                />
                <EmailConfirmationModal
                    isOpen={showEmailConfirmationModal}
                    onClose={() => setShowEmailConfirmationModal(false)}
                />

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    // Politique de confidentialité
    if (currentPage === 'privacy-policy') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <PrivacyPolicyPage onBack={handleBackToHome}/>
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Modals */}
                <SignupModal
                    isOpen={showSignupModal}
                    onClose={() => setShowSignupModal(false)}
                    onSubmit={handleSignup}
                />
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSubmit={handleLogin}
                    onForgotPassword={openResetPasswordModal}
                    onPendingApproval={handlePendingApproval}
                    onEmailConfirmation={handleEmailConfirmation}
                />
                <ResetPasswordModal
                    isOpen={showResetPasswordModal}
                    onClose={() => setShowResetPasswordModal(false)}
                />
                <PendingApprovalModal
                    isOpen={showPendingApprovalModal}
                    onClose={() => setShowPendingApprovalModal(false)}
                />
                <EmailConfirmationModal
                    isOpen={showEmailConfirmationModal}
                    onClose={() => setShowEmailConfirmationModal(false)}
                />

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    // CGU
    if (currentPage === 'terms-of-use') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <TermsOfUsePage onBack={handleBackToHome}/>
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Modals */}
                <SignupModal
                    isOpen={showSignupModal}
                    onClose={() => setShowSignupModal(false)}
                    onSubmit={handleSignup}
                />
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSubmit={handleLogin}
                    onForgotPassword={openResetPasswordModal}
                    onPendingApproval={handlePendingApproval}
                    onEmailConfirmation={handleEmailConfirmation}
                />
                <ResetPasswordModal
                    isOpen={showResetPasswordModal}
                    onClose={() => setShowResetPasswordModal(false)}
                />
                <PendingApprovalModal
                    isOpen={showPendingApprovalModal}
                    onClose={() => setShowPendingApprovalModal(false)}
                />
                <EmailConfirmationModal
                    isOpen={showEmailConfirmationModal}
                    onClose={() => setShowEmailConfirmationModal(false)}
                />

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    // Page de détail
    if (currentPage === 'detail') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <DetailPage
                    resultId={currentDetailId}
                    onBack={handleBackToSearch}
                    onViewDetail={handleViewDetail}
                />
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Modals */}
                <SignupModal
                    isOpen={showSignupModal}
                    onClose={() => setShowSignupModal(false)}
                    onSubmit={handleSignup}
                />
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSubmit={handleLogin}
                    onForgotPassword={openResetPasswordModal}
                    onPendingApproval={handlePendingApproval}
                    onEmailConfirmation={handleEmailConfirmation}
                />
                <ResetPasswordModal
                    isOpen={showResetPasswordModal}
                    onClose={() => setShowResetPasswordModal(false)}
                />
                <PendingApprovalModal
                    isOpen={showPendingApprovalModal}
                    onClose={() => setShowPendingApprovalModal(false)}
                />
                <EmailConfirmationModal
                    isOpen={showEmailConfirmationModal}
                    onClose={() => setShowEmailConfirmationModal(false)}
                />

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    // Pages spécifiques aux utilisateurs connectés
    if (currentPage === 'contribute' && user) {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <ContributePage user={user} onBack={handleBackToHome}/>
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    if (currentPage === 'account' && user) {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <AccountPage
                    user={user}
                    onUpdateUser={setUser}
                    onBack={handleBackToHome}
                    onSessionExpired={handleSessionExpired}
                />
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    // Pages admin
    if (currentPage === 'validate-forms' && user?.role === 'admin') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <ValidateFormsPage
                    onBack={handleBackToHome}
                    pendingForms={pendingForms}
                    onRefresh={loadPendingForms}
                    onSessionExpired={handleSessionExpired}
                    onViewFormDetail={handleViewFormDetail}
                />
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    if (currentPage === 'validate-form-detail' && user?.role === 'admin') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <ValidateFormDetailPage
                    formId={currentValidateFormId}
                    formSource={currentValidateFormSource}
                    onBack={handleBackToValidateForms}
                    onValidated={handleBackToValidateForms}
                    onSessionExpired={handleSessionExpired}
                    onViewDetail={handleViewDetail}
                />
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    if (currentPage === 'validate-contributors' && user?.role === 'admin') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <ValidateContributorsPage
                    onBack={handleBackToHome}
                    pendingUsers={pendingUsers}
                    onRefresh={loadPendingUsers}
                    onSessionExpired={handleSessionExpired}
                />
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    if (currentPage === 'search') {
        return (
            <CrashBoundary onResetToHome={handleBackToHome}>
                <LanguageProvider>
                    <div className="min-h-screen bg-white">
                <Header
                    user={user}
                    onSignup={openSignupModal}
                    onLogin={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    onNavigate={setCurrentPage}
                    pendingFormsCount={pendingFormsCount}
                    pendingContributorsCount={pendingContributorsCount}
                />
                <SearchResults
                    searchQuery={searchQuery}
                    selectedCategories={selectedCategories}
                    advancedFilters={advancedFilters}
                    onSearch={handleSearch}
                    onBackToHome={handleBackToHome}
                    onViewDetail={handleViewDetail}
                />
                <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

                {/* Modals */}
                <SignupModal
                    isOpen={showSignupModal}
                    onClose={() => setShowSignupModal(false)}
                    onSubmit={handleSignup}
                />
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSubmit={handleLogin}
                    onForgotPassword={openResetPasswordModal}
                    onPendingApproval={handlePendingApproval}
                    onEmailConfirmation={handleEmailConfirmation}
                />
                <ResetPasswordModal
                    isOpen={showResetPasswordModal}
                    onClose={() => setShowResetPasswordModal(false)}
                />
                <PendingApprovalModal
                    isOpen={showPendingApprovalModal}
                    onClose={() => setShowPendingApprovalModal(false)}
                />
                <EmailConfirmationModal
                    isOpen={showEmailConfirmationModal}
                    onClose={() => setShowEmailConfirmationModal(false)}
                />

                {/* Toast notifications */}
                <Toaster/>

                <CookieBanner />
            </div>
                </LanguageProvider>
            </CrashBoundary>
        );
    }

    return (
        <CrashBoundary onResetToHome={handleBackToHome}>
            <LanguageProvider>
                <div className="min-h-screen bg-white">
            <Header
                user={user}
                onSignup={openSignupModal}
                onLogin={() => setShowLoginModal(true)}
                onLogout={handleLogout}
                onNavigate={setCurrentPage}
                pendingFormsCount={pendingFormsCount}
                pendingContributorsCount={pendingContributorsCount}
            />
            <HeroSection
                onLearnMore={() => scrollToSection('mission-section')}
                onExploreNow={() => scrollToSection('categories-section')}
            />
            <div id="categories-section">
                <CategoriesSection onCategoryClick={handleCategorySearch}/>
            </div>
            <SearchSection
                onSearch={handleSearch}
                onViewDetail={handleViewDetail}
                initialQuery={searchQuery}
                initialCategories={selectedCategories}
                initialFilters={advancedFilters}
            />
            <div id="mission-section">
                <WhySection user={user} onBecomeContributor={openSignupModal} onContribute={() => setCurrentPage('contribute')}/>
            </div>
            <Footer user={user} onContribute={openSignupModal} onNavigateToLegal={handleNavigateToLegal}/>

            {/* Modals */}
            <SignupModal
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
                onSubmit={handleSignup}
            />
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSubmit={handleLogin}
                onForgotPassword={openResetPasswordModal}
                onPendingApproval={handlePendingApproval}
                onEmailConfirmation={handleEmailConfirmation}
            />
            <ResetPasswordModal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
            />
            <PendingApprovalModal
                isOpen={showPendingApprovalModal}
                onClose={() => setShowPendingApprovalModal(false)}
            />
            <EmailConfirmationModal
                isOpen={showEmailConfirmationModal}
                onClose={() => setShowEmailConfirmationModal(false)}
            />

            {/* Modal pour nouveau mot de passe (réinitialisation par token) */}
            <NewPasswordModal
                isOpen={showNewPasswordModal}
                onClose={() => {
                    setShowNewPasswordModal(false);
                    setPasswordResetToken('');
                }}
                token={passwordResetToken}
                onSuccess={handlePasswordResetSuccess}
            />

            {/* Toast notifications */}
            <Toaster/>

            <CookieBanner />
        </div>
            </LanguageProvider>
        </CrashBoundary>
    );
}