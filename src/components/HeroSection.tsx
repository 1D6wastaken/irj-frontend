import {ImageWithFallback} from "./ImageWithFallback.tsx";
import {dynamicHomeText} from "../hooks/dynamicHomeText.tsx";

interface HeroSectionProps {
    onLearnMore?: () => void;
    onExploreNow?: () => void;
}

export function HeroSection({onLearnMore, onExploreNow}: HeroSectionProps) {
    const {t} = dynamicHomeText();
    return (
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
            {/* Effet de fond décoratif */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black"></div>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                    <div className="lg:w-1/2 space-y-6 md:space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                                {t('hero.title')}
                            </h1>
                            <p className="text-lg md:text-xl text-red-100 leading-relaxed">
                                {t('hero.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onExploreNow}
                                className="bg-white text-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-red-50 transition-all duration-200 cursor-pointer"
                            >
                                {t('hero.whitebutton')}
                            </button>
                            <button
                                onClick={onLearnMore}
                                className="border border-white/20 text-white hover:bg-white/10 px-6 md:px-8 py-3 md:py-4 rounded-xl font-small transition-all duration-200 cursor-pointer"
                            >
                                {t('hero.redbutton')}
                            </button>
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        <div className="relative">
                            <ImageWithFallback
                                src="/patrimoine_jacquaire.jpg"
                                alt="Patrimoine médiéval de Saint-Jacques"
                                className="rounded-2xl shadow-2xl w-full h-64 md:h-96 object-cover"
                            />
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-red-900/40 via-transparent to-transparent rounded-2xl"></div>

                            {/* Légende de l'image alignée à droite */}
                            <div className="mt-3 text-right">
                                <p className="text-sm md:text-sm text-red-100/80 leading-relaxed max-w-md ml-auto italic">
                                    {t('hero.imagelegend')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}