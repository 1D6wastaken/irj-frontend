import { useState } from "react";
import { LogIn, UserPlus, User, Settings, FileText, LogOut, CheckSquare, UserCheck, Menu} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { User as UserType } from "../App";

interface HeaderProps {
    user?: UserType | null;
    onSignup: () => void;
    onLogin: () => void;
    onLogout: () => void;
    onNavigate: (page: 'home' | 'search' | 'contribute' | 'account' | 'validate-forms' | 'validate-contributors') => void;
    pendingFormsCount?: number;
    pendingContributorsCount?: number;
}

export function Header({
                           user,
                           onSignup,
                           onLogin,
                           onLogout,
                           onNavigate,
                           pendingFormsCount = 0,
                           pendingContributorsCount = 0
                       }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleNavigation = (page: 'home' | 'search' | 'contribute' | 'account' | 'validate-forms' | 'validate-contributors') => {
        onNavigate(page);
        closeMobileMenu();
    };

    return (
        <header className="bg-primary text-primary-foreground shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-16 md:h-20">
                    {/* Logo et titre */}
                    <div
                        className="flex items-center space-x-2 md:space-x-4 flex-shrink-0 cursor-pointer"
                        onClick={() => handleNavigation('home')}
                    >
                        <div className="bg-white text-primary w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold shadow-lg">
                            <img src="https://saintjacquesinfo.eu/assets/logo_bw.png" alt="logo saint jacques" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="lg:text-lg md:text-2xl sm:text-lg font-bold text-white leading-tight">
                                Le site du Patrimoine Saint-Jacques
                            </h1>
                        </div>
                    </div>

                    {/* Espacement flexible pour séparer le titre des éléments de droite */}
                    <div className="flex-1 min-w-4"></div>

                    {user ? (
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Message de bienvenue - Desktop uniquement, masqué si écran <= 1535px */}
                            <div className="hidden 2xl:block text-right">
                                <p className="text-sm text-red-100">Bonjour</p>
                                <p className="font-medium text-white">{user.firstName}</p>
                            </div>

                            {/* Desktop */}
                            <div className="hidden lg:flex items-center space-x-3">
                                <Button
                                    onClick={() => onNavigate('contribute')}
                                    className="bg-white text-primary hover:bg-red-50 shadow-lg transition-all duration-200"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Contribuer
                                </Button>

                                {/* Boutons admin */}
                                {user.role === 'admin' && (
                                    <>
                                        <div className="relative">
                                            <Button
                                                onClick={() => onNavigate('validate-forms')}
                                                variant="outline"
                                                className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                            >
                                                <CheckSquare className="w-4 h-4 mr-2" />
                                                Valider fiches
                                            </Button>
                                            {pendingFormsCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                                                >
                                                    {pendingFormsCount}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Button
                                                onClick={() => onNavigate('validate-contributors')}
                                                variant="outline"
                                                className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Valider contributeurs
                                            </Button>
                                            {pendingContributorsCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                                                >
                                                    {pendingContributorsCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </>
                                )}

                                <Button
                                    onClick={() => onNavigate('account')}
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Mon compte
                                </Button>

                                <Button
                                    onClick={onLogout}
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Déconnexion
                                </Button>
                            </div>

                            {/* Mobile/Tablet - Menu hamburger pour utilisateur connecté */}
                            <div className="lg:hidden flex items-center gap-2">
                                <span className="text-xs text-red-100 hidden sm:block 2xl:hidden">Bonjour {user.firstName}</span>

                                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-white hover:bg-white/10 p-2"
                                        >
                                            <Menu className="w-5 h-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-80">
                                        <SheetHeader>
                                            <SheetTitle className="text-left flex items-center gap-3">
                                                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-bold">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                    <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
                                                </div>
                                            </SheetTitle>
                                        </SheetHeader>

                                        <div className="mt-8 space-y-4">
                                            <Button
                                                onClick={() => handleNavigation('contribute')}
                                                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                <FileText className="w-4 h-4 mr-3" />
                                                Contribuer
                                            </Button>

                                            {user.role === 'admin' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-muted-foreground px-3">Administration</p>
                                                        <Button
                                                            onClick={() => handleNavigation('validate-forms')}
                                                            variant="outline"
                                                            className="w-full justify-start"
                                                        >
                                                            <CheckSquare className="w-4 h-4 mr-3" />
                                                            Valider fiches
                                                            {pendingFormsCount > 0 && (
                                                                <Badge variant="destructive" className="ml-auto">
                                                                    {pendingFormsCount}
                                                                </Badge>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleNavigation('validate-contributors')}
                                                            variant="outline"
                                                            className="w-full justify-start"
                                                        >
                                                            <UserCheck className="w-4 h-4 mr-3" />
                                                            Valider contributeurs
                                                            {pendingContributorsCount > 0 && (
                                                                <Badge variant="destructive" className="ml-auto">
                                                                    {pendingContributorsCount}
                                                                </Badge>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}

                                            <div className="border-t pt-4 space-y-2">
                                                <Button
                                                    onClick={() => handleNavigation('account')}
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                >
                                                    <Settings className="w-4 h-4 mr-3" />
                                                    Mon compte
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        onLogout();
                                                        closeMobileMenu();
                                                    }}
                                                    variant="ghost"
                                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    Déconnexion
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    ) : (
                        /* Utilisateur non connecté */
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Desktop */}
                            <div className="hidden lg:flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={onLogin}
                                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Se connecter
                                </Button>
                                <Button
                                    onClick={onSignup}
                                    className="bg-white text-primary hover:bg-red-50 shadow-lg transition-all duration-200"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Devenir contributeur
                                </Button>
                            </div>

                            {/* Mobile */}
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-white hover:bg-white/10 p-2"
                                        >
                                            <Menu className="w-5 h-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-80">
                                        <SheetHeader>
                                            <SheetTitle className="text-left">Menu</SheetTitle>
                                        </SheetHeader>

                                        <div className="mt-8 space-y-4">
                                            <Button
                                                onClick={() => {
                                                    onLogin();
                                                    closeMobileMenu();
                                                }}
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
                                                <LogIn className="w-4 h-4 mr-3" />
                                                Se connecter
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    onSignup();
                                                    closeMobileMenu();
                                                }}
                                                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                <UserPlus className="w-4 h-4 mr-3" />
                                                Devenir contributeur
                                            </Button>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}