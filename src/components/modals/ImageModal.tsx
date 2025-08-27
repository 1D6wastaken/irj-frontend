import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../ImageWithFallback";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: Array<{
        url: string;
        title: string;
    }>;
    initialIndex?: number;
}

export function ImageModal({ isOpen, onClose, images, initialIndex = 0 }: ImageModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Mettre à jour l'index quand initialIndex change
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Gestion des touches clavier
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Empêcher le scroll du body quand la modal est ouverte
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, currentIndex]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || images.length === 0) {
        return null;
    }

    const currentImage = images[currentIndex];

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            {/* Bouton de fermeture */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                onClick={onClose}
            >
                <X className="w-5 h-5" />
            </Button>

            {/* Navigation précédente */}
            {images.length > 1 && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                    onClick={goToPrevious}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
            )}

            {/* Navigation suivante */}
            {images.length > 1 && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                    onClick={goToNext}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            )}

            {/* Contenu principal */}
            <div className="max-w-7xl max-h-full w-full h-full flex flex-col items-center justify-center">
                {/* Image */}
                <div className="relative max-w-full max-h-[calc(100vh-120px)] flex items-center justify-center">
                    <ImageWithFallback
                        src={currentImage.url}
                        alt={currentImage.title}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                </div>

                {/* Informations sur l'image */}
                <div className="mt-4 text-center space-y-2">
                    <p className="text-white text-lg font-medium">
                        {currentImage.title}
                    </p>

                    {images.length > 1 && (
                        <div className="flex items-center justify-center space-x-4">
                            <p className="text-white/70 text-sm">
                                Image {currentIndex + 1} sur {images.length}
                            </p>

                            {/* Indicateurs de pagination */}
                            <div className="flex gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            index === currentIndex
                                                ? 'bg-white'
                                                : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                        onClick={() => setCurrentIndex(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions pour les utilisateurs */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm text-center">
                <p>
                    {images.length > 1 ? 'Utilisez les flèches ou ← → pour naviguer • ' : ''}
                    Échap pour fermer
                </p>
            </div>
        </div>
    );
}