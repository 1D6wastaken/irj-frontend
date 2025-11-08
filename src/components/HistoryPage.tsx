import {useState, useEffect} from "react";
import {ArrowLeft, Clock, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "./ui/button";
import {Card, CardContent} from "./ui/card";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "./ui/table";
import {apiService, HistoryEvent, ApiError} from "../config/api";
import {toast} from "sonner";
import {HistoryTableRow} from "./HistoryTableRow";

interface HistoryPageProps {
    onBack: () => void;
    onSessionExpired: () => void;
    userId: string;
    onViewFormDetail: (formId: string, formSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => void;
}

export function HistoryPage({onBack, onSessionExpired, userId, onViewFormDetail}: HistoryPageProps) {
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        loadHistory();
    }, [currentPage, userId]);

    const loadHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiService.getUserHistory(userId, limit, currentPage);
            setEvents(response.events);
            setTotal(response.total);
            setTotalPages(Math.ceil(response.total / limit));
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
            if (error instanceof ApiError && error.status === 401) {
                onSessionExpired();
            } else {
                setError('Impossible de charger l\'historique');
                toast.error('Erreur lors du chargement de l\'historique');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'monuments_lieux': 'Monuments & Lieux',
            'mobiliers_images': 'Mobiliers & Images',
            'personnes_morales': 'Personnes Morales',
            'personnes_physiques': 'Personnes Physiques'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'monuments_lieux': 'bg-blue-100 text-blue-800',
            'mobiliers_images': 'bg-green-100 text-green-800',
            'personnes_morales': 'bg-purple-100 text-purple-800',
            'personnes_physiques': 'bg-orange-100 text-orange-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getEventLabel = (event: string) => {
        const labels: Record<string, string> = {
            'document_submission': 'Soumission de document',
            'document_update': 'Mise à jour de document',
            'document_submission_validation': 'Document soumis validé',
            'document_submission_rejection': 'Document soumis rejeté',
            'document_update_validation': 'Mise à jour validée',
            'document_update_rejection': 'Mise à jour rejetée'
        };
        return labels[event] || event;
    };

    const isAccepted = (event: string) => {
        return event === 'document_submission_validation' || event === 'document_update_validation';
    };

    const isRejected = (event: string) => {
        return event === 'document_submission_rejection' || event === 'document_update_rejection';
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Détermine si l'événement permet un lien vers la fiche
    const isClickable = (event: HistoryEvent) => {
        // Les événements validés et les rejets de mise à jour (la fiche originale existe) sont cliquables
        return event.event === 'document_submission_validation' ||
            event.event === 'document_update_validation' ||
            event.event === 'document_update_rejection';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-5xl mx-auto">
                        <Button variant="ghost" onClick={onBack} className="mb-6 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4"/>
                            Retour
                        </Button>
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">⏳</div>
                            <h3 className="text-xl text-muted-foreground">
                                Chargement de l'historique...
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-5xl mx-auto">
                        <Button variant="ghost" onClick={onBack} className="mb-6 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4"/>
                            Retour
                        </Button>
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl text-destructive mb-2">{error}</h3>
                            <Button onClick={loadHistory} className="mt-4">Réessayer</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Button variant="ghost" onClick={onBack} className="mb-4 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4"/>
                                Retour à l'accueil
                            </Button>
                            <h1 className="text-2xl font-bold text-foreground">Mon historique</h1>
                            <p className="text-muted-foreground">
                                {total} contribution{total !== 1 ? 's' : ''} au total
                            </p>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    Aucune contribution pour le moment
                                </h3>
                                <p className="text-muted-foreground">
                                    Votre historique de contributions apparaîtra ici.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Tableau des événements */}
                            <div className="mb-8 border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Image</TableHead>
                                            <TableHead>Titre et tags</TableHead>
                                            <TableHead>Catégorie</TableHead>
                                            <TableHead>Événement</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {events.map((event, index) => (
                                            <HistoryTableRow
                                                key={`${event.document_id}-${event.date}-${index}`}
                                                event={event}
                                                onViewFormDetail={onViewFormDetail}
                                                getCategoryLabel={getCategoryLabel}
                                                getCategoryColor={getCategoryColor}
                                                getEventLabel={getEventLabel}
                                                isAccepted={isAccepted}
                                                isRejected={isRejected}
                                                isClickable={isClickable}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4"/>
                                        Précédent
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </span>
                                    <Button
                                        variant="outline"
                                        onClick={handleNextPage}
                                        disabled={currentPage >= totalPages}
                                        className="flex items-center gap-2"
                                    >
                                        Suivant
                                        <ChevronRight className="w-4 h-4"/>
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}