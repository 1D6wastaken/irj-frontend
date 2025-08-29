import React, { useState, useEffect } from "react";
import { X, Database, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

const CONSENT_KEY = "heritage-site-data-consent";

export const CookieBanner: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        dataStorage: false,
        sentry: false,
    });

    useEffect(() => {
        const hasConsented = localStorage.getItem(CONSENT_KEY);
        if (!hasConsented) setShowBanner(true);
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, "true");
        setShowBanner(false);
    };

    const handleClose = () => handleAccept();

    const toggleSection = (section: "dataStorage" | "sentry") => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">

                    {/* Stockage des données */}
                    <div className="">
                        <div className="flex gap-2 items-center">
                            <div className="flex-shrink-0 mt-1">
                                <Database className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-semibold">Informations sur le stockage de données</span>
                        </div>
                        <div className="px-3 py-2 text-gray-700 text-sm">
                            Pour garantir la stabilité et corriger les erreurs, nous utilisons <strong>Sentry</strong>.
                            Les données collectées sont limitées aux informations techniques (type de navigateur, URL,
                            message d’erreur) et ne servent pas à de la publicité. Cette option est nécessaire pour
                            le fonctionnement sûr du site et ne peut pas être désactivée.
                        </div>
                    </div>

                    {/* Stockage de sentry */}
                    <div className="border border-gray-200 rounded">
                        <button
                            className="flex justify-between w-full px-3 py-2 items-center text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => toggleSection("dataStorage")}
                        >

                            <span className="font-semibold">Outils de surveillance technique (Sentry)</span>
                            {expandedSections.dataStorage ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedSections.dataStorage && (
                            <div className="px-3 py-2 text-gray-700 text-sm">
                                Ce site stocke des données côté navigateur pour gérer la connexion à votre compte,
                                ainsi que le cache de certaines données liées aux documents à afficher.
                                En continuant de naviguer, vous acceptez ces conditions.
                            </div>
                        )}
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end gap-2 mt-2">
                        <Button
                            onClick={handleAccept}
                            className="bg-primary hover:bg-primary/90 text-white px-6"
                        >
                            J'accepte
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 p-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};
