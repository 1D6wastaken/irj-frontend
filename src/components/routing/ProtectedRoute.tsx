import {Outlet} from "react-router-dom";
import {LogIn} from "lucide-react";
import {Button} from "../ui/button";
import {useAuth} from "../../contexts/AuthContext";

export function ProtectedRoute() {
    const {isAuthenticated, openLoginModal} = useAuth();

    if (isAuthenticated) return <Outlet/>;

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center bg-white rounded-2xl border border-border p-8 shadow-sm">
                <div className="text-5xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold mb-2">Connexion requise</h1>
                <p className="text-muted-foreground mb-6">
                    Vous devez être connecté pour accéder à cette page.
                </p>
                <Button onClick={openLoginModal} className="w-full">
                    <LogIn className="w-4 h-4 mr-2"/>
                    Se connecter
                </Button>
            </div>
        </div>
    );
}
