# Thème pour les sites d’unité Les Scouts

[Les Scouts asbl](https://lesscouts.be/) propose ce thème à l’usage de ses membres pour créer le site de leur unité scoute.

Dans ce dépôt, tu trouveras :

- des feuilles de styles CSS reposant sur [Bootstrap](https://getbootstrap.com/) qui intègrent la charte graphique des Scouts
- les polices recommandées
- nos logos et images d’illustration

## Ton avis nous intéresse !

Tu as pu découvrir et peut-être déjà essayer le template pour ton site d’unité. 
Cette première mouture s’adresse aux plus bricoleurs, c’est-à-dire la plupart des personnes qui s’occupent déjà 
du site web d’unité. L’outil répond-il au besoin ? Faut-il aller plus loin ? Dis-le nous ci-dessous.

➡ [Répondre au sondage](https://forms.office.com/r/tQjKg3Tep2) ⬅

## Documentation

Pour savoir comment télécharger le template, l’ajouter à ton site et contribuer, continue la lecture ci-dessous.

Si tu veux voir les possibilités offertes par le template et les exemples, 
[consulte la documentation](https://template.lesscouts.be/).

## Qu’y a-t-il là-dedans ?

Les dossiers sont organisés comme suit :

| Dossier         | Description                                                                         |
|-----------------|-------------------------------------------------------------------------------------|
| `css`           | Feuilles de styles CSS compilées à partir des feuilles de styles du dossier `scss`. |
| `documentation` | Code source de la [documentation du template](https://template.lesscouts.be/))      |
| `exemples`      | Quelques exemples de mise en œuvre du template                                      |
| `fonts`         | Fichiers des polices utilisées par le template                                      |
| `images`        | Logos et images d’illustration                                                      |
| `scss`          | Feuilles de styles CSS originales au format LESS                                    |

Dans le dossier `css/`, le fichier `base.css` est un fichier compilé qui contient :

- le code CSS de Bootstrap v1.5.3.
- le code CSS du template Les Scouts

### Pas de Javascript dans le template ?

Nous n’avons pas inclus le code Javascript de Bootstrap car le template Les Scouts n’ajoute aucune 
fonctionnalité Javascript. Nous te conseillons donc de charger le code JS de Bootstrap directement depuis un CDN
(voir les exemples ou la section _Comment démarrer_ ci-dessous).

## Comment démarrer

### Télécharger le template

Plusieurs options de téléchargement sont possibles :

- [télécharge le fichier zip](https://github.com/lesscouts/template-unite/releases/) de la version la plus récente du template
- installe le template dans ton projet avec [composer](https://getcomposer.org/) : `composer require lesscouts/template-unite`
- installe le template dans ton projet avec [npm](https://www.npmjs.com/) : `npm add @lesscouts/template-unite`
- installe le template dans ton projet avec [yarn](https://yarnpkg.com/) : `yarn add @lesscouts/template-unite`
- clone le dépôt git : `git clone https://github.com/lesscouts/template-unite.git`

👉 La méthode la plus simple est de télécharger le fichier zip.

### Installer le template pour Wordpress, Drupal, …

Nous n’avons pas encore prévu de thème clé sur porte pour les CMS grand public.

Si tu prépares un site avec une plateforme comme Wordpress, Drupal ou un autre CMS, n’hésite pas à partager ta méthode 
d’intégration pour aider les autres unités (voir la section « Contribuer au projet » ci-dessous).

### Installer le template pour un site statique

Si tu as téléchargé le fichier zip, décompresse-le dans un dossier dédié, par exemple `template/` à la racine de ton site.

👍 Ne mélange pas les fichiers de ton site et ceux du template. Ça t’évitera de perdre des cheveux plus tard si tu veux
mettre à jour le template.

### Créer ta première page web

Pour démarrer, recopie un exemple de page (voir le dossier `exemples/` pour les sources 
ou sur https://template.lesscouts.be/) et mets-le à ta sauce ou pars d’une page blanche en recopiant ce squelette HTML :

```html
<!DOCTYPE html>
<html lang="fr-BE">
<head>
    <meta charset="UTF-8">
    <title>Squelette minimaliste d’une page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Ci-dessous, le lien vers la feuille CSS de base du template Les Scouts -->
    <link href="template/css/base.css" rel="stylesheet">
    
    <!-- Si tu veux utiliser les icônes de Bootstrap, laisse la ligne ci-dessous. Elles sont utilisées dans les exemples -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    
    <!-- Ajoute ensuite ci-dessous la feuille de styles CSS que tu vas utiliser pour personnaliser le template pour ton site -->
    
</head>
<body>
    <!-- Ici, c’est à toi de jouer. Fais preuve de créativité ou inspire-toi des exemples fournis avec le template -->
    
    
    
    <!-- 
    Et tout en bas du corps de la page, ajoute le code Javascript de Bootstrap 
    pour bénéficier des composants animés (menus déroulants, accordéons, …) 
    -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
</body>
</html>
```

👉 Si tu souhaites créer tes propres classes CSS, crée ton propre fichier CSS 
et ajoute-le après la déclaration du template Les Scouts. Ceci étendra les paramétrages du template Les Scouts sans toucher
au code. C’est une bonne pratique pour faciliter le suivi des mises à jour du template.

### Aller plus loin

Si tu as l’esprit joueur ou les compétences pour le faire, tu peux aussi étendre le fichier SCSS du template et le compiler
toi-même dans un unique fichier CSS. 

Regarde la section _Compiler le SCSS en CSS_ plus bas pour en savoir plus.

## Contribuer au projet

Le template est une source d’inspiration pour toutes les unités de la fédération. Toi aussi tu peux contribuer au projet :

- [signale les bugs](https://github.com/lesscouts/template-unite/issues/)
- [propose tes améliorations, améliore la documentation, …](https://github.com/lesscouts/template-unite/pulls/)
- si tu découvres une faille de sécurité, [préviens-nous](SECURITY.md)

## Compiler le SCSS en CSS

Cette section est destinée aux utilisateurs avancés qui ne se contentent pas du fichier CSS fourni avec le template.

Tu ne dois compiler le template que si tu contribues au code du template ou si tu veux rassembler Bootstrap, le template 
Les Scouts et ton code CSS dans un même fichier CSS.

Pour cela, tu auras besoin d’installer [Node.js](https://nodejs.org/en/download/) et 
[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

**Installer les dépendances**

```bash
$ npm install
```

Cette commande installe Bootstrap ainsi que [SASS](https://sass-lang.com/), qui compile les feuilles de styles.

**Compiler les fichiers en CSS**

Le fichier `package.json` contient deux scripts pour compiler tous les fichiers du dossier `scss` et produire 
leur équivalent en CSS dans le dossier `css`. 

Pour la production (source compressée) :

```bash
$ npm run compile-prod
```

Pour le développement (source non compressée et source map pour le débogage) :

```bash
$ npm run compile-dev
```

### En savoir plus

Différents outils permettent de compiler les sources SCSS en CSS. 
Tu trouveras plus d’infos sur les sites suivants (en anglais) : 

- [Documentation du langage SASS](https://sass-lang.com/)
- [Comment personnaliser Bootstrap](https://getbootstrap.com/docs/5.1/customize/overview/)

# Licences

Le **code CSS et la documentation du template** sont diffusés sous [licence MIT](LICENSE.md).

Les **photos d’illustration** présentes dans le template sont la propriété de la fédération Les Scouts asbl 
et ne peuvent pas être utilisées, diffusées ou modifiées sans autorisation préalable 
de la fédération Les Scouts asbl.

Les **logos Les Scouts, les logos des branches et les illustrations** sont la propriété de la fédération
Les Scouts asbl et peuvent uniquement être utilisés par ses membres.

Les composants du template fournis par des tiers sont distribués selon leurs licences respectives présentées ci-dessous. 

## Bootstrap 

[Bootstrap](https://getbootstrap.com/) et les [icônes Bootstrap](https://icons.getbootstrap.com/) sont publiés sous 
[licence MIT](https://github.com/twbs/bootstrap/blob/main/LICENSE) 
et la documentation de Bootstrap est publiée sous 
[licence Creative Commons](https://creativecommons.org/licenses/by/3.0/).

## Polices

- **[Caveat Brush](https://fonts.google.com/specimen/Caveat+Brush)**, par Impallari Type, 
  sous [licence Open Font](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL)
- **[Housepaint](https://fr.ffonts.net/HousePaint12.font)**, par NicholasJudy456, gratuite pour un usage non commercial 
- **[Mali](https://fonts.google.com/specimen/Mali)**, par Cadson Demak, 
  sous [licence Open Font](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL)
- **[Muli](https://www.cufonfonts.com/font/muli)**, par Vernon Adams, 
  sous [licence Open Font](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL).
- **[RobotoMono](https://fonts.google.com/specimen/Roboto+Mono)**, par Christian Robertson, 
 sous [licence Apache v2.0](http://www.apache.org/licenses/LICENSE-2.0)
