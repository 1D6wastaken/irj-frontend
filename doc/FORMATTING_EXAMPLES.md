# Exemples de formatage testés

Ce fichier contient des exemples de contenu dans différents formats pour tester le composant HtmlContent.

## Exemple 1 : HTML complet

### Input :
```html
<h2>Église Saint-Jacques de Compostelle</h2>
<p>L'<strong>Église Saint-Jacques</strong> est un monument <em>remarquable</em> du patrimoine religieux français.</p>
<h3>Caractéristiques principales</h3>
<ul>
  <li>Style architectural : <strong>Roman</strong></li>
  <li>Période de construction : <em>XIIe siècle</em></li>
  <li>Classement : Monument Historique depuis 1862</li>
</ul>
<p>Pour plus d'informations, consultez <a href="https://patrimoine.example.com">le site officiel</a>.</p>
```

### Output attendu :
Un rendu HTML avec :
- Titre H2 "Église Saint-Jacques de Compostelle"
- Paragraphe avec texte en gras et italique
- Titre H3 "Caractéristiques principales"
- Liste à puces avec formatage
- Lien cliquable

---

## Exemple 2 : Markdown

### Input :
```markdown
# Histoire du monument

## Période médiévale

L'église a été fondée en **1150** par les moines cisterciens. Elle représente un exemple *typique* de l'architecture romane.

### Événements marquants :

- 1150 : Construction initiale
- 1250 : Ajout du clocher
- 1789 : Confiscation pendant la Révolution
- 1862 : Classement aux Monuments Historiques

## Sources et références

Pour plus de détails, voir [Archives Départementales](https://archives.example.com).

> "Cette église représente l'un des joyaux de notre patrimoine local"
> - Jean Dupont, historien

### Bibliographie :

1. Dupont, J. (1995). *Les églises romanes de France*
2. Martin, P. (2010). **Histoire du patrimoine religieux**
```

### Output attendu :
Un rendu Markdown avec :
- Titres de différents niveaux (H1, H2, H3)
- Texte en gras et italique
- Listes à puces et numérotées
- Lien hypertexte (ouvrant dans un nouvel onglet)
- Citation (blockquote)

---

## Exemple 3 : Texte simple avec codes d'échappement

### Input :
```
Description du mobilier\n\nStatue de Saint-Jacques en bois polychrome\nHauteur : 1,20 m\nÉpoque : XVIIe siècle\n\nÉtat de conservation :\nBon état général\nRestauration effectuée en 2015\n\nLocalisation :\nNef principale, chapelle latérale nord
```

### Output attendu :
Texte avec sauts de ligne interprétés :
```
Description du mobilier

Statue de Saint-Jacques en bois polychrome
Hauteur : 1,20 m
Époque : XVIIe siècle

État de conservation :
Bon état général
Restauration effectuée en 2015

Localisation :
Nef principale, chapelle latérale nord
```

---

## Exemple 4 : HTML avec tableaux

### Input :
```html
<h3>Dimensions de l'édifice</h3>
<table>
  <thead>
    <tr>
      <th>Élément</th>
      <th>Dimension</th>
      <th>Remarque</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Longueur de la nef</td>
      <td>45 mètres</td>
      <td>Mesure intérieure</td>
    </tr>
    <tr>
      <td>Largeur</td>
      <td>12 mètres</td>
      <td>Nef principale uniquement</td>
    </tr>
    <tr>
      <td>Hauteur sous voûte</td>
      <td>18 mètres</td>
      <td>Point culminant</td>
    </tr>
  </tbody>
</table>
```

### Output attendu :
Tableau HTML stylé avec bordures et fond pour l'en-tête

---

## Exemple 5 : Markdown avec code

### Input :
```markdown
## Inscription relevée

L'inscription gravée sur le socle indique :

```
HIC JACET
SANCTUS JACOBUS
MCXL
```

Le texte signifie "Ici repose Saint Jacques, 1140" en latin.

La technique de gravure utilisée est du type `incision profonde` typique de cette période.
```

### Output attendu :
- Titre H2
- Paragraphe de texte
- Bloc de code formaté (avec fond gris)
- Paragraphe explicatif
- Code inline (avec fond gris)

---

## Exemple 6 : Mélange de codes d'échappement

### Input :
```
Sources bibliographiques :\n\n1. Archives municipales de Saint-Jacques\n\tSérie G, liasse 234\n\tDates : 1150-1200\n\n2. Bibliothèque nationale\n\tManuscrit latin 5678\n\tConsulté le 15/03/2024\n\n3. Ouvrage de référence :\n\tDupont, Jean. "Les chemins de Saint-Jacques".\n\tParis : Éditions du Patrimoine, 1995.
```

### Output attendu :
Texte avec sauts de ligne (\n) et tabulations (\t) correctement interprétés

---

## Test de détection automatique

Le composant HtmlContent détecte automatiquement le format :

| Contenu | Format détecté | Raison |
|---------|----------------|--------|
| `<p>Texte</p>` | HTML | Présence de balises `<>` |
| `**Texte**` | Markdown | Présence de `**` |
| `# Titre` | Markdown | Présence de `#` suivi d'espace |
| `Texte\nTexte` | Texte simple | Aucun marqueur HTML ou Markdown |
| `[Lien](url)` | Markdown | Syntaxe de lien Markdown |
| `<ul><li>Item</li></ul>` | HTML | Balises de liste HTML |

---

## Notes importantes

1. **Priorité de détection** : HTML > Markdown > Texte simple
2. **Sécurité** : Le HTML est inséré via `dangerouslySetInnerHTML` (attention au contenu non fiable)
3. **Liens Markdown** : Ouvrent automatiquement dans un nouvel onglet (`target="_blank"`)
4. **Styles CSS** : Tous les formats utilisent la classe `.html-content` pour un rendu cohérent
5. **Performance** : Utilisation de `useMemo` pour éviter le retraitement inutile
