import {useEffect, useRef} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";

/**
 * Route /reset/:token : ouvre la modale de nouveau mot de passe puis nettoie
 * l'URL (retour vers /) pour préserver l'UX historique et éviter qu'un reload
 * ne re-déclenche la validation du token.
 */
export function PasswordResetRouteHandler() {
    const {token} = useParams<{token: string}>();
    const navigate = useNavigate();
    const {openResetPasswordFlow} = useAuth();
    const consumedRef = useRef(false);

    useEffect(() => {
        if (consumedRef.current) return;
        if (!token) {
            navigate("/", {replace: true});
            return;
        }
        consumedRef.current = true;
        openResetPasswordFlow(token);
        navigate("/", {replace: true});
    }, [token, navigate, openResetPasswordFlow]);

    return null;
}
