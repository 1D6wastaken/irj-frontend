import {useCallback} from "react";
import {useLocation, useNavigate} from "react-router-dom";

/**
 * Bouton "retour" IHM : utilise l'historique navigateur si disponible (restaure
 * pagination/filtres via useSearchParams), sinon fallback vers une route racine.
 * location.key === "default" ⇒ l'utilisateur est arrivé directement (deep-link ou refresh),
 * il n'y a pas d'entrée précédente dans l'historique de la SPA.
 */
export function useSmartBack(fallback: string = "/") {
    const navigate = useNavigate();
    const location = useLocation();

    return useCallback(() => {
        if (location.key === "default") {
            navigate(fallback, {replace: true});
        } else {
            navigate(-1);
        }
    }, [navigate, location.key, fallback]);
}
