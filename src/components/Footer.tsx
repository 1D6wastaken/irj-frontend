import { Mail, MapPin } from "lucide-react";

interface FooterProps {
    user?: any;
    onContribute?: () => void;
    onNavigateToLegal: (page: 'legal-mentions' | 'privacy-policy' | 'terms-of-use') => void;
}

export function Footer({ user, onContribute, onNavigateToLegal }: FooterProps) {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo et description */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-white text-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold">
                                <img src="https://saintjacquesinfo.eu/assets/logo_bw.png" alt="logo saint jacques" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Le site du Patrimoine Saint-Jacques</h3>
                            </div>
                        </div>
                        <p className="text-red-100 mb-6 max-w-md">
                            Plateforme dédiée à l'inventaire et à la valorisation du patrimoine religieux de Saint-Jacques.
                            Découvrez, explorez et contribuez à la préservation de notre héritage.
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Contact</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-red-200 mt-1 flex-shrink-0" />
                                <div className="text-red-100 text-sm md:text-base">
                                    <p>Institut de Recherche Jacquaire</p>
                                    <p>39 rue du Sergent Bobillot</p>
                                    <p>37000 TOURS</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-red-200" />
                                <a href="mailto:institut.irj@gmail.com" className="text-red-100 text-sm md:text-base">institut.irj@gmail.com</a>
                            </div>
                        </div>
                    </div>

                    {/* Liens utiles */}
                    <div>
                        <h4 className="font-bold mt-6 mb-3 text-white">Institut de Recherche Jacquaire</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="https://www.institut-irj.fr/" className="text-red-200 hover:text-red-100 transition-colors duration-200">www.institut-irj.fr</a></li>
                        </ul>
                        <h4 className="font-bold mt-6 mb-3 text-white">Informations légales</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <button
                                    onClick={() => onNavigateToLegal('legal-mentions')}
                                    className="text-red-200 hover:text-red-100 transition-colors duration-200 text-left cursor-pointer"
                                >
                                    Mentions légales
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigateToLegal('privacy-policy')}
                                    className="text-red-200 hover:text-red-100 transition-colors duration-200 text-left cursor-pointer"
                                >
                                    Confidentialité
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigateToLegal('terms-of-use')}
                                    className="text-red-200 hover:text-red-100 transition-colors duration-200 text-left cursor-pointer"
                                >
                                    CGU
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-red-200 text-sm text-center md:text-left">
                        © 2025 Le site du Patrimoine Saint-Jacques - Tous droits réservés
                    </p>
                    {!user && (
                        <div>
                            <button
                                onClick={onContribute}
                                className="bg-white text-primary px-4 md:px-6 py-2 rounded-lg text-sm hover:bg-red-50 hover:shadow-lg transition-all duration-200"
                            >
                                Contribuer au projet
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}