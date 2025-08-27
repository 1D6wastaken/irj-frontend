export function IntroSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <div className="inline-block bg-white text-primary px-6 py-3 rounded-full font-medium shadow-lg">
              Notre mission
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Vers un inventaire complet du patrimoine jacquaire
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Ce site est une plateforme moderne dédiée à l'inventaire et à la valorisation du patrimoine
              jacquaire. L’IRJ propose de recenser, documenter et partager les connaissances sur les
              monuments, objets d'art, personnalités et institutions en rapport avec l’histoire et les trois légendes
              de saint Jacques, Charlemagne et Compostelle.
            </p>
            
            <h3 className="text-xl text-muted-foreground font-bold max-w-3xl mx-auto">
              Un patrimoine d'exception
            </h3>
             <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"> 
              Le patrimoine lié à saint Jacques constitue un témoignage unique de notre histoire spirituelle et
              culturelle. En rassemblant des informations dispersées dans une plateforme moderne, accessible
              et ouverte à des contributions extérieures, l’IRJ participe à la valorisation de cet héritage
              exceptionnel.
             </p>
            
            <h3 className="text-xl text-muted-foreground font-bold max-w-3xl mx-auto">  
              Quel saint Jacques ?
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Le parti pris par ce site est celui de considérer, comme les fidèles du Moyen Age, que derrière ces
              souvenirs, il n’y a qu’un saint Jacques apôtre et auteur de l’Epître.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="text-3xl font-bold text-primary mb-2">400+</div>
                <div className="text-muted-foreground">Monuments référencés</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="text-3xl font-bold text-primary mb-2">1500+</div>
                <div className="text-muted-foreground">Objets d'art</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Personnalités</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}