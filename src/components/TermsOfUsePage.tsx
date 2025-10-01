import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface TermsOfUsePageProps {
    onBack: () => void;
}

export function TermsOfUsePage({ onBack }: TermsOfUsePageProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* En-tête */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2 hover:bg-accent/50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Titre principal */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Règles d'utilisation du site du Patrimoine Saint-Jacques
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Objet */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 1 - Objet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site internet
                                    saintjacquesinfo.eu (ci-après "le Site"), édité par l'Institut de Recherche Jacquaire.
                                </p>
                                <p>
                                    Le Site a pour objet la constitution d'un inventaire collaboratif du patrimoine jacquaire, permettant la recherche, la consultation et la
                                    contribution de données patrimoniales.
                                </p>
                                <p>
                                    L'utilisation du Site implique l'acceptation pleine et entière des présentes CGU par l'utilisateur.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Définitions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 2 - Définitions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Site :</h4>
                                    <p>Le site internet saintjacquesinfo.eu et l'ensemble de ses pages.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Utilisateur :</h4>
                                    <p>Toute personne physique ou morale utilisant le Site.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Contributeur :</h4>
                                    <p>Utilisateur disposant d'un compte validé permettant de soumettre du contenu.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Contenu :</h4>
                                    <p>Informations, textes, images, données relatives au patrimoine publiées sur le Site.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Administrateur :</h4>
                                    <p>Personne habilitée par l'éditeur à modérer et valider les contenus.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Accès au site */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 3 - Accès au Site</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Consultation libre :</h4>
                                    <p>
                                        La consultation des données patrimoniales est libre et gratuite, sous réserve
                                        du respect des présentes CGU.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Compte contributeur :</h4>
                                    <p>
                                        La contribution nécessite la création d'un compte et sa validation par
                                        un administrateur. L'inscription est soumise à l'approbation de l'éditeur.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Prérequis techniques :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Connexion internet</li>
                                        <li>Navigateur web récent compatible HTML5</li>
                                        <li>JavaScript activé</li>
                                    </ul>
                                </div>
                                <p>
                                    L'éditeur se réserve le droit de refuser l'accès au Site ou de suspendre
                                    un compte en cas de non-respect des présentes CGU.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Obligations des utilisateurs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 4 - Obligations des utilisateurs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Usage conforme :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Utiliser le Site uniquement à des fins de recherche</li>
                                        <li>Respecter les droits de propriété intellectuelle</li>
                                        <li>Ne pas porter atteinte au fonctionnement du Site</li>
                                        <li>Ne pas diffuser de contenu illicite ou contraire aux bonnes mœurs</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Sécurité du compte :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Choisir un mot de passe robuste</li>
                                        <li>Maintenir la confidentialité des identifiants</li>
                                        <li>Signaler immédiatement tout usage frauduleux</li>
                                        <li>Mettre à jour les informations de profil</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Exactitude des informations :</h4>
                                    <p>
                                        L'utilisateur s'engage à fournir des informations exactes, à jour et complètes
                                        lors de son inscription et dans ses contributions.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contributions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 5 - Contributions et contenu</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Qualité du contenu :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Fournir des informations exactes et vérifiables</li>
                                        <li>Citer les sources et références appropriées</li>
                                        <li>Respecter la vocation patrimoniale du Site</li>
                                        <li>Utiliser un langage approprié et respectueux</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droits sur les contributions :</h4>
                                    <p>
                                        En soumettant du contenu, le contributeur garantit disposer de tous les droits
                                        nécessaires et concède à l'éditeur une licence d'utilisation non-exclusive,
                                        gratuite et permanente pour la diffusion dans le cadre du Site.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Modération :</h4>
                                    <p>
                                        Toutes les contributions sont soumises à validation avant publication.
                                        L'éditeur se réserve le droit de refuser, modifier ou supprimer tout
                                        contenu ne respectant pas les présentes CGU.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Attribution :</h4>
                                    <p>
                                        Les contributions validées sont publiées avec attribution à leur auteur,
                                        sauf demande contraire expresse du contributeur.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Propriété intellectuelle */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 6 - Propriété intellectuelle</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Droits de l'éditeur :</h4>
                                    <p>
                                        L'architecture, la structure, le design et les fonctionnalités du Site sont
                                        protégés par le droit d'auteur et demeurent la propriété exclusive de l'éditeur.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Contenus patrimoniaux :</h4>
                                    <p>
                                        Les contenus patrimoniaux restent soumis aux droits de leurs auteurs respectifs.
                                        L'utilisation de ces contenus en dehors du Site nécessite l'autorisation
                                        préalable de leurs détenteurs.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Licence d'utilisation :</h4>
                                    <p>
                                        L'éditeur concède aux utilisateurs une licence d'utilisation limitée,
                                        non-exclusive et non-cessible pour la consultation des contenus à des fins
                                        personnelles, éducatives ou de recherche.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Reproductions interdites :</h4>
                                    <p>
                                        Toute reproduction, représentation, diffusion ou exploitation commerciale
                                        du Site ou de ses contenus est interdite sans autorisation écrite préalable.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Responsabilité */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 7 - Responsabilité</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Limitation de responsabilité :</h4>
                                    <p>
                                        L'éditeur s'efforce d'assurer l'exactitude des informations diffusées mais
                                        ne peut garantir leur exhaustivité ou leur mise à jour permanente.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Disponibilité du service :</h4>
                                    <p>
                                        L'éditeur ne peut être tenu responsable des interruptions de service dues
                                        à des maintenances, pannes techniques ou causes indépendantes de sa volonté.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Contenus des utilisateurs :</h4>
                                    <p>
                                        L'éditeur ne peut être tenu responsable des contenus soumis par les utilisateurs,
                                        sous réserve de sa diligence en matière de modération.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Liens externes :</h4>
                                    <p>
                                        L'éditeur décline toute responsabilité concernant les sites internet
                                        accessibles via des liens hypertextes depuis le Site.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sanctions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 8 - Sanctions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    En cas de manquement aux présentes CGU, l'éditeur peut prendre les mesures suivantes :
                                </p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Avertissement de l'utilisateur</li>
                                    <li>Suppression du contenu non-conforme</li>
                                    <li>Suspension temporaire du compte</li>
                                    <li>Résiliation définitive du compte</li>
                                    <li>Exclusion de l'accès au Site</li>
                                </ul>
                                <p>
                                    Ces sanctions peuvent être appliquées sans préavis en cas de manquement grave
                                    ou répété. L'utilisateur concerné peut contester la sanction en écrivant à
                                    contact@saintjacquesinfo.eu.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Données personnelles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 9 - Protection des données personnelles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Le traitement des données personnelles est régi par notre Politique de Confidentialité,
                                    accessible sur le Site et conforme au Règlement Général sur la Protection des Données (RGPD).
                                </p>
                                <p>
                                    En utilisant le Site, l'utilisateur accepte les modalités de traitement de ses
                                    données personnelles telles que décrites dans ladite politique.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Modification des CGU */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 10 - Modification des CGU</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    L'éditeur se réserve le droit de modifier les présentes CGU à tout moment.
                                    Les nouvelles conditions prennent effet dès leur publication sur le Site.
                                </p>
                                <p>
                                    Les utilisateurs sont invités à consulter régulièrement cette page.
                                    L'utilisation continue du Site après modification vaut acceptation des nouvelles CGU.
                                </p>
                                <p>
                                    En cas de modification substantielle, les utilisateurs inscrits seront informés
                                    par email à l'adresse renseignée dans leur profil.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Résiliation */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 11 - Résiliation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Par l'utilisateur :</h4>
                                    <p>
                                        L'utilisateur peut résilier son compte à tout moment via les paramètres
                                        de son profil ou en contactant l'éditeur.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Par l'éditeur :</h4>
                                    <p>
                                        L'éditeur peut résilier un compte en cas de manquement aux CGU,
                                        avec ou sans préavis selon la gravité.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Conséquences :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Suppression de l'accès au compte</li>
                                        <li>Conservation des contributions déjà validées</li>
                                        <li>Suppression des données personnelles selon la politique de confidentialité</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Droit applicable */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 12 - Droit applicable et juridiction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Les présentes CGU sont soumises au droit français. Tout litige relatif
                                    à leur interprétation ou à leur exécution relève de la compétence
                                    exclusive des tribunaux de Toulouse.
                                </p>
                                <p>
                                    Avant toute action judiciaire, les parties s'efforceront de résoudre
                                    leur différend à l'amiable. Une tentative de médiation pourra être
                                    entreprise auprès d'un médiateur agréé.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Article 13 - Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Pour toute question relative aux présentes CGU ou au fonctionnement du Site :
                                </p>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p>
                                        <strong>Institut de Recherche Jacquaire</strong><br />
                                        39 rue du Sergent Bobillot<br/>
                                        37000 Tours<br/>
                                        France<br/>
                                        Email : contact@saintjacquesinfo.eu
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Separator className="my-8" />

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Dernière mise à jour : Août 2025</p>
                            <p className="mt-2">
                                En utilisant ce site, vous acceptez les présentes Conditions Générales d'Utilisation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}