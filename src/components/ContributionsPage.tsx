import { useState, useEffect, useMemo } from "react";
import { FileText, Search, Calendar, User, Shield, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { apiService, ContributionEvent, formatCreationDate, DetailResult, FilterOption } from "../config/api";
import { Alert, AlertDescription } from "./ui/alert";
import { ImageWithFallback } from "./ImageWithFallback";
import {getMediaImageUrl} from "../utils/searchUtils.ts";

const ITEMS_PER_PAGE = 20;

// Sous-composant pour afficher les détails d'un document
function DocumentPreview({
                             documentId,
                             category,
                             event,
                             onViewDetail
                         }: {
    documentId: string;
    category: ContributionEvent['category'];
    event: ContributionEvent['event'];
    onViewDetail?: (documentId: string, category: string) => void;
}) {
    const [details, setDetails] = useState<DetailResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Si c'est un rejet, ne pas charger les détails (la fiche peut avoir été supprimée)
    const isRejection = event === 'document_submission_rejection' || event === 'document_update_rejection';

    useEffect(() => {
        // Ne pas charger les détails pour les rejets
        if (isRejection) {
            setIsLoading(false);
            return;
        }

        const loadDetails = async () => {
            setIsLoading(true);
            setError(false);
            try {
                const data = await apiService.getRecordDetail(category, documentId);
                setDetails(data);
            } catch (err) {
                console.error('Erreur chargement détails:', err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadDetails();
    }, [documentId, category, isRejection]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Chargement...</span>
            </div>
        );
    }

    // Affichage simplifié pour les rejets
    if (isRejection) {
        return (
            <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground italic">Document rejeté (supprimé)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {documentId}</p>
                </div>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="text-sm text-muted-foreground italic">
                Document #{documentId}
            </div>
        );
    }

    // Extraire les infos selon le type de document
    const getTitle = () => {
        if ('title' in details) return details.title;
        if ('firstname' in details) return details.firstname;
        return 'Sans titre';
    };

    const getImage = () => {
        if ('medias' in details && details.medias && details.medias.length > 0) {
            return getMediaImageUrl(details.medias[0].id);
        }
        return null;
    };

    const getTags = (): Array<{ label: string; color: string }> => {
        const tags: Array<{ label: string; color: string }> = [];

        // Nature
        if ('natures' in details && details.natures && details.natures.length > 0) {
            const nature = typeof details.natures[0] === 'object' && 'name' in details.natures[0]
                ? (details.natures[0] as FilterOption).name
                : String(details.natures[0]);
            tags.push({ label: nature, color: 'bg-blue-100 text-blue-800' });
        }

        // Siècles
        if ('centuries' in details && details.centuries && details.centuries.length > 0) {
            const century = typeof details.centuries[0] === 'object' && 'name' in details.centuries[0]
                ? (details.centuries[0] as FilterOption).name
                : String(details.centuries[0]);
            tags.push({ label: century, color: 'bg-purple-100 text-purple-800' });
        }

        // Profession (pour personnes physiques)
        if ('professions' in details && details.professions && details.professions.length > 0) {
            const profession = typeof details.professions[0] === 'object' && 'name' in details.professions[0]
                ? (details.professions[0] as FilterOption).name
                : String(details.professions[0]);
            tags.push({ label: profession, color: 'bg-green-100 text-green-800' });
        }

        return tags;
    };

    const title = getTitle();
    const image = getImage();
    const tags = getTags();

    return (
        <div className="flex items-center gap-3">
            {/* Image */}
            {image ? (
                <ImageWithFallback
                    src={image}
                    alt={title}
                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                />
            ) : (
                <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
            )}

            {/* Titre et tags */}
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate max-w-[250px]">{title}</p>
                {tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {tags.map((tag, idx) => (
                            <Badge key={idx} className={`text-xs ${tag.color}`}>
                                {tag.label}
                            </Badge>
                        ))}
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">ID: {documentId}</p>
                {onViewDetail && (
                    <Button
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(documentId, category);
                        }}
                        className="text-xs px-0 h-auto"
                    >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Voir détails
                    </Button>
                )}
            </div>
        </div>
    );
}

// Sous-composant pour afficher le titre complet dans la section dépliée
function DocumentFullTitle({
                               documentId,
                               category,
                               event
                           }: {
    documentId: string;
    category: ContributionEvent['category'];
    event: ContributionEvent['event'];
}) {
    const [details, setDetails] = useState<DetailResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isRejection = event === 'document_submission_rejection' || event === 'document_update_rejection';

    useEffect(() => {
        if (isRejection) {
            setIsLoading(false);
            return;
        }

        const loadDetails = async () => {
            try {
                const data = await apiService.getRecordDetail(category, documentId);
                setDetails(data);
            } catch (err) {
                console.error('Erreur chargement titre:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDetails();
    }, [documentId, category, isRejection]);

    if (isLoading) {
        return <span className="text-sm text-muted-foreground italic">Chargement...</span>;
    }

    if (isRejection) {
        return <span className="text-sm text-muted-foreground italic">Document rejeté (supprimé)</span>;
    }

    if (!details) {
        return <span className="text-sm text-muted-foreground italic">Document #{documentId}</span>;
    }

    const getTitle = () => {
        if ('title' in details) return details.title;
        if ('firstname' in details) return details.firstname;
        return 'Sans titre';
    };

    return <span className="text-sm">{getTitle()}</span>;
}

export function ContributionsPage({ onViewDetail }: { onViewDetail?: (documentId: string, category: string) => void }) {
    const [contributions, setContributions] = useState<ContributionEvent[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof ContributionEvent;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Fonction pour toggler l'expansion d'une ligne
    const toggleRow = (contributionId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(contributionId)) {
                newSet.delete(contributionId);
            } else {
                newSet.add(contributionId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        loadContributions();
    }, [currentPage]);

    const loadContributions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getAllContributions(ITEMS_PER_PAGE, currentPage);
            setContributions(data.events);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement des contributions");
            console.error('Erreur:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction de tri
    const handleSort = (key: keyof ContributionEvent) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtrage et tri
    const filteredAndSortedContributions = useMemo(() => {
        let filtered = contributions.filter(contribution => {
            const query = searchQuery.toLowerCase();
            return (
                contribution.document_id.toString().includes(query) ||
                (contribution.user_firstname && contribution.user_firstname.toLowerCase().includes(query)) ||
                (contribution.user_lastname && contribution.user_lastname.toLowerCase().includes(query)) ||
                (contribution.user_mail && contribution.user_mail.toLowerCase().includes(query)) ||
                (contribution.admin_firstname && contribution.admin_firstname.toLowerCase().includes(query)) ||
                (contribution.admin_lastname && contribution.admin_lastname.toLowerCase().includes(query)) ||
                contribution.event.toLowerCase().includes(query) ||
                contribution.category.toLowerCase().includes(query)
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
    }, [contributions, searchQuery, sortConfig]);

    const getEventBadge = (event: ContributionEvent['event']) => {
        switch (event) {
            case 'document_submission':
                return <Badge className="bg-blue-100 text-blue-800">Soumission</Badge>;
            case 'document_update':
                return <Badge className="bg-purple-100 text-purple-800">Modification</Badge>;
            case 'document_submission_validation':
                return <Badge className="bg-green-100 text-green-800">Validation soumission</Badge>;
            case 'document_submission_rejection':
                return <Badge className="bg-red-100 text-red-800">Rejet soumission</Badge>;
            case 'document_update_validation':
                return <Badge className="bg-green-100 text-green-800">Validation modification</Badge>;
            case 'document_update_rejection':
                return <Badge className="bg-red-100 text-red-800">Rejet modification</Badge>;
            default:
                return <Badge variant="secondary">{event}</Badge>;
        }
    };

    const getCategoryLabel = (category: ContributionEvent['category']) => {
        switch (category) {
            case 'monuments_lieux':
                return 'Monuments & Lieux';
            case 'mobiliers_images':
                return 'Mobiliers & Images';
            case 'personnes_morales':
                return 'Personnes Morales';
            case 'personnes_physiques':
                return 'Personnes Physiques';
            default:
                return category;
        }
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des contributions...</p>
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
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="flex items-center gap-2 mb-2">
                        <FileText className="w-8 h-8" />
                        Historique des Contributions
                    </h1>
                    <p className="text-muted-foreground">
                        Vue d'ensemble de toutes les actions effectuées sur les fiches
                    </p>
                </div>
            </div>

            {/* Statistiques */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        Total des contributions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl">{total}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">contributions enregistrées</p>
                </CardContent>
            </Card>

            {/* Barre de recherche et liste */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des contributions</CardTitle>
                    <CardDescription>
                        {filteredAndSortedContributions.length} contribution{filteredAndSortedContributions.length > 1 ? 's' : ''} affichée{filteredAndSortedContributions.length > 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par document, contributeur, admin, événement..."
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
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('date')}
                                            className="flex items-center gap-1 px-2"
                                        >
                                            Date
                                            <ArrowUpDown className="w-3 h-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('event')}
                                            className="flex items-center gap-1 px-2"
                                        >
                                            Événement
                                            <ArrowUpDown className="w-3 h-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Contributeur</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedContributions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            Aucune contribution trouvée
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedContributions.map((contribution, index) => {
                                        const contributionId = `${contribution.document_id}-${contribution.date}-${index}`;
                                        const isExpanded = expandedRows.has(contributionId);

                                        return (
                                            <>
                                                {/* Ligne principale cliquable */}
                                                <TableRow
                                                    key={contributionId}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => toggleRow(contributionId)}
                                                >
                                                    <TableCell>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {formatCreationDate(contribution.date)}
                                                    </TableCell>
                                                    <TableCell>{getEventBadge(contribution.event)}</TableCell>
                                                    <TableCell>
                                                        <DocumentPreview
                                                            documentId={contribution.document_id.toString()}
                                                            category={contribution.category}
                                                            event={contribution.event}
                                                            onViewDetail={onViewDetail}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {contribution.user_firstname && contribution.user_lastname ? (
                                                            <div>
                                                                <div className="flex items-center gap-1">
                                                                    <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                                    <span>{contribution.user_firstname} {contribution.user_lastname}</span>
                                                                </div>
                                                                {contribution.user_mail && (
                                                                    <span className="text-xs text-muted-foreground block ml-4">
                                {contribution.user_mail}
                              </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">—</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Ligne dépliée avec détails supplémentaires */}
                                                {isExpanded && (
                                                    <TableRow key={`${contributionId}-expanded`}>
                                                        <TableCell colSpan={5} className="bg-muted/30 py-4">
                                                            <div className="space-y-4 px-4">
                                                                {/* Titre complet */}
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Titre du document</p>
                                                                    <DocumentFullTitle
                                                                        documentId={contribution.document_id.toString()}
                                                                        category={contribution.category}
                                                                        event={contribution.event}
                                                                    />
                                                                </div>

                                                                {/* Catégorie et Administrateur */}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Catégorie</p>
                                                                        <p className="text-sm">{getCategoryLabel(contribution.category)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Administrateur</p>
                                                                        {contribution.admin_firstname && contribution.admin_lastname ? (
                                                                            <div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Shield className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                                                    <span className="text-sm">{contribution.admin_firstname} {contribution.admin_lastname}</span>
                                                                                </div>
                                                                                {contribution.admin_mail && (
                                                                                    <span className="text-xs text-muted-foreground block ml-4">
                                                        {contribution.admin_mail}
                                                      </span>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-sm text-muted-foreground italic">—</span>
                                                                        )}
                                                                    </div>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} sur {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Précédent
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}