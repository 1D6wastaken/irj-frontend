import {ArrowLeft, Mail} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface PrivacyPolicyPageProps {
    onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* En-tête */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Titre principal */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground">Politique de confidentialité</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Protection de vos données personnelles sur le site du Patrimoine Saint-Jacques
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Introduction */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Préambule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    L'Institut de Recherche Jacquaire, éditeur du site saintjacquesinfo.eu,
                                    s'engage à protéger la confidentialité et la sécurité des données personnelles de ses utilisateurs
                                    conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi française
                                    "Informatique et Libertés".
                                </p>
                                <p>
                                    Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons,
                                    stockons et protégeons vos données personnelles lorsque vous utilisez notre site web.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Responsable du traitement */}
                        {/* Éditeur du site */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Responsable du traitement</CardTitle>
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

                        {/* Données collectées */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Données personnelles collectées</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Lors de l'inscription contributeur :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Nom et prénom</li>
                                        <li>Adresse email</li>
                                        <li>Numéro de téléphone (optionnel)</li>
                                        <li>Organisation d'appartenance (optionnel)</li>
                                        <li>Domaine d'expertise</li>
                                        <li>Motivation pour contribuer</li>
                                        <li>Mot de passe chiffré</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Lors de la contribution :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Contenus soumis (textes, images, données patrimoniales)</li>
                                        <li>Métadonnées associées aux contributions</li>
                                        <li>Date et heure des contributions</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Lors de la navigation :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Type de navigateur</li>
                                        <li>Système d'exploitation</li>
                                        <li>Messages d'erreurs</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Finalités du traitement */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Finalités et bases légales du traitement</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Gestion des comptes utilisateurs :</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Base légale : Exécution d'un contrat</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Création et gestion des comptes contributeurs</li>
                                        <li>Authentification et autorisation d'accès</li>
                                        <li>Validation des candidatures</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Préservation du patrimoine :</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Base légale : Intérêt légitime</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Collection et validation des données patrimoniales</li>
                                        <li>Recherche et consultation du patrimoine</li>
                                        <li>Attribution des contributions</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Communication :</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Base légale : Consentement / Intérêt légitime</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Notifications relatives au compte</li>
                                        <li>Information sur les nouveautés du site</li>
                                        <li>Support technique</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Amélioration du service :</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Base légale : Intérêt légitime</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Analyse d'usage et statistiques anonymisées</li>
                                        <li>Amélioration de l'expérience utilisateur</li>
                                        <li>Détection et prévention des abus</li>
                                    </ul>
                                    <br/>
                                    <p className="mb-2">
                                        Pour assurer la disponibilité et la fiabilité de notre site, nous utilisons le service Sentry (Sentry, Inc. San Francisco, USA).<br/>
                                        Les données sont envoyées sur les serveurs localisés en Europe.<br/>
                                        Ce service nous permet de détecter automatiquement les erreurs techniques et de les corriger rapidement.<br/>
                                        Les informations collectées et anonymisées décrites plus haut ne sont utilisées qu’à des fins de diagnostic et ne servent pas à établir de profils utilisateurs ni à des fins publicitaires.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conservation des données */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Durée de conservation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Comptes actifs :</h4>
                                    <p>Les données sont conservées tant que le compte reste actif, puis 3 ans après la dernière connexion.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Contributions validées :</h4>
                                    <p>Les contenus patrimoniaux sont conservés de manière permanente pour des raisons d'intérêt public.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Candidatures rejetées :</h4>
                                    <p>Supprimées immédiatement.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Compte supprimé :</h4>
                                    <p>Lors qu'un utilisateur demande la suppression de son compte, les informations sont automatiquement supprimées.<br/>
                                    Seul le nom et le prénom persiste en base de données si le contributeur a soumis une fiche.<br/>Ces informations sont alors utiliser pour tracer l'auteur de la fiche</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Destinataires */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Destinataires des données</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Personnel autorisé :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Administrateurs du site</li>
                                        <li>Support technique</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Partenaires techniques :</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Hébergeur (OVH SAS) - serveurs situés en France</li>
                                        <li>Service de sauvegarde (données chiffrées)</li>
                                        <li>Sentry - serveurs situés en Europe</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Aucun transfert vers des pays tiers</h4>
                                    <p>Toutes les données sont stockées et traitées au sein de l'Union Européenne.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vos droits */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Vos droits</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                                <div>
                                    <h4 className="font-medium mb-2">Droit d'accès :</h4>
                                    <p>Obtenir une copie des données personnelles vous concernant.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit de rectification :</h4>
                                    <p>Corriger des données inexactes ou incomplètes.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit à l'effacement :</h4>
                                    <p>Demander la suppression de vos données dans certaines conditions.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit à la limitation :</h4>
                                    <p>Limiter le traitement de vos données dans certains cas.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit à la portabilité :</h4>
                                    <p>Récupérer vos données dans un format structuré.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Droit d'opposition :</h4>
                                    <p>S'opposer au traitement pour des raisons légitimes.</p>
                                </div>
                                <p className="mt-4 p-4 bg-muted rounded-lg">
                                    <strong>Pour exercer vos droits :</strong> Contactez-nous à institut.irj@gmail.com
                                    en précisant votre demande et en joignant une copie de votre pièce d'identité.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Cookies */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cookies et technologies similaires</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>Aucun cookie n'est utilisé.</p>
                                <p>Cependant, le site utilise le cache du navigateur (localStorage) afin de : </p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Gérer son cache</li>
                                    <li>Stocker le token de session</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Sécurité */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sécurité des données</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Chiffrement des données sensibles (HTTPS, mots de passe)</li>
                                    <li>Accès restreint aux données personnelles</li>
                                    <li>Sauvegardes régulières et sécurisées</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Réclamations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Réclamations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
                                    auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
                                </p>
                                <p>
                                    CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
                                    Téléphone : 01 53 73 22 22<br />
                                    Site web : <a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a>
                                </p>
                            </CardContent>
                        </Card>

                        <Separator className="my-8" />

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Dernière mise à jour : Août 2025</p>
                            <p className="mt-2">
                                Pour toute question concernant cette politique de confidentialité,
                                contactez-nous à institut.irj@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}