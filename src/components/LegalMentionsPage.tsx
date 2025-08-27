import {ArrowLeft, Mail} from "lucide-react";
import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Separator} from "./ui/separator";

interface LegalMentionsPageProps {
    onBack: () => void;
}

export function LegalMentionsPage({onBack}: LegalMentionsPageProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* En-tête */}
            <div
                className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2 hover:bg-accent/50"
                        >
                            <ArrowLeft className="w-4 h-4"/>
                            Retour
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Titre principal */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground">Mentions légales</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Informations légales concernant le site du Patrimoine Saint-Jacques
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Éditeur du site */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Éditeur du site</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Nom de l'organisme :</h4>
                                    <p>Institut de Recherche Jacquaire</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Adresse :</h4>
                                    <p>
                                        39 rue du Sergent Bobillot<br/>
                                        37000 Tours<br/>
                                        France
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Site Web :</h4>
                                    <a href="https://www.institut-irj.fr/" target="_blank" rel="noopener noreferrer"
                                       className="text-blue-500 hover:underline">
                                        www.institut-irj.fr
                                    </a>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Contact :</h4>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5"/>
                                        <a href="mailto:institut.irj@gmail.com"
                                           className="text-sm md:text-base">institut.irj@gmail.com</a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hébergeur */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hébergeur</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Nom :</h4>
                                    <p>
                                        OVH SAS<br/>
                                        Capital de 50 000 000,00 €
                                    </p>
                                    <p>
                                        RCS Lille Métropole 424 761 419 00045<br/>
                                        Code APE 2620Z<br/>
                                        N° TVA : FR 22 424 761 419
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Adresse :</h4>
                                    <p>
                                        2 rue Kellermann<br/>
                                        59100 Roubaix<br/>
                                        France
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Développement */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Développement</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Nom :</h4>
                                    <p>
                                        Benoit Maret - 1D6<br/>
                                        Siren: 97982315000029
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Outils</h4>
                                    <p>
                                        React - TypeScript - Tailwind CSS - Figma - Github
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Propriété intellectuelle */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Conditions d'utilisation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Ce site est proposé en différents langages web.
                                </p>
                                <p>
                                    Pour un meilleur confort d'utilisation et un graphisme plus agréable, nous vous
                                    recommandons de recourir à des navigateurs mordernes.
                                </p>
                                <p>
                                    L’Institut de Recherche Jacquaire met en œuvre tous les moyens dont elle dispose,
                                    pour assurer une information fiable et une mise à jour fiable du site internet.
                                    Toutefois, des erreurs ou omissions peuvent survenir. L’internaute devra donc
                                    s’assurer de l’exactitude des informations auprès de l’Institut de Recherche
                                    Jacquaire, et signaler toutes modifications du site qu’il jugerait utile. L’Institut
                                    de Recherche Jacquaire n’est en aucun cas responsable de l’utilisation faite de ces
                                    informations, et de tout préjudice direct ou indirect pouvant en découler.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Responsabilité */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Responsabilité</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Les informations contenues sur ce site sont aussi précises que possible et le site
                                    est
                                    périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des
                                    omissions
                                    ou des lacunes.
                                </p>
                                <p>
                                    Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement,
                                    merci de
                                    bien vouloir le signaler par email à institut.irj@gmail.com, en
                                    décrivant le
                                    problème de la manière la plus précise possible.
                                </p>
                                <p>
                                    Tout contenu téléchargé se fait aux risques et périls de l'utilisateur et sous sa
                                    seule
                                    responsabilité. En conséquence, l'éditeur ne saurait être tenu responsable d'un
                                    quelconque
                                    dommage subi par l'ordinateur de l'utilisateur ou d'une quelconque perte de données
                                    consécutives au téléchargement.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Liens hypertextes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Liens hypertextes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Les sites internet pouvant être consultés depuis les liens hypertextes figurant sur
                                    le site
                                    n'engagent pas la responsabilité de l'éditeur qui ne contrôle pas ces liens.
                                </p>
                                <p>
                                    L'éditeur autorise la mise en place de liens hypertextes vers toute page de ce site,
                                    à condition
                                    que ceux-ci ouvrent une nouvelle fenêtre et soient présentés de manière
                                    non-équivoque afin
                                    d'éviter tout risque de confusion entre le site citant et le site cité.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Droit applicable */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Droit applicable et juridiction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Les présentes mentions légales sont soumises au droit français. En cas de litige, et
                                    à défaut
                                    de résolution amiable, les tribunaux français seront seuls compétents.
                                </p>
                                <p>
                                    Pour toute question relative aux présentes mentions légales, vous pouvez nous
                                    contacter à
                                    l'adresse institut.irj@gmail.com.
                                </p>
                            </CardContent>
                        </Card>

                        <Separator className="my-8"/>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Dernière mise à jour : Août 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}