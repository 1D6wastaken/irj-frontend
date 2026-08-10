import {createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback} from "react";
import {toast} from "sonner";
import {apiService, ApiError, PendingUser, PendingForm} from "../config/api";
import type {User} from "../App";

interface PendingFormsByCategory {
    monuments_lieux: PendingForm[];
    mobiliers_images: PendingForm[];
    personnes_morales: PendingForm[];
    personnes_physiques: PendingForm[];
}

const EMPTY_FORMS: PendingFormsByCategory = {
    monuments_lieux: [],
    mobiliers_images: [],
    personnes_morales: [],
    personnes_physiques: [],
};

export interface AuthContextValue {
    user: User | null;
    setUser: (u: User | null) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Modals
    showSignupModal: boolean;
    showLoginModal: boolean;
    showResetPasswordModal: boolean;
    showNewPasswordModal: boolean;
    showPendingApprovalModal: boolean;
    showEmailConfirmationModal: boolean;
    passwordResetToken: string;

    openSignupModal: () => void;
    closeSignupModal: () => void;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    openResetPasswordModal: () => void;
    closeResetPasswordModal: () => void;
    openPendingApprovalModal: () => void;
    closePendingApprovalModal: () => void;
    openEmailConfirmationModal: () => void;
    closeEmailConfirmationModal: () => void;
    closeNewPasswordModal: () => void;
    openResetPasswordFlow: (token: string) => Promise<void>;

    // Auth actions
    handleLogin: (email: string) => Promise<void>;
    handleLogout: () => void;
    handleSessionExpired: (message?: string) => void;

    // Admin data
    pendingUsers: PendingUser[];
    pendingContributorsCount: number;
    pendingForms: PendingFormsByCategory;
    pendingFormsCount: number;
    loadPendingUsers: () => Promise<void>;
    loadPendingForms: () => Promise<void>;

    // Drafts
    draftForms: PendingFormsByCategory;
    loadDraftForms: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
    const [showPendingApprovalModal, setShowPendingApprovalModal] = useState(false);
    const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
    const [passwordResetToken, setPasswordResetToken] = useState<string>("");

    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [pendingContributorsCount, setPendingContributorsCount] = useState(0);
    const [pendingForms, setPendingForms] = useState<PendingFormsByCategory>(EMPTY_FORMS);
    const [pendingFormsCount, setPendingFormsCount] = useState(0);
    const [draftForms, setDraftForms] = useState<PendingFormsByCategory>(EMPTY_FORMS);

    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const formsPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";

    const handleSessionExpired = useCallback((message: string = "Votre session a expiré. Veuillez vous reconnecter.") => {
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
        setPendingForms(EMPTY_FORMS);
        setDraftForms(EMPTY_FORMS);
        toast.error(message);
    }, []);

    const loadPendingUsers = useCallback(async () => {
        if (!user || user.role !== "admin") return;
        try {
            const list = await apiService.getPendingUsers();
            setPendingUsers(list);
            setPendingContributorsCount(list.length);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    handleSessionExpired();
                    return;
                }
                if (error.status === 403) {
                    setPendingContributorsCount(0);
                    setPendingUsers([]);
                    return;
                }
            }
            console.error("Erreur lors du chargement des contributeurs en attente:", error);
        }
    }, [user, handleSessionExpired]);

    const loadPendingForms = useCallback(async () => {
        if (!user || user.role !== "admin") return;
        try {
            const [monumentsLieux, mobiliersImages, personnesMorales, personnesPhysiques] = await Promise.all([
                apiService.getPendingMonumentsLieux(),
                apiService.getPendingMobiliersImages(),
                apiService.getPendingPersonnesMorales(),
                apiService.getPendingPersonnesPhysiques(),
            ]);
            const next: PendingFormsByCategory = {
                monuments_lieux: Array.isArray(monumentsLieux) ? monumentsLieux : [],
                mobiliers_images: Array.isArray(mobiliersImages) ? mobiliersImages : [],
                personnes_morales: Array.isArray(personnesMorales) ? personnesMorales : [],
                personnes_physiques: Array.isArray(personnesPhysiques) ? personnesPhysiques : [],
            };
            setPendingForms(next);
            setPendingFormsCount(
                next.monuments_lieux.length +
                next.mobiliers_images.length +
                next.personnes_morales.length +
                next.personnes_physiques.length
            );
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    handleSessionExpired();
                    return;
                }
                if (error.status === 403) {
                    setPendingFormsCount(0);
                    setPendingForms(EMPTY_FORMS);
                    return;
                }
            }
            console.error("Erreur lors du chargement des fiches en attente:", error);
        }
    }, [user, handleSessionExpired]);

    const loadDraftForms = useCallback(async () => {
        if (!user) return;
        try {
            const [monumentsLieux, mobiliersImages, personnesMorales, personnesPhysiques] = await Promise.all([
                apiService.getDraftMonumentsLieux(),
                apiService.getDraftMobiliersImages(),
                apiService.getDraftPersonnesMorales(),
                apiService.getDraftPersonnesPhysiques(),
            ]);
            setDraftForms({
                monuments_lieux: Array.isArray(monumentsLieux) ? monumentsLieux : [],
                mobiliers_images: Array.isArray(mobiliersImages) ? mobiliersImages : [],
                personnes_morales: Array.isArray(personnesMorales) ? personnesMorales : [],
                personnes_physiques: Array.isArray(personnesPhysiques) ? personnesPhysiques : [],
            });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                handleSessionExpired();
            }
        }
    }, [user, handleSessionExpired]);

    // Rehydratation JWT au startup — dépendance vide volontaire (mount only).
    useEffect(() => {
        if (apiService.isAuthenticated()) {
            const userData = apiService.getUserData();
            if (userData && userData.userId) {
                setUser({
                    id: userData.userId,
                    firstName: userData.firstname,
                    lastName: "",
                    email: userData.email || "",
                    phone: undefined,
                    role: userData.role || "contributeur",
                });
            }
        }
    }, []);

    // Polling admin
    useEffect(() => {
        if (user && user.role === "admin") {
            loadPendingUsers();
            loadPendingForms();
            pollingIntervalRef.current = setInterval(loadPendingUsers, 30000);
            formsPollingIntervalRef.current = setInterval(loadPendingForms, 30000);
        } else {
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
            setPendingForms(EMPTY_FORMS);
        }

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
    }, [user?.role, loadPendingUsers, loadPendingForms]);

    // Charger les brouillons pour l'utilisateur connecté
    useEffect(() => {
        if (user) {
            loadDraftForms();
        } else {
            setDraftForms(EMPTY_FORMS);
        }
    }, [user, loadDraftForms]);

    const openSignupModal = useCallback(() => setShowSignupModal(true), []);
    const closeSignupModal = useCallback(() => setShowSignupModal(false), []);
    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);
    const openResetPasswordModal = useCallback(() => {
        setShowLoginModal(false);
        setShowResetPasswordModal(true);
    }, []);
    const closeResetPasswordModal = useCallback(() => setShowResetPasswordModal(false), []);
    const openPendingApprovalModal = useCallback(() => setShowPendingApprovalModal(true), []);
    const closePendingApprovalModal = useCallback(() => setShowPendingApprovalModal(false), []);
    const openEmailConfirmationModal = useCallback(() => setShowEmailConfirmationModal(true), []);
    const closeEmailConfirmationModal = useCallback(() => setShowEmailConfirmationModal(false), []);
    const closeNewPasswordModal = useCallback(() => {
        setShowNewPasswordModal(false);
        setPasswordResetToken("");
    }, []);

    const openResetPasswordFlow = useCallback(async (token: string) => {
        setPasswordResetToken(token);
        try {
            await apiService.validateResetToken(token);
            setShowNewPasswordModal(true);
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                toast.error("Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.");
            } else {
                toast.error("Une erreur est survenue lors de la vérification du lien. Veuillez réessayer plus tard.");
            }
            setPasswordResetToken("");
        }
    }, []);

    const handleLogin = useCallback(async (email: string) => {
        const userData = apiService.getUserData();
        if (userData && userData.userId) {
            setUser({
                id: userData.userId,
                firstName: userData.firstname,
                lastName: "",
                email: userData.email || email,
                phone: undefined,
                role: userData.role || "contributeur",
            });
        } else {
            setUser({
                id: "temp-id",
                firstName: "Utilisateur",
                lastName: "Connecté",
                email,
                phone: undefined,
                role: "contributeur",
            });
        }
        setShowLoginModal(false);
    }, []);

    const handleLogout = useCallback(() => {
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
        setPendingForms(EMPTY_FORMS);
        setDraftForms(EMPTY_FORMS);
    }, []);

    const value: AuthContextValue = {
        user,
        setUser,
        isAuthenticated,
        isAdmin,
        showSignupModal,
        showLoginModal,
        showResetPasswordModal,
        showNewPasswordModal,
        showPendingApprovalModal,
        showEmailConfirmationModal,
        passwordResetToken,
        openSignupModal,
        closeSignupModal,
        openLoginModal,
        closeLoginModal,
        openResetPasswordModal,
        closeResetPasswordModal,
        openPendingApprovalModal,
        closePendingApprovalModal,
        openEmailConfirmationModal,
        closeEmailConfirmationModal,
        closeNewPasswordModal,
        openResetPasswordFlow,
        handleLogin,
        handleLogout,
        handleSessionExpired,
        pendingUsers,
        pendingContributorsCount,
        pendingForms,
        pendingFormsCount,
        loadPendingUsers,
        loadPendingForms,
        draftForms,
        loadDraftForms,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
