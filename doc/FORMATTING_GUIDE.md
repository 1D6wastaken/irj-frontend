# Guide de formatage du contenu textuel

## Introduction
Le site du Patrimoine Saint-Jacques supporte maintenant plusieurs formats de contenu pour les champs de texte tels que la description, l'histoire, les sources, la bibliographie, etc.

## Formats supportés

### 1. HTML
Vous pouvez utiliser des balises HTML standard pour formater votre contenu :

#### Exemples de balises HTML supportées :

**Titres :**
```html
<h1>Titre principal</h1>
<h2>Sous-titre</h2>
<h3>Section</h3>
```

**Paragraphes et formatage de texte :**
```html
<p>Ceci est un paragraphe normal.</p>
<p>Texte en <strong>gras</strong> ou <b>gras</b></p>
<p>Texte en <em>italique</em> ou <i>italique</i></p>
```

**Listes :**
```html
<ul>
  <li>Premier élément</li>
  <li>Deuxième élément</li>
  <li>Troisième élément</li>
</ul>

<ol>
  <li>Première étape</li>
  <li>Deuxième étape</li>
  <li>Troisième étape</li>
</ol>
```

**Liens :**
```html
<a href="https://example.com">Lien vers une ressource</a>
```

**Citations :**
```html
<blockquote>
  Ceci est une citation importante.
</blockquote>
```

**Code :**
```html
<code>code inline</code>

<pre><code>
Bloc de code
sur plusieurs lignes
</code></pre>
```

**Tableaux :**
```html
<table>
  <tr>
    <th>Colonne 1</th>
    <th>Colonne 2</th>
  </tr>
  <tr>
    <td>Donnée 1</td>
    <td>Donnée 2</td>
  </tr>
</table>
```

---

### 2. Markdown
Vous pouvez également utiliser la syntaxe Markdown, plus simple à écrire :

#### Exemples de syntaxe Markdown :

**Titres :**
```markdown
# Titre niveau 1
## Titre niveau 2
### Titre niveau 3
```

**Formatage de texte :**
```markdown
**Texte en gras**
*Texte en italique*
***Texte en gras et italique***
~~Texte barré~~
```

**Listes :**
```markdown
- Élément de liste à puces
- Autre élément
  - Sous-élément
  
1. Élément numéroté
2. Deuxième élément
3. Troisième élément
```

**Liens :**
```markdown
[Texte du lien](https://example.com)
```

**Images :**
```markdown
![Texte alternatif](url-de-l-image.jpg)
```

**Citations :**
```markdown
> Ceci est une citation
> qui peut s'étendre sur plusieurs lignes
```

**Code :**
```markdown
`code inline`

```
Bloc de code
sur plusieurs lignes
```
```

**Lignes horizontales :**
```markdown
---
```

---

### 3. Texte simple avec codes d'échappement
Si vous n'utilisez ni HTML ni Markdown, vous pouvez utiliser du texte simple avec des codes d'échappement :

**Sauts de ligne :**
```
Première ligne\nDeuxième ligne\nTroisième ligne
```

Sera affiché comme :
```
Première ligne
Deuxième ligne
Troisième ligne
```

**Tabulations :**
```
Colonne 1\tColonne 2\tColonne 3
```

---

## Détection automatique

Le système détecte automatiquement le format que vous utilisez :
1. **HTML** : Si votre contenu contient des balises HTML (`<p>`, `<div>`, etc.)
2. **Markdown** : Si votre contenu contient des marqueurs Markdown (`**`, `#`, `*`, etc.)
3. **Texte simple** : Si aucun des formats ci-dessus n'est détecté

---

## Exemples pratiques

### Exemple 1 : Description d'un monument en HTML
```html
<h2>Église Saint-Jacques</h2>
<p>L'<strong>Église Saint-Jacques</strong> est un monument historique datant du <em>XIIe siècle</em>.</p>
<ul>
  <li>Style roman</li>
  <li>Patrimoine classé</li>
  <li>Ouverte au public</li>
</ul>
```

### Exemple 2 : Histoire en Markdown
```markdown
## Histoire de l'édifice

L'église a été construite en **1150** par les moines cisterciens.

### Événements majeurs :
- 1150 : Construction initiale
- 1789 : Révolution française
- 1950 : Restauration complète

Pour plus d'informations, consultez [le site de la commune](https://example.com).
```

### Exemple 3 : Sources en texte simple
```
Sources principales :\nArchives départementales, série G123\nOuvrage de Jean Dupont, 1995\nEntretien avec le curé, 2020
```

---

## Recommandations

1. **Consistance** : Choisissez un format et restez-y cohérent dans tout votre document
2. **Simplicité** : Utilisez le format le plus simple pour vos besoins
3. **Lisibilité** : Pensez à la lisibilité finale du contenu affiché
4. **Test** : Après avoir soumis votre fiche, vérifiez le rendu dans la page de détails

---

## Support technique

Si vous rencontrez des problèmes avec le formatage :
- Vérifiez la syntaxe de vos balises HTML ou Markdown
- Assurez-vous que les balises HTML sont correctement fermées
- Les liens Markdown doivent ouvrir dans un nouvel onglet automatiquement
- Le contenu est affiché de manière sécurisée (XSS protection)
