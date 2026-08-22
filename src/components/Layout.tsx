import {useEffect} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {toast, Toaster} from "sonner";
import {ApiError, apiService} from "../config/api";
// apiService utilisé dans handleSignup (createUser) — ne pas retirer.
import {Header} from "./Header";
import {Footer} from "./Footer";
import {CookieBanner} from "./CookieBanner";
import {CrashBoundary} from "./CrashBoundary";
import {LanguageProvider} from "../hooks/dynamicHomeText";
import {SignupModal} from "./modals/SignupModal";
import {LoginModal} from "./modals/LoginModal";
import {ResetPasswordModal} from "./modals/ResetPasswordModal";
import {NewPasswordModal} from "./modals/NewPasswordModal";
import {PendingApprovalModal} from "./modals/PendingApprovalModal";
import {EmailConfirmationModal} from "./modals/EmailConfirmationModal";
import {useAuth} from "../contexts/AuthContext";

export function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        showSignupModal,
        showLoginModal,
        showResetPasswordModal,
        showNewPasswordModal,
        showPendingApprovalModal,
        showEmailConfirmationModal,
        passwordResetToken,
        closeSignupModal,
        closeLoginModal,
        closeResetPasswordModal,
        closeNewPasswordModal,
        closePendingApprovalModal,
        closeEmailConfirmationModal,
        openResetPasswordModal,
        openPendingApprovalModal,
        openEmailConfirmationModal,
        handleLogin,
    } = useAuth();

    // Scroll haut sur les pages de contenu principales lors d'un changement d'URL
    useEffect(() => {
        const p = location.pathname;
        if (
            p === "/search" ||
            p.startsWith("/fiches/") ||
            p.startsWith("/admin/validation-fiches/") ||
            p === "/contribuer"
        ) {
            setTimeout(() => window.scrollTo({top: 0, behavior: "smooth"}), 50);
        }
    }, [location.pathname]);

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
            closeSignupModal();
            openPendingApprovalModal();
            toast.success("Votre candidature a été soumise avec succès !");
        } catch (error) {
            if (error instanceof ApiError) {
                switch (error.status) {
                    case 400:
                        toast.error("Erreur dans les données du formulaire. Veuillez vérifier vos informations.");
                        break;
                    case 409:
                        toast.error("Cette adresse email est déjà utilisée. Veuillez en choisir une autre.");
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

    const handlePasswordResetSuccess = () => {
        closeNewPasswordModal();
        toast.success(
            "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
        );
    };

    const resetToHome = () => navigate("/", {replace: true});

    return (
        <CrashBoundary onResetToHome={resetToHome}>
            <LanguageProvider>
                <div className="min-h-screen bg-white">
                    <Header/>
                    <Outlet/>
                    <Footer/>

                    <SignupModal
                        isOpen={showSignupModal}
                        onClose={closeSignupModal}
                        onSubmit={handleSignup}
                    />
                    <LoginModal
                        isOpen={showLoginModal}
                        onClose={closeLoginModal}
                        onSubmit={handleLogin}
                        onForgotPassword={openResetPasswordModal}
                        onPendingApproval={openPendingApprovalModal}
                        onEmailConfirmation={openEmailConfirmationModal}
                    />
                    <ResetPasswordModal
                        isOpen={showResetPasswordModal}
                        onClose={closeResetPasswordModal}
                    />
                    <PendingApprovalModal
                        isOpen={showPendingApprovalModal}
                        onClose={closePendingApprovalModal}
                    />
                    <EmailConfirmationModal
                        isOpen={showEmailConfirmationModal}
                        onClose={closeEmailConfirmationModal}
                    />
                    <NewPasswordModal
                        isOpen={showNewPasswordModal}
                        onClose={closeNewPasswordModal}
                        token={passwordResetToken}
                        onSuccess={handlePasswordResetSuccess}
                    />

                    <Toaster/>
                    <CookieBanner/>
                </div>
            </LanguageProvider>
        </CrashBoundary>
    );
}
