/**
 * Textes d'aide pour les bulles d'information des formulaires
 */

export const tooltipTexts = {
    // Champs communs à toutes les catégories
    common: {
        category: "Sélectionnez la catégorie qui correspond le mieux à votre fiche : Monuments & Lieux, Mobiliers & Images, Personnes Morales ou Personnes Physiques.",
        name: "Indiquez le nom principal ou le titre de l'élément patrimonial que vous documentez.",
        centuries: "Sélectionnez le ou les siècles auxquels l'élément est associé. Vous pouvez en sélectionner plusieurs si l'élément s'étend sur plusieurs périodes.",
        themes: "Choisissez les thématiques liées à cet élément (ex: religion, culture, architecture, art, etc.).",
        description: "Décrivez l'élément patrimonial de manière détaillée : caractéristiques physiques, style, état actuel, particularités remarquables, etc.",
        history: "Racontez l'histoire de l'élément : origine, évolution dans le temps, événements marquants, modifications importantes, contexte historique, etc.",
        bibliography: "Listez les sources bibliographiques consultées : livres, articles, thèses, documents d'archives, etc. Format recommandé : Auteur, Titre, Éditeur, Année.",
        images: "Ajoutez des photographies ou images de l'élément. Chaque image peut avoir une légende descriptive pour préciser ce qu'elle montre.",
        contributors: "Indiquez les noms des personnes ayant contribué à la création ou à l'enrichissement de cette fiche.",
        relatedForms: "Recherchez et associez d'autres fiches en lien avec cet élément (lieu associé, objet connexe, personne liée, etc.).",
        conservationStates: "Sélectionnez l'état de conservation général de l'élément patrimonial.",
        materials: "Choisissez les matériaux principaux utilisés dans la construction ou la fabrication de l'élément.",
        protected: "Indiquez si l'élément bénéficie d'une protection juridique (Monument Historique, site classé, etc.).",
        protectionComment: "Précisez le type et la date de protection (ex: Classé MH le 15/06/1920, Inscrit ISMH le 10/03/1995).",
        natures: "Sélectionnez la et les types qui décrivent le mieux cet élément patrimonial.",
    },
    search: {
        location: "Recherchez par lieu (pays, région, département et commune). Plusieurs critères peuvent être combinés pour affiner la recherche.",
        centuries: "Recherchez par siècle. Vous pouvez sélectionner un ou plusieurs siècles pour affiner les résultats.",
        themes: "Recherchez par thèmes. Vous pouvez sélectionner un ou plusieurs thèmes pour affiner les résultats.",
        category: "Filtrez les résultats par catégorie d'élément patrimonial : Monuments & Lieux, Mobiliers & Images, Personnes Morales ou Personnes Physiques.",
        monumentsLieux: {
            natures: "Filtrez les monuments ou lieux par type (ex: église, chapelle, cimetière, fontaine, etc.).",
            conservationStates: "Filtrez par état de conservation des monuments ou lieux (ex: bon état, restauré, ruines, dégradé, etc.).",
            materials: "Filtrez par matériaux de construction des monuments ou lieux (ex: pierre, brique, bois, etc.).",
        },
        mobiliersImages: {
            natures: "Recherchez des mobiliers ou images par type (ex: statue, tableau, reliquaire, manuscrit, photographie, etc.).",
            conservationStates: "Filtrez par état de conservation du mobilier ou image (ex: bon état, restauré, ruines, dégradé, etc.).",
            materials: "Filtrez le mobilier ou image par matériaux utilisés (ex: pierre, brique, bois, etc.).",
            techniques: "Filtrez par techniques de fabrication ou de création (ex: sculpture, peinture, gravure, enluminure, etc.).",
        },
        personnesMorales: {
            natures: "Recherchez des personnes morales par type d'organisation (ex: confrérie, paroisse, ordre religieux, association, etc.).",
        },
        personnesPhysiques: {
            professions: "Filtrez les personnes physiques par métier ou fonction exercée (ex: prêtre, évêque, artisan, artiste, etc.).",
            transportModes: "Filtrez par moyens de transport utilisés lors des déplacements ou pèlerinages (ex: à pied, à cheval, en bateau, etc.).",
        },
    },
    // Localisation
    location: {
        title: "Précisez la localisation géographique complète de l'élément patrimonial. Tous les champs sont obligatoires.",
        country: "Sélectionnez le pays où se trouve l'élément.",
        region: "Sélectionnez la région administrative correspondante.",
        department: "Sélectionnez le département.",
        commune: "Tapez au moins 2 caractères pour rechercher une commune. Les résultats seront filtrés selon vos sélections précédentes (pays, région, département).",
        coordinates: "Coordonnées géographiques précises (latitude et longitude) au format décimal.",
        latitude: "Latitude au format décimal (ex: 48.8566). Positif pour l'hémisphère nord, négatif pour le sud.",
        longitude: "Longitude au format décimal (ex: 2.3522). Positif pour l'est du méridien de Greenwich, négatif pour l'ouest.",
    },

    // Source
    source: {
        title: "Informations sur l'origine et la provenance des informations contenues dans cette fiche.",
        author: "Nom de l'auteur de la source consultée.",
        sourceTitle: "Titre de la source (livre, article, document, site web, archive, etc.).",
        url: "Adresse web si la source est disponible en ligne.",
        details: "Détails complémentaires sur la source : numéro de page, volume, date de consultation, cote d'archive, etc.",
    },

    // Monuments & Lieux
    monumentsLieux: {
        natures: "Type d'édifice ou de lieu (ex: église, chapelle, monastère, cimetière, fontaine, calvaire, etc.).",
        protected: "Indiquez si le monument bénéficie d'une protection juridique (Monument Historique, site classé, etc.).",
        protectionComment: "Précisez le type et la date de protection (ex: Classé MH le 15/06/1920, Inscrit ISMH le 10/03/1995).",
        currentLocation: "Localisation actuelle de l'élément si elle diffère de sa localisation d'origine.",
        originalLocation: "Lieu d'origine de l'élément s'il a été déplacé au cours de son histoire.",
        conservationStates: "État de conservation actuel de l'édifice (ex: bon état, restauré, ruines, dégradé, etc.).",
        materials: "Matériaux principaux utilisés pour la construction (ex: pierre, brique, bois, etc.).",
    },

    // Mobiliers & Images
    mobiliersImages: {
        natures: "Type d'objet ou d'image (ex: statue, tableau, reliquaire, manuscrit, photographie, vitrail, etc.).",
        protected: "Indiquez si le mobiliers ou images bénéficie d'une protection juridique.",
        protectionComment: "Précisez le type et la date de protection (ex: Classé MH le 15/06/1920, Inscrit ISMH le 10/03/1995).",
        history: "Histoire de l'objet : provenance, acquisitions, restaurations, modifications, etc.",
        materials: "Matériaux utilisés pour créer l'objet (ex: bois, pierre, métal, toile, parchemin, verre, etc.).",
        techniques: "Techniques de fabrication ou de création (ex: sculpture, peinture à l'huile, gravure, enluminure, etc.).",
        conservationStates: "État de conservation actuel de l'objet (ex: bon état, restauré, dégradé, fragmentaire, incomplet, etc.).",
        currentLocation: "Lieu de conservation actuel de l'objet (musée, église, collection privée, dépôt, etc.).",
        originalLocation: "Lieu d'origine de l'objet s'il a été déplacé depuis sa création.",
        inscription: "Transcription des inscriptions, signatures, dates ou marques présentes sur l'objet.",
    },

    // Personnes Morales
    personnesMorales: {
        natures: "Type d'organisation (ex: confrérie, paroisse, ordre religieux, association, fondation, chapitre, etc.).",
        comment: "Commentaires ou informations complémentaires sur l'organisation qui ne trouvent pas leur place ailleurs.",
        history: "Histoire de l'organisation : date de création, évolutions majeures, événements marquants, etc.",
        foundationAct: "Cochez si vous possédez ou avez consulté l'acte de fondation ou de création de l'organisation.",
        statutesText: "Cochez si vous avez accès aux statuts officiels de l'organisation.",
        functioningDescription: "Décrivez le fonctionnement de l'organisation : structure hiérarchique, activités principales, règles de fonctionnement, etc.",
        socialParticipation: "Indiquez la composition sociale de l'organisation et le rôle de ses membres (origine sociale, professions, fonctions, etc.).",
        relatedObjects: "Objets ou biens matériels associés à cette organisation (ex: bannières, registres, sceaux, mobilier liturgique, etc.).",
        simpleMention: "Cochez s'il s'agit d'une simple mention de l'organisation dans un document, sans informations détaillées.",
    },

    // Personnes Physiques
    personnesPhysiques: {
        firstname: "Prénom(s) de la personne.",
        lastname: "Nom de famille de la personne.",
        birthDate: "Date de naissance au format JJ/MM/AAAA. Si la date exacte est inconnue, indiquez au minimum l'année.",
        deathDate: "Date de décès au format JJ/MM/AAAA. Si la date exacte est inconnue, indiquez au minimum l'année.",
        professions: "Métiers ou fonctions exercés par la personne (ex: prêtre, évêque, artisan, artiste, marchand, etc.).",
        biographicalElements: "Éléments biographiques importants : formation, parcours de vie, réalisations, événements marquants, etc.",
        historicalPeriods: "Périodes historiques durant lesquelles la personne a vécu ou été particulièrement active.",
        pilgrimage: "Informations sur les pèlerinages effectués par la personne ou organisés en son honneur.",
        commutationVow: "Détails sur d'éventuels vœux de commutation (substitution d'un vœu par un autre engagement).",
        transportModes: "Moyens de transport utilisés lors des déplacements ou pèlerinages (ex: à pied, à cheval, en bateau, en chariot, etc.).",
        eventNature: "Nature des événements marquants de la vie de la personne (naissance, ordination, voyage, décès, etc.).",
        simpleMention: "Cochez s'il s'agit d'une simple mention de la personne dans un document, sans informations biographiques détaillées.",
        comment: "Commentaires ou informations complémentaires sur la personne qui ne trouvent pas leur place ailleurs.",
        attestation: "Documents ou sources attestant de l'existence ou des actions de la personne (acte notarié, registre paroissial, témoignage, etc.).",
    },
};
