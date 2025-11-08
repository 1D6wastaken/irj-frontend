import { useState, useEffect, useMemo } from "react";
import { Users, Search, ArrowUpDown, Shield, CheckCircle, Clock, XCircle, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { apiService, AdminUser, formatCreationDate } from "../config/api";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";

export function ContributorsDashboardPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof AdminUser;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Toggle l'expansion d'une ligne
    const toggleRow = (userId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedRows(newExpanded);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement des utilisateurs");
            console.error('Erreur:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction de tri
    const handleSort = (key: keyof AdminUser) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtrage et tri des utilisateurs
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(user => {
            const query = searchQuery.toLowerCase();
            return (
                user.firstname.toLowerCase().includes(query) ||
                user.lastname.toLowerCase().includes(query) ||
                user.mail.toLowerCase().includes(query) ||
                (user.organization && user.organization.toLowerCase().includes(query)) ||
                (user.domain && user.domain.toLowerCase().includes(query))
            );
        });

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [users, searchQuery, sortConfig]);

    // Statistiques
    const stats = useMemo(() => {
        const total = users.length;
        const admins = users.filter(u => u.grade === 'ADMIN').length;
        const active = users.filter(u => u.grade === 'ACTIVE').length;
        const pending = users.filter(u => u.grade === 'PENDING').length;

        return { total, admins, active, pending };
    }, [users]);

    const getGradeBadge = (grade: AdminUser['grade']) => {
        switch (grade) {
            case 'ADMIN':
                return <Badge className="bg-purple-100 text-purple-800">Administrateur</Badge>;
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-800">Contributeur</Badge>;
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
            default:
                return <Badge variant="secondary">{grade}</Badge>;
        }
    };

    const getValidatorInfo = (user: AdminUser) => {
        if (user.validated_by_firstname && user.validated_by_lastname) {
            return `${user.validated_by_firstname} ${user.validated_by_lastname}`;
        }
        return 'N/A';
    };

    // Supprimer un utilisateur
    const handleDeleteUser = async (userId: string, userName: string) => {
        try {
            await apiService.deleteUserAccount(userId);
            toast.success(`L'utilisateur ${userName} a été supprimé avec succès`);
            loadUsers(); // Recharger la liste
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la suppression de l'utilisateur");
            console.error('Erreur:', err);
        }
    };

    // Valider un utilisateur
    const handleValidateUser = async (userId: string, userName: string) => {
        try {
            await apiService.validateUser(userId, 'activate');
            toast.success(`${userName} a été validé comme contributeur`);
            loadUsers(); // Recharger la liste
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la validation de l'utilisateur");
            console.error('Erreur:', err);
        }
    };

    // Rejeter un utilisateur
    const handleRejectUser = async (userId: string, userName: string) => {
        try {
            await apiService.validateUser(userId, 'reject');
            toast.success(`${userName} a été rejeté`);
            loadUsers(); // Recharger la liste
        } catch (err: any) {
            toast.error(err.message || "Erreur lors du rejet de l'utilisateur");
            console.error('Erreur:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des utilisateurs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="container mx-auto p-6 max-w-7xl space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 mb-2">
                            <Users className="w-8 h-8" />
                            Dashboard des Contributeurs
                        </h1>
                        <p className="text-muted-foreground">
                            Gestion et suivi de tous les membres du site
                        </p>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="space-y-3">
                    {/* Première ligne : 3 cartes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Actifs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl">{stats.active}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">contributeurs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4" />
                                    En attente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl">{stats.pending}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">validations</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Shield className="w-4 h-4" />
                                    Admins
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl">{stats.admins}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">administrateurs</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Barre de recherche */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des utilisateurs</CardTitle>
                        <CardDescription>
                            {filteredAndSortedUsers.length} utilisateur{filteredAndSortedUsers.length > 1 ? 's' : ''} affiché{filteredAndSortedUsers.length > 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-4">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, email, organisation ou domaine..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                        </div>

                        {/* Tableau */}
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('firstname')}
                                                className="flex items-center gap-1 px-2"
                                            >
                                                Nom
                                                <ArrowUpDown className="w-3 h-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('mail')}
                                                className="flex items-center gap-1 px-2"
                                            >
                                                Email
                                                <ArrowUpDown className="w-3 h-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('grade')}
                                                className="flex items-center gap-1 px-2"
                                            >
                                                Statut
                                                <ArrowUpDown className="w-3 h-3" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                Aucun utilisateur trouvé
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndSortedUsers.map((user) => {
                                            const isExpanded = expandedRows.has(user.id);
                                            return (
                                                <>
                                                    {/* Ligne principale */}
                                                    <TableRow
                                                        key={user.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={(e) => {
                                                            // Empêcher le toggle si on clique sur un bouton
                                                            if ((e.target as HTMLElement).closest('button')) {
                                                                return;
                                                            }
                                                            toggleRow(user.id);
                                                        }}
                                                    >
                                                        <TableCell className="w-[50px]">
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>{user.firstname} {user.lastname}</span>
                                                                    {user.mail_confirm && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <CheckCircle className="w-3 h-3 text-green-600 cursor-help flex-shrink-0" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Email confirmé</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    {!user.mail_confirm && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <XCircle className="w-3 h-3 text-gray-400 cursor-help flex-shrink-0" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Email non confirmé</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                </div>
                                                                {user.phone && (
                                                                    <span className="text-xs text-muted-foreground block">{user.phone}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm">{user.mail}</TableCell>
                                                        <TableCell>{getGradeBadge(user.grade)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                                {/* Utilisateur en attente : boutons Valider et Rejeter */}
                                                                {user.grade === 'PENDING' && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleValidateUser(user.id, `${user.firstname} ${user.lastname}`)}
                                                                            className="text-green-600 hover:text-green-700"
                                                                        >
                                                                            <Check className="w-4 h-4 mr-1" />
                                                                            Valider
                                                                        </Button>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="text-orange-600 hover:text-orange-700"
                                                                                >
                                                                                    <X className="w-4 h-4 mr-1" />
                                                                                    Rejeter
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Rejeter cet utilisateur ?</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Êtes-vous sûr de vouloir rejeter <strong>{user.firstname} {user.lastname}</strong> ?
                                                                                        Cette action ne supprimera pas le compte mais refusera la validation.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleRejectUser(user.id, `${user.firstname} ${user.lastname}`)}
                                                                                    >
                                                                                        Rejeter
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </>
                                                                )}

                                                                {/* Contributeur actif : bouton Supprimer */}
                                                                {user.grade === 'ACTIVE' && (
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="text-red-600 hover:text-red-700"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-1" />
                                                                                Supprimer
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Êtes-vous sûr de vouloir supprimer définitivement <strong>{user.firstname} {user.lastname}</strong> ?
                                                                                    Cette action est irréversible et supprimera toutes les données associées à ce compte.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDeleteUser(user.id, `${user.firstname} ${user.lastname}`)}
                                                                                    className="bg-red-600 hover:bg-red-700"
                                                                                >
                                                                                    Supprimer
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                )}

                                                                {/* Administrateur : aucun bouton */}
                                                                {user.grade === 'ADMIN' && (
                                                                    <span className="text-xs text-muted-foreground italic">—</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Ligne étendue avec les détails */}
                                                    {isExpanded && (
                                                        <TableRow key={`${user.id}-expanded`}>
                                                            <TableCell colSpan={5} className="bg-muted/30 border-t-0">
                                                                <div className="py-4 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Organisation</p>
                                                                        <p className="text-sm">{user.organization || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Domaine</p>
                                                                        <p className="text-sm">{user.domain || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Date d'inscription</p>
                                                                        <p className="text-sm">{formatCreationDate(user.creation_date)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Dernière connexion</p>
                                                                        <p className="text-sm">{formatCreationDate(user.last_login)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Validé par</p>
                                                                        <p className="text-sm">{getValidatorInfo(user)}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}