import {ImageWithFallback} from "./ImageWithFallback.tsx";

export function InMemoriamSection() {
    return (
        <section className="bg-secondary py-12 md:py-16 border-t border-b" style={{borderColor: '#8b2635'}}>
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 tracking-widest text-foreground">
                        IN MEMORIAM
                    </h2>

                    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
                        <div className="w-48 md:w-56 flex-shrink-0 mx-auto md:mx-0">
                            <ImageWithFallback
                                src="/louis_mollaret.jpg"
                                alt="Louis Mollaret au congrès d'Orense, avril 2023"
                                className="rounded-lg w-full h-auto object-cover shadow-md"
                            />
                        </div>

                        <div className="flex-1 space-y-4">
                            <p className="text-base md:text-lg leading-relaxed text-foreground">
                                Louis MOLLARET, l'indéfectible compagnon de Denise Péricard-Méa, co-fondateur
                                avec elle de l'association Fondation David-Parou-Saint-Jacques, puis de l'Institut de
                                Recherche Jacquaire, est parti rejoindre le chemin des étoiles hier après-midi à son
                                domicile de Tours.
                            </p>
                            <p className="text-base md:text-lg leading-relaxed text-foreground">
                                Ce brillant polytechnicien avait marqué le monde jacquaire en 1998 en
                                devenant le premier président de l'association de Provence-Alpes, Côte d'Azur-Corse
                                (PACA Corse), et puis le fondateur de L'Union Jacquaire, premier organisme
                                fédérateur des associations jacquaires en France, prédécesseurs de la Fédération,
                                aujourd'hui dite Compostelle France. Pèlerin de la première heure, défenseur
                                infatigable de la culture jacquaire qui lui avait permis de rencontrer Denise, il a publié
                                avec elle majoritairement une dizaine d'ouvrages à thématique jacquaire.
                            </p>
                            <p className="text-base md:text-lg leading-relaxed text-foreground font-semibold">
                                Son esprit incisif et visionnaire va nous manquer.
                            </p>
                            <p className="text-base md:text-lg leading-relaxed italic text-primary mt-6">
                                Elvire Torguet
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
