import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    LogIn, UserPlus, User, Users, Settings, FileText, LogOut,
    CheckSquare, UserCheck, Menu, ChevronDown, ShieldCheck, Clock, History,
} from "lucide-react";
import {Button} from "./ui/button";
import {Badge} from "./ui/badge";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "./ui/sheet";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./ui/dropdown-menu";
import {useAuth} from "../contexts/AuthContext";

export function Header() {
    const navigate = useNavigate();
    const {
        user,
        openSignupModal,
        openLoginModal,
        handleLogout,
        pendingFormsCount,
        pendingContributorsCount,
    } = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const goto = (path: string) => {
        navigate(path);
        closeMobileMenu();
    };

    return (
        <header className="bg-primary text-primary-foreground shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-16 md:h-20">
                    {/* Logo et titre */}
                    <Link to="/" className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                        <div className="bg-white text-primary w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold shadow-lg">
                            <img src="/logo_bw.png" alt="logo saint jacques"/>
                        </div>
                        <div className="min-w-0">
                            <h1 className="lg:text-lg md:text-2xl sm:text-lg font-bold text-white leading-tight">
                                Le site du Patrimoine jacquaire européen
                            </h1>
                        </div>
                    </Link>

                    <div className="flex-1 min-w-1"></div>

                    {user ? (
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="hidden 2xl:block text-right">
                                <p className="text-sm text-red-100">Bonjour</p>
                                <p className="font-medium text-white">{user.firstName}</p>
                            </div>

                            <div className="hidden lg:flex items-center space-x-3">
                                <Button
                                    onClick={() => navigate("/contribuer")}
                                    className="bg-white text-primary hover:bg-red-50 shadow-lg transition-all duration-200"
                                >
                                    <FileText className="w-4 h-4 mr-2"/>
                                    Contribuer
                                </Button>

                                {user.role === "admin" && (
                                    <div className="relative">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                                >
                                                    <ShieldCheck className="w-4 h-4 mr-2"/>
                                                    Espace administration
                                                    <ChevronDown className="w-4 h-4 ml-2"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuItem onClick={() => navigate("/admin/validation-fiches")} className="cursor-pointer">
                                                    <CheckSquare className="w-4 h-4 mr-2"/>
                                                    Valider fiches
                                                    {pendingFormsCount > 0 && (
                                                        <Badge variant="destructive" className="ml-auto">
                                                            {pendingFormsCount}
                                                        </Badge>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate("/admin/validation-contributeurs")} className="cursor-pointer">
                                                    <UserCheck className="w-4 h-4 mr-2"/>
                                                    Valider contributeurs
                                                    {pendingContributorsCount > 0 && (
                                                        <Badge variant="destructive" className="ml-auto">
                                                            {pendingContributorsCount}
                                                        </Badge>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate("/admin/contributeurs")} className="cursor-pointer">
                                                    <Users className="w-4 h-4 mr-2"/>
                                                    Liste des contributeurs
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate("/admin/contributions")} className="cursor-pointer">
                                                    <History className="w-4 h-4 mr-2"/>
                                                    Historique contributions
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {(pendingFormsCount > 0 || pendingContributorsCount > 0) && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                                            >
                                                {pendingFormsCount + pendingContributorsCount}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                        >
                                            <User className="w-4 h-4 mr-2"/>
                                            Espace personnel
                                            <ChevronDown className="w-4 h-4 ml-2"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem onClick={() => navigate("/mon-compte")} className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2"/>
                                            Mon compte
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate("/mes-contributions")} className="cursor-pointer">
                                            <Clock className="w-4 h-4 mr-2"/>
                                            Mon historique
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate("/mes-brouillons")} className="cursor-pointer">
                                            <FileText className="w-4 h-4 mr-2"/>
                                            Mes brouillons
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    onClick={() => { handleLogout(); navigate("/"); }}
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4 mr-2"/>
                                    Déconnexion
                                </Button>
                            </div>

                            {/* Mobile/Tablet */}
                            <div className="lg:hidden flex items-center gap-2">
                                <span className="text-xs text-red-100 hidden sm:block 2xl:hidden">Bonjour {user.firstName}</span>

                                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
                                            <Menu className="w-5 h-5"/>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-80">
                                        <SheetHeader>
                                            <SheetTitle className="text-left flex items-center gap-3">
                                                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-bold">
                                                    <User className="w-6 h-6"/>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                    <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
                                                </div>
                                            </SheetTitle>
                                        </SheetHeader>

                                        <div className="mt-8 space-y-4">
                                            <Button
                                                onClick={() => goto("/contribuer")}
                                                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                <FileText className="w-4 h-4 mr-3"/>
                                                Contribuer
                                            </Button>

                                            {user.role === "admin" && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground px-3">Espace administration</p>
                                                    <Button onClick={() => goto("/admin/validation-fiches")} variant="outline" className="w-full justify-start">
                                                        <CheckSquare className="w-4 h-4 mr-3"/>
                                                        Valider fiches
                                                        {pendingFormsCount > 0 && (
                                                            <Badge variant="destructive" className="ml-auto">{pendingFormsCount}</Badge>
                                                        )}
                                                    </Button>
                                                    <Button onClick={() => goto("/admin/validation-contributeurs")} variant="outline" className="w-full justify-start">
                                                        <UserCheck className="w-4 h-4 mr-3"/>
                                                        Valider contributeurs
                                                        {pendingContributorsCount > 0 && (
                                                            <Badge variant="destructive" className="ml-auto">{pendingContributorsCount}</Badge>
                                                        )}
                                                    </Button>
                                                    <Button onClick={() => goto("/admin/contributeurs")} variant="outline" className="w-full justify-start">
                                                        <Users className="w-4 h-4 mr-3"/>
                                                        Liste des contributeurs
                                                    </Button>
                                                    <Button onClick={() => goto("/admin/contributions")} variant="outline" className="w-full justify-start">
                                                        <History className="w-4 h-4 mr-3"/>
                                                        Historique contributions
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="border-t pt-4 space-y-2">
                                                <p className="text-sm font-medium text-muted-foreground px-3">Espace personnel</p>
                                                <Button onClick={() => goto("/mon-compte")} variant="ghost" className="w-full justify-start">
                                                    <Settings className="w-4 h-4 mr-3"/>
                                                    Mon compte
                                                </Button>
                                                <Button onClick={() => goto("/mes-contributions")} variant="ghost" className="w-full justify-start">
                                                    <Clock className="w-4 h-4 mr-3"/>
                                                    Mon historique
                                                </Button>
                                                <Button onClick={() => goto("/mes-brouillons")} variant="ghost" className="w-full justify-start">
                                                    <FileText className="w-4 h-4 mr-3"/>
                                                    Mes brouillons
                                                </Button>
                                                <Button
                                                    onClick={() => { handleLogout(); goto("/"); }}
                                                    variant="ghost"
                                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3"/>
                                                    Déconnexion
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="hidden lg:flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={openLoginModal}
                                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent transition-all duration-200"
                                >
                                    <LogIn className="w-4 h-4 mr-2"/>
                                    Se connecter
                                </Button>
                                <Button
                                    onClick={openSignupModal}
                                    className="bg-white text-primary hover:bg-red-50 shadow-lg transition-all duration-200"
                                >
                                    <UserPlus className="w-4 h-4 mr-2"/>
                                    Devenir contributeur
                                </Button>
                            </div>

                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
                                            <Menu className="w-5 h-5"/>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-80">
                                        <SheetHeader>
                                            <SheetTitle className="text-left">Menu</SheetTitle>
                                        </SheetHeader>

                                        <div className="mt-8 space-y-4">
                                            <Button
                                                onClick={() => { openLoginModal(); closeMobileMenu(); }}
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
                                                <LogIn className="w-4 h-4 mr-3"/>
                                                Se connecter
                                            </Button>
                                            <Button
                                                onClick={() => { openSignupModal(); closeMobileMenu(); }}
                                                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                <UserPlus className="w-4 h-4 mr-3"/>
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
