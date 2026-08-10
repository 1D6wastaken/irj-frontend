import {Link} from "react-router-dom";
import {Button} from "./ui/button";

export function NotFoundPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="text-7xl mb-6">🧭</div>
                <h1 className="text-3xl font-bold mb-2">Page introuvable</h1>
                <p className="text-muted-foreground mb-8">
                    La page que vous cherchez n'existe pas ou a été déplacée.
                </p>
                <Button asChild>
                    <Link to="/">Retour à l'accueil</Link>
                </Button>
            </div>
        </div>
    );
}
