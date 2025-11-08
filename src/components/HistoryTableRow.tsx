import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { TableRow, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { apiService, HistoryEvent, FilterOption, MediaDetail } from "../config/api";
import { formatCreationDate } from "../config/api";
import { ImageWithFallback } from "./ImageWithFallback";
import { getMediaImageUrl } from "../utils/searchUtils";

interface HistoryTableRowProps {
    event: HistoryEvent;
    onViewFormDetail: (formId: string, formSource: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques') => void;
    getCategoryLabel: (category: string) => string;
    getCategoryColor: (category: string) => string;
    getEventLabel: (event: string) => string;
    isAccepted: (event: string) => boolean;
    isRejected: (event: string) => boolean;
    isClickable: (event: HistoryEvent) => boolean;
}

interface DocumentDetails {
    title?: string;
    firstname?: string;
    medias?: MediaDetail[];
    natures?: FilterOption[];
    centuries?: FilterOption[];
}

export function HistoryTableRow({
                                    event,
                                    onViewFormDetail,
                                    getCategoryLabel,
                                    getCategoryColor,
                                    getEventLabel,
                                    isAccepted,
                                    isRejected,
                                    isClickable
                                }: HistoryTableRowProps) {
    const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    useEffect(() => {
        loadDocumentDetails();
    }, [event.document_id, event.category]);

    const loadDocumentDetails = async () => {
        // On charge les détails seulement si la fiche est cliquable (donc existe)
        if (!isClickable(event)) {
            setIsLoadingDetails(false);
            return;
        }

        try {
            const details = await apiService.getRecordDetail(event.category, event.document_id);
            setDocumentDetails(details as DocumentDetails);
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            // En cas d'erreur, on continue sans les détails
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <TableRow>
            {/* Image */}
            <TableCell>
                {!isLoadingDetails && documentDetails?.medias && documentDetails.medias.length > 0 ? (
                    <ImageWithFallback
                        src={getMediaImageUrl(documentDetails.medias[0].id)}
                        alt={documentDetails.medias[0].title || documentDetails.title || 'Image de la fiche'}
                        className="w-24 h-24 object-cover rounded"
                    />
                ) : (
                    <div className="w-24 h-24 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                        {isLoadingDetails ? '...' : 'N/A'}
                    </div>
                )}
            </TableCell>

            {/* Titre et Tags */}
            <TableCell>
                {!isLoadingDetails && (documentDetails?.title || documentDetails?.firstname) ? (
                    <>
                        <div className="mb-2 line-clamp-2">{documentDetails.title || documentDetails.firstname}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {documentDetails.natures && documentDetails.natures.length > 0 && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                    {documentDetails.natures[0].name}
                                </Badge>
                            )}
                            {documentDetails.centuries && documentDetails.centuries.length > 0 && (
                                <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground text-xs">
                                    {documentDetails.centuries[0].name}
                                </Badge>
                            )}
                        </div>
                    </>
                ) : (
                    <span className="text-muted-foreground text-sm">
            {isLoadingDetails ? 'Chargement...' : 'Détails non disponibles'}
          </span>
                )}
            </TableCell>

            {/* Catégorie */}
            <TableCell>
                <Badge className={getCategoryColor(event.category)} variant="secondary">
                    {getCategoryLabel(event.category)}
                </Badge>
            </TableCell>

            {/* Événement */}
            <TableCell>
                <span className="text-sm">{getEventLabel(event.event)}</span>
            </TableCell>

            {/* Statut */}
            <TableCell>
                {isAccepted(event.event) && (
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepté
                    </Badge>
                )}
                {isRejected(event.event) && (
                    <Badge className="bg-red-100 text-red-800" variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejeté
                    </Badge>
                )}
                {!isAccepted(event.event) && !isRejected(event.event) && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        En attente
                    </Badge>
                )}
            </TableCell>

            {/* Date */}
            <TableCell className="text-sm text-muted-foreground">
                {formatCreationDate(event.date)}
            </TableCell>

            {/* Actions */}
            <TableCell>
                {isClickable(event) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewFormDetail(event.document_id, event.category as any)}
                    >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Voir
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}