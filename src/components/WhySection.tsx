import { BookOpen, Shield, Users } from "lucide-react";

interface WhySectionProps {
  user?: any;
  onContribute?: () => void;
}

export function WhySection({ user, onContribute }: WhySectionProps) {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi cet inventaire ?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              En proposant ce site, l’IRJ répond à des enjeux majeurs de préservation et de valorisation du
              patrimoine lié à saint Jacques, à la fois européen, matériel et immatériel, existant ou disparu
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Préservation de la mémoire</h3>
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
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Recherche académique</h3>
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
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Sensibilisation du public</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Éduquer et sensibiliser à la richesse de notre héritage culturel et spirituel de ce patrimoine en le faisant connaître
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary rounded-2xl p-6 md:p-8 border border-border">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Un patrimoine d'exception</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                Le patrimoine religieux lié à Saint-Jacques constitue un témoignage unique de notre histoire 
                spirituelle et culturelle. En rassemblant ces informations dispersées dans une plateforme 
                moderne et accessible, nous contribuons à la valorisation de cet héritage exceptionnel.
              </p>
              
              {!user && (<button 
                onClick={onContribute}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200 text-sm md:text-base"
              >
                Devenir contributeur
              </button>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}