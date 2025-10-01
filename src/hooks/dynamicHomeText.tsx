import { createContext, useContext, ReactNode } from 'react';

const texts: { [key: string]: string } = {
    // Hero Section
    'hero.title': 'Patrimoine hérité de Compostelle et des cultes et pèlerinages à saint Jacques',
    'hero.subtitle': 'Découvrez et explorez le patrimoine « jacquaire » (relatif à saint Jacques) à travers notre base ' +
        'de données interactive et moderne',
    'hero.whitebutton': 'Explorer maintenant',
    'hero.redbutton': 'Pourquoi cet inventaire ?',
    'hero.imagelegend': "Saint Jacques apparaît en songe à Charlemagne et lui demande de venir délivrer son tombeau en " +
        "suivant la Voie Lactée (arch. cath. Compostelle, Codex calixtinus, XIIe s., fol. 162, restitution Janine Michel)",

    // Explore Section
    'explore.title': 'Explorez la base de données',
    'explore.subtitle': 'Découvrez la grande variété du patrimoine jacquaire à travers quatre grandes catégories',
    'explore.monumentslieux': 'Églises, chapelles, sanctuaires et lieux de pèlerinage dédiés à Saint-Jacques',
    'explore.mobiliersimages': "Statues, tableaux, reliquaires et objets d'art religieux",
    'explore.personnesmorales': "Confréries, ordres religieux et institutions liées au pèlerinage",
    'explore.personnesphysiques': "Pèlerins, saints, artistes et personnalités historiques",

    'explore.stats1': '500+',
    'explore.stats1.title': 'Monuments référencés',
    'explore.stats2': '1200+',
    'explore.stats2.title': 'Objets d\'art',
    'explore.stats3': '300+',
    'explore.stats3.title': 'Personnalités',

    'explore.end': 'Les explorations proposées ci-dessus donnent pour chaque catégorie une vue d’ensemble du contenu de la base. Mais l’intérêt majeur de la base est de fournir des informations détaillées et de les compléter si nécessaire',

    // Search section
    'search.title': 'Recherches détaillées',
    'search.description1': 'Explorez toute la base de données pour découvrir les caractéristiques détaillées connues de chaque élément répertorié dans la base.',
    'search.description2': 'Le choix des caractéristiques souhaitées est fait en actionnant des filtres qui indiquent le nom de la catégorie et les valeurs enregistrées.',

    // Info section
    'info.title': 'Vers un inventaire complet du patrimoine jacquaire',
    'info.description1': 'Proposé par l’IRJ, ce site est dédié à l\'inventaire et à la valorisation du patrimoine jacquaire européen. Il est destiné à recenser, documenter et partager les connaissances sur les monuments, objets d\'art, personnalités et institutions en rapport avec l’histoire et les trois légendes de saint Jacques, Charlemagne et Compostelle.',
    'info.description2': 'Le parti pris est de considérer, comme les fidèles du Moyen Age, que derrière ce patrimoine, il n’y a qu’un saint Jacques apôtre et auteur de l’Epître.',
    'info.description3': 'En rassemblant des informations dispersées et les rendant accessibles et ouvertes à des contributions extérieures, l’IRJ participe à la valorisation de cet héritage. Il répond à des enjeux majeurs de préservation et de valorisation du patrimoine jacquaire européen, matériel et immatériel, existant ou disparu, un patrimoine exceptionnel.',

    'info.subsection.title': 'Par cette initiative, l\'IRJ contribue à',

    'info.subsection1.title': 'Préserver la mémoire',
    'info.subsection1.description1': 'Documenter l\'histoire du patrimoine disparu.',
    'info.subsection1.description2': 'Rassembler les informations sur les pèlerins du passé, en conserver les souvenirs',
    'info.subsection1.description3': 'Sauvegarder et documenter le patrimoine existant pour les générations futures',

    'info.subsection2.title': 'Renouveler la recherche académique',
    'info.subsection2.description1': 'Faciliter l\'accès aux informations pour les chercheurs, historiens et étudiants.',
    'info.subsection2.description2': 'Mutualiser des recherches dispersées, en susciter de nouvelles',
    'info.subsection2.description3': '',

    'info.subsection3.title': 'Sensibiliser le public',
    'info.subsection3.description1': 'Éduquer et sensibiliser à la richesse de cet héritage culturel et spirituel et le faire connaître.',
    'info.subsection3.description2': '',
    'info.subsection3.description3': '',

    'info.highlight.title': 'Pour un patrimoine d\'exception',
    'info.highlight.description': 'Le patrimoine jacquaire constitue un témoignage unique de l’histoire européenne. En rassemblant ces informations dispersées sur une plateforme moderne et accessible, l’IRJ contribue à la valorisation de cet héritage exceptionnel car unique.',
    'info.highlight.button': 'Devenez contributeur !',
    'info.highlight.end': 'L\'IRJ mobilise toutes les bonnes volontés',

    // Footer
    'footer.description1': 'Site dédié à l\'inventaire et à la valorisation du patrimoine jacquaire européen.',
    'footer.description2': 'Découvrez, explorez et contribuez à la préservation de cet héritage.'
};


interface HomeTextContextType {
    t: (key: string) => string;
}


const HomeTextContext = createContext<HomeTextContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const t = (key: string): string => {
        return texts[key] || '';
    };

    return (
        <HomeTextContext.Provider value={{ t }}>
            {children}
        </HomeTextContext.Provider>
    );
}

export function dynamicHomeText() {
    const context = useContext(HomeTextContext);
    if (context === undefined) {
        throw new Error('dynamicHomeText must be used within a LanguageProvider');
    }
    return context;
}