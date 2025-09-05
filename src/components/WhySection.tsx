import { BookOpen, Shield, Users } from "lucide-react";

interface WhySectionProps {
  user?: any;
  onBecomeContributor?: () => void;
  onContribute?: () => void;
}

export function WhySection({ user, onContribute, onBecomeContributor }: WhySectionProps) {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-10xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Vers un inventaire complet du patrimoine jacquaire
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-9xl mx-auto">
                Proposé par l’IRJ, ce site est dédié à l'inventaire et à la valorisation du patrimoine
                jacquaire européen. Il est destiné à recenser, documenter et partager les
                connaissances sur les monuments, objets d'art, personnalités et institutions en
                rapport avec l’histoire et les trois légendes de saint Jacques, Charlemagne et
                Compostelle.<br/>
                Le parti pris est de considérer, comme les fidèles du Moyen Age, que derrière ce
                patrimoine, il n’y a qu’un saint Jacques apôtre et auteur de l’Epître.
                <br/>
                <br/>
                En rassemblant des informations dispersées et les rendant accessibles et ouvertes à des
                contributions extérieures, l’IRJ participe à la valorisation de cet héritage. Il répond à des
                enjeux majeurs de préservation et de valorisation du patrimoine jacquaire européen, matériel

                et immatériel, existant ou disparu, un patrimoine exceptionnel.
            </p>
          </div>

        <h3 className="text-3xl md:text-2xl font-bold text-foreground text-center mb-4">
            Par cette initiative, l'IRJ contribue à
        </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Préserver la mémoire</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Documenter l'histoire du patrimoine disparu.
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Rassembler les informations sur les pèlerins du passé, en conserver les souvenirs
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Sauvegarder et documenter le patrimoine existant pour les générations futures
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Renouveler la recherche académique</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Faciliter l'accès aux informations pour les chercheurs, historiens et étudiants
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Mutualiser des recherches dispersées, en susciter de nouvelles
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Sensibiliser le public</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Éduquer et sensibiliser à la richesse de cet héritage culturel et spirituel et le faire connaître
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary rounded-2xl p-6 md:p-8 border border-border">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Pour un patrimoine d'exception</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                  Le patrimoine jacquaire constitue un témoignage unique de l’histoire européenne. En
                  rassemblant ces informations dispersées sur une plateforme moderne et accessible, l’IRJ
                  contribue à la valorisation de cet héritage exceptionnel car unique.
              </p>
              
              {!user && (<button 
                onClick={onBecomeContributor}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200 text-sm md:text-base  cursor-pointer"
              >
                Devenez contributeur !
              </button>)}
                {user && (<button
                    onClick={onContribute}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200 text-sm md:text-base  cursor-pointer"
                >
                    Contribuer !
                </button>)}
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base pt-8">L'IRJ mobilise toutes les bonnes volontés</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}