# Site d’unité avec interface d’administration

Ce dépôt contient un site d’unité **prêt à l’emploi**, avec deux parties :

- le **site public**, qui reprend la charte graphique Les Scouts et s’affiche
  correctement sur téléphone comme sur ordinateur ;
- une **interface d’administration** à l’adresse `/admin`, où l’on modifie les
  textes, l’agenda et les photos en remplissant des formulaires, sans écrire
  une ligne de code.

Le site est **statique** : il n’y a pas de base de données ni de serveur à
maintenir. Rien à mettre à jour tous les mois, et presque rien à pirater.

## Sommaire

- [Ce que l’administrateur peut modifier](#ce-que-ladministrateur-peut-modifier)
- [Mise en ligne, étape par étape](#mise-en-ligne-étape-par-étape)
- [Ajouter ou retirer un administrateur](#ajouter-ou-retirer-un-administrateur)
- [Faire fonctionner le formulaire de contact](#faire-fonctionner-le-formulaire-de-contact)
- [Ajouter des onglets au menu](#ajouter-des-onglets-au-menu)
- [Travailler sur le site depuis son ordinateur](#travailler-sur-le-site-depuis-son-ordinateur)
- [Mettre un mot de passe sur l’administration](#mettre-un-mot-de-passe-sur-ladministration)
- [Où vont les contenus sur un serveur](#où-vont-les-contenus-sur-un-serveur)
- [Héberger l’administration sur un serveur](#héberger-ladministration-sur-un-serveur)
- [Passer le relais au prochain webmaster](#passer-le-relais-au-prochain-webmaster)
- [Comment c’est rangé](#comment-cest-rangé)
- [Repartir de zéro](#repartir-de-zéro)

## Ce que l’administrateur peut modifier

Depuis `/admin`, sans connaissances techniques :

| Rubrique             | Ce qu’on y fait                                                                    |
|----------------------|------------------------------------------------------------------------------------|
| **Actualités**       | Écrire une nouvelle, avec une photo. Les 3 dernières vont sur la page d’accueil.    |
| **Agenda**           | Annoncer une activité (date, heure, lieu, section).                                |
| **Galeries photos**  | Créer un album et y déposer des photos en les faisant glisser.                     |
| **Réglages du site** | Logo, nom de l’unité, présentation, coordonnées, sections, pied de page, couleurs. |

Trois choses se font toutes seules, sans intervention :

- chaque écran d’édition affiche à droite un **aperçu du site**, mis à jour au fur
  et à mesure de la frappe : on voit le résultat avant d’enregistrer ;
- une activité dont la date est passée **bascule automatiquement** dans
  « activités passées » ;
- le site est **reconstruit et publié** dans la minute qui suit chaque
  modification.

### Le logo de l’unité

Dans *Réglages du site*, le champ **Logo de l’unité** remplace le logo affiché en
haut à gauche de chaque page. Laissé vide, c’est celui de la fédération qui
s’affiche.

Le logo est encadré automatiquement en hauteur, donc il ne déforme pas la barre
de navigation et reste lisible sur téléphone, quelles que soient les dimensions
du fichier envoyé. Un PNG à fond transparent, plus large que haut, donne le
meilleur résultat.

Le logo de la fédération reste présent en pied de page : l’unité en est membre.

## Mise en ligne, étape par étape

À faire **une seule fois**, par quelqu’un d’un peu à l’aise avec l’informatique.
Compte une petite heure la première fois.

### 1. Mettre le site sur GitHub

1. Crée un compte gratuit sur [github.com](https://github.com/) si tu n’en as pas.
2. Crée une **copie du dépôt du template** dans ton compte (bouton « Fork » sur
   [github.com/lesscouts/template-unite](https://github.com/lesscouts/template-unite)),
   ou crée un nouveau dépôt et copies-y les fichiers.
3. Note le nom complet de ton dépôt, sous la forme `mon-compte/mon-depot`.

### 2. Indiquer ton dépôt à l’administration

Ouvre le fichier `src/admin/config.yml` et remplace la ligne :

```yaml
  repo: mon-unite/mon-site
```

par le nom de ton dépôt. **C’est la seule ligne à modifier** dans ce fichier.

### 3. Publier le site

Le site peut être hébergé gratuitement. Les deux services ci-dessous
reconstruisent le site automatiquement à chaque modification.

**Avec Cloudflare Pages** (recommandé)

1. Crée un compte sur [pages.cloudflare.com](https://pages.cloudflare.com/).
2. « Create a project » → connecte ton dépôt GitHub.
3. Renseigne exactement :
   - Framework preset : `None`
   - Build command : `npm run build`
   - Build output directory : `_site`
4. « Save and Deploy ».

   Laisse « Root directory » vide : le site est à la racine du dépôt.

**Avec Netlify**

1. Crée un compte sur [netlify.com](https://www.netlify.com/).
2. « Add new site » → « Import an existing project » → ton dépôt GitHub.
3. « Deploy ».

Il n’y a rien à saisir : la commande de construction et le dossier à publier sont
déjà décrits dans le fichier `netlify.toml`, à la racine du dépôt.

### 4. Permettre la connexion à `/admin`

L’administration doit vérifier que la personne qui se connecte a le droit de
modifier le site. Trois méthodes, de la plus confortable pour des animateurs à la
plus rapide à mettre en place.

> ⚠ Beaucoup de tutoriels encore en ligne conseillent **Netlify Identity** ou
> **Git Gateway de Netlify**. Les deux sont désormais dépréciés : ils
> fonctionnent pour les sites déjà configurés, mais ne sont plus recommandés pour
> un nouveau site et leurs bugs ne sont plus corrigés. Ne partons pas là-dessus.

**Méthode A — adresse email et mot de passe (recommandé pour une unité)**

C’est la méthode qui demande le moins aux animateurs : **aucun compte GitHub à
créer**. Ils reçoivent une invitation par email et choisissent leur mot de passe.

Elle repose sur [DecapBridge](https://decapbridge.com/), un service gratuit
jusqu’à 3 sites et 10 collaborateurs par site — largement de quoi couvrir une
unité.

1. Crée un compte sur [decapbridge.com](https://decapbridge.com/) et déclare ton
   site en le reliant à ton dépôt GitHub.
2. DecapBridge te donne un bloc `backend` à recopier dans `config.yml`. Il a
   cette forme, avec l’identifiant de ton site :

   ```yaml
   backend:
     name: git-gateway
     repo: mon-compte/mon-depot
     branch: main
     identity_url: https://auth.decapbridge.com/sites/identifiant-de-mon-site
     gateway_url: https://gateway.decapbridge.com
   ```

   Utilise le bloc généré par DecapBridge plutôt que celui-ci : c’est lui qui
   contient le bon identifiant.
3. Invite les animateurs par email depuis DecapBridge.

Ce que ça implique : un service externe de plus dans la chaîne. Le risque reste
faible, parce que **les contenus ne sont pas chez eux** — ils restent dans ton
dépôt, en fichiers texte. Si le service ferme, on repasse aux méthodes B ou C en
changeant ces quelques lignes, sans rien perdre.

À noter : cette méthode fonctionne avec Decap CMS uniquement. Sveltia CMS ne
prend pas en charge `git-gateway`.

**Méthode B — bouton « Se connecter avec GitHub »**

Chaque animateur a un compte GitHub et clique sur un bouton. Il faut déployer un
petit intermédiaire d’authentification gratuit sur Cloudflare Workers
(une dizaine de minutes) :
[decap-proxy](https://github.com/sterlingwes/decap-proxy) pour Decap CMS, ou
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) si tu es passé à
Sveltia. Ajoute ensuite son adresse dans `config.yml` :

```yaml
backend:
  name: github
  repo: mon-compte/mon-depot
  branch: main
  base_url: https://adresse-de-mon-intermediaire.workers.dev
```

**Méthode C — un jeton personnel (pour tester rapidement)**

1. Sur GitHub : *Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token*.
2. Donne-lui accès **uniquement au dépôt du site**, permission
   *Contents : Read and write*.
3. Sur `/admin`, choisis la connexion par jeton et colle-le.

Immédiat, mais chaque personne doit générer et conserver son jeton. Bien pour un
essai, peu pratique dans le temps.

## Choisir son interface d’administration

Le site est livré avec **Decap CMS**, dont l’interface est **en français**. C’est
le choix par défaut, parce que la demande était de permettre à un animateur de
modifier le site sans connaissances techniques.

Il existe une alternative, **Sveltia CMS** : plus moderne, nettement plus
agréable pour déposer des photos et bien meilleure sur téléphone, mais son
interface n’est **disponible qu’en anglais** (18 langues sont proposées, pas le
français). Les libellés des champs que tu vois dans les formulaires — « Titre »,
« Date de fin », « Section concernée »… — restent en français dans les deux cas,
car ils viennent de `config.yml` : seuls les boutons et menus de l’outil
changent de langue.

Les deux lisent **exactement le même `config.yml`**. Pour passer de l’un à
l’autre, il suffit de remplacer une ligne dans `src/admin/index.html` :

```html
<!-- interface en français -->
<script src="https://unpkg.com/decap-cms@3.15.1/dist/decap-cms.js"></script>

<!-- ou interface en anglais, plus moderne et plus adaptée au téléphone -->
<script src="https://unpkg.com/@sveltia/cms@0.185.0/dist/sveltia-cms.js"></script>
```

Si l’unité poste souvent des photos depuis un téléphone, Sveltia vaut l’essai
malgré l’anglais. Sveltia accepte les traductions proposées par sa communauté :
contribuer la version française serait utile à toutes les unités.

## Ajouter ou retirer un administrateur

Chaque administrateur a besoin d’un compte GitHub gratuit, puis d’être ajouté au
dépôt : *Settings → Collaborators → Add people*, avec le rôle **Write**.

Pour retirer quelqu’un (fin de mandat, départ de l’unité), retire-le de cette
même liste. Il perd immédiatement l’accès à `/admin`.

> C’est le seul vrai inconvénient de cette solution : un compte GitHub à créer
> une fois par personne. En échange, il n’y a aucun mot de passe à gérer dans le
> site, aucune mise à jour de sécurité à suivre, et l’historique des
> modifications est conservé — on peut revenir en arrière si quelqu’un se trompe.

## Ajouter des onglets au menu

*Réglages du site → Onglets supplémentaires du menu.*

Pour pointer vers la page Facebook de l’unité, un formulaire d’inscription
hébergé ailleurs, le site de la fédération… Ces onglets s’ajoutent après ceux du
site, dans l’ordre de la liste.

Coche « Ouvrir dans un nouvel onglet » pour un site extérieur : le visiteur ne
perd pas le site de l’unité. Une petite flèche signale alors le lien, et les
lecteurs d’écran annoncent l’ouverture d’un nouvel onglet.

Une adresse interne fonctionne aussi (`/galeries/` par exemple), sans cocher la
case.

## Faire fonctionner le formulaire de contact

*Réglages du site → Formulaire de contact.*

Un site statique ne peut pas envoyer d’email par lui-même : il n’y a pas de
serveur pour traiter l’envoi. Tant que rien n’est configuré, la page Contact
affiche simplement l’adresse email de l’unité — rien n’est cassé.

Quatre possibilités, dans la liste déroulante :

| Choix | Ce qu’il faut faire | Où arrivent les réponses |
|---|---|---|
| **Pas de formulaire** | rien | par email, écrit directement par le visiteur |
| **Formulaire Framaforms ou Google Forms** | coller l’adresse du formulaire | dans l’outil où tu l’as créé |
| **Service d’envoi** (Formspree…) | créer un compte, coller l’adresse fournie | dans ta boîte mail |
| **Netlify Forms** | rien, si le site est hébergé chez Netlify | dans l’interface Netlify |

### Afficher un formulaire Framaforms ou Google Forms

C’est le plus simple, et souvent le plus pratique pour une unité : tu crées le
formulaire dans un outil que tu connais, tu colles son adresse, et il s’affiche
dans la page. Les réponses restent dans cet outil, dans un tableau — pas besoin
de compte supplémentaire ni de boîte mail qui déborde.

Colle l’adresse telle qu’elle apparaît dans la barre du navigateur. Pour Google
Forms, le paramètre technique nécessaire à l’affichage est ajouté
automatiquement.

Si une barre de défilement apparaît à l’intérieur du cadre, augmente le champ
« Hauteur du formulaire affiché ».

> **Un mot sur les données.** Un formulaire d’unité recueille souvent des
> informations sur des enfants. [Framaforms](https://framaforms.org/) est un
> service associatif français, hébergé en Europe et sans traçage publicitaire :
> il est préférable à Google Forms pour ce type de données. Pense aussi à
> indiquer sur le formulaire à quoi servent les informations demandées.

## Travailler sur le site depuis son ordinateur

Utile pour prévisualiser avant publication, ou pour modifier l’apparence.

```bash
npm install     # une seule fois
npm start       # ouvre le site sur http://localhost:8080
```

Le site se recharge tout seul à chaque modification. `npm run build` produit la
version finale dans `_site/`.

Il faut [Node.js](https://nodejs.org/) installé.

### Avec Docker, sans installer Node

Si tu préfères ne rien installer sur ta machine :

```bash
docker compose up
```

- le site : <http://localhost:8080/>
- l’administration : <http://localhost:8080/admin/>

Un seul port, pour le site comme pour l’administration.

Les fichiers du dépôt sont montés dans le conteneur : ce que tu modifies depuis
`/admin` est écrit directement sur ta machine, et le site se reconstruit tout
seul. Les fichiers créés t’appartiennent — pas à `root` — grâce au `user:` défini
dans `docker-compose.yaml`.

`docker compose down` arrête tout.

**Pour héberger le site soi-même**, l’image de production ne contient que le site
construit, servi par nginx (environ 67 Mo, ni Node ni sources) :

```bash
docker build -t site-unite .
docker run -p 8080:80 site-unite
```

Ce n’est utile que pour un hébergement sur ton propre serveur. Pour Cloudflare
Pages ou Netlify, qui sont gratuits, Docker n’a pas d’intérêt.

### Essayer l’administration sans rien mettre en ligne

Tu peux utiliser `/admin` sur ton ordinateur, **sans compte GitHub ni service
externe** :

```bash
npm run dev
```

Cette commande lance les deux processus nécessaires : le site et le pont qui
permet à l’administration d’écrire dans les fichiers. **Tout est servi sur le
port 8080**, y compris l’API de l’administration : le pont n’écoute que sur la
machine locale. Si l’un des deux processus s’arrête, l’autre est arrêté aussi —
mieux vaut un échec visible qu’une administration à moitié fonctionnelle.

Ouvre ensuite <http://localhost:8080/admin/> et clique « Se connecter ».
L’interface modifie **directement les fichiers du dossier** : tu vois le résultat
en direct sur le site, et tu peux annuler avec `git checkout` après des essais.

`npm start` (le site seul) et `npm run admin` (le pont seul) restent disponibles
si tu veux les lancer séparément.

C’est le réglage `local_backend: true` de `config.yml` qui autorise ce mode.

## Mettre un mot de passe sur l’administration

⚠ **Sans mot de passe, cette configuration n’en a aucun** : n’importe qui capable
d’atteindre `/admin` peut modifier le site et déposer des fichiers sur le
serveur. Acceptable sur ton propre ordinateur, jamais sur une machine accessible
par d’autres.

```bash
ADMIN_MOT_DE_PASSE='choisis-un-mot-de-passe' docker compose up
```

C’est tout. Le site reste public ; `/admin` **et son API d’écriture** demandent
alors un identifiant (`admin` par défaut, modifiable avec `ADMIN_UTILISATEUR`).

Le mot de passe se donne au lancement, ou dans un fichier `.env` à côté de
`docker-compose.yaml` — ce fichier n’est pas versionné.

> **Pourquoi pas dans `config.yml` ?** Parce que ce fichier est servi
> publiquement, comme le reste du site : essaie
> `curl https://ton-site/admin/config.yml`. Un mot de passe écrit dedans serait
> lisible par tout le monde, et se retrouverait en plus dans l’historique du
> dépôt. Plus généralement, aucune protection écrite dans le site lui-même n’en
> est une : le code s’exécute dans le navigateur du visiteur, qui peut le
> contourner. C’est le serveur qui doit refuser la requête, et c’est ce que fait
> le réglage ci-dessus.

Et surtout : la protection couvre **aussi** `/api/v1`. Protéger seulement la page
ne servirait à rien, puisque c’est cette adresse qui écrit dans les fichiers et
qu’elle est appelable directement.

## Où vont les contenus sur un serveur

Quand le site tourne dans Docker, l’administration n’écrit **pas** dans le dépôt
git, mais dans un dossier `donnees/` à côté :

```
donnees/
├── contenus/    actualités, agenda, galeries
├── medias/      photos envoyées depuis /admin
└── reglages/    unite.json
```

Sans cela, chaque modification faite depuis `/admin` apparaîtrait comme une
modification locale du dépôt, et `git pull` refuserait de s’appliquer sur le
serveur. Là, tu mets le code à jour sans jamais toucher aux contenus :

```bash
git pull && docker compose up -d --build
```

Ce dossier n’est pas versionné. **C’est lui qu’il faut sauvegarder** : il contient
tout le travail de l’unité, et une simple copie du dossier suffit.

Au premier démarrage il est rempli avec les contenus d’exemple, puis plus jamais
touché. Pour repartir de zéro, vide-le et redémarre.

> Ce fonctionnement ne concerne que Docker. En hébergement gratuit (Cloudflare
> Pages, Netlify), les contenus vivent dans le dépôt git et se modifient via
> GitHub — c’est ce qui donne l’historique et la possibilité de revenir en
> arrière.

## Héberger l’administration sur un serveur

Une condition reste, et elle ne vient pas du projet mais du navigateur.

**Le site doit être servi en HTTPS.** Les navigateurs réservent certaines
fonctions de sécurité — dont `crypto.randomUUID`, dont l’administration a besoin
— aux « contextes sécurisés » : HTTPS, `localhost` ou `127.0.0.1`. En HTTP sur une
adresse IP, l’administration s’arrête sur **« Error loading the CMS
configuration »**, quels que soient tes autres réglages. Le site public, lui,
fonctionne très bien en HTTP : seule l’administration est concernée.

Le plus simple est un reverse proxy qui s’occupe du certificat, par exemple
[Caddy](https://caddyserver.com/), qui en génère un tout seul.

C’est aussi ce qui rend le mot de passe sérieux : en HTTP, il circule en clair
sur le réseau.

Il n’y a **rien d’autre à configurer** : l’administration déduit l’adresse de son
API de celle de la page, donc aucun nom de machine ni port à écrire nulle part.
Elle fonctionne telle quelle sur un ordinateur, sur un serveur du réseau, ou
derrière un nom de domaine.

**Sans HTTPS, une alternative : le tunnel SSH.** Si tu veux simplement éditer,
depuis ton ordinateur, un site qui tourne sur un serveur :

```bash
ssh -L 8080:localhost:8080 utilisateur@adresse-du-serveur
```

Puis ouvre <http://localhost:8080/admin/>. Le navigateur voit `localhost`, donc la
condition HTTPS tombe, et l’administration n’est joignable qu’à travers ta
connexion SSH — ce qui vaut mieux que n’importe quel mot de passe.

## Passer le relais au prochain webmaster

Dans une unité, la personne qui s’occupe du site change régulièrement. Pour que
la transition se passe bien :

1. ajoute le nouveau webmaster comme collaborateur du dépôt (rôle **Write**) ;
2. transfère la propriété du dépôt GitHub, ou place-le dans une **organisation
   GitHub au nom de l’unité** plutôt que sur un compte personnel — comme ça le
   site ne dépend plus d’une seule personne ;
3. transmets aussi les accès à l’hébergement (Cloudflare ou Netlify) ;
4. retire les accès des personnes qui ne s’en occupent plus.

> 👉 Créer dès le départ une **organisation GitHub pour l’unité** évite le
> scénario classique du site coincé sur le compte de quelqu’un qui a quitté
> l’unité.

## Comment c’est rangé

Le site occupe la racine du dépôt. Les fichiers du template Les Scouts
(`css/`, `scss/`, `fonts/`, `images/`) vivent à côté et sont recopiés sous
`/template/` au moment de la construction.

```
├── src/                     LE SITE — c’est ici que tout se passe
│   ├── _data/unite.json      Les réglages (modifiables via /admin)
│   ├── _includes/            Gabarits : en-tête, pied de page, bandeau, cartes…
│   ├── admin/                L’interface d’administration
│   │   ├── apercu.js          Gabarits du volet d’aperçu, à droite de l’éditeur
│   │   ├── config.yml         ← la seule ligne à adapter s’y trouve (`repo`)
│   │   └── index.html
│   ├── contenus/             Les contenus, un fichier par fiche
│   │   ├── actualites/
│   │   ├── agenda/
│   │   └── galeries/
│   ├── medias/               Les photos envoyées depuis /admin
│   ├── index.njk             Page d’accueil
│   ├── actualites.njk        Liste des actualités
│   ├── agenda.njk            Agenda
│   ├── galeries.njk          Liste des galeries
│   └── contact.njk           Page de contact
│
├── eleventy.config.mjs      Réglages techniques (rarement à toucher)
├── netlify.toml             Réglages d’hébergement
├── scripts/                 dev.mjs (npm run dev), reset.mjs,
│                           middleware-admin.mjs (port unique + mot de passe),
│                           preparer-donnees.mjs, surveiller-suppressions.mjs
│
├── donnees/                 Contenus du site sur un serveur (non versionné)
├── Dockerfile docker-compose.yaml  Pour travailler sans installer Node
│
├── css/ scss/ fonts/ images/   LE TEMPLATE Les Scouts (charte graphique)
├── documentation/ exemples/    Documentation et exemples du template
├── TEMPLATE.md                 Le README d’origine du template
│
└── _site/                   Le site généré (jamais à modifier à la main)
```

Pour mettre le template graphique à jour, récupère la dernière version depuis
[le dépôt du template](https://github.com/lesscouts/template-unite) et
recompile avec `npm run compile-prod`.

### Contenus d’exemple

Le site est livré avec quelques actualités, activités et une galerie
d’exemple, pour que tout soit visible dès la première mise en ligne.
**Supprime-les depuis `/admin`** quand tu ajoutes tes propres contenus — leurs
dates finiront de toute façon par être dépassées.

## Repartir de zéro

Pour remettre le site dans son état de départ, par exemple avant de le confier à
une autre unité :

```bash
npm run reset            # les réglages seuls
npm run reset -- --tout  # réglages + contenus d’exemple + photos
```

La commande affiche d’abord ce qu’elle va effacer et demande confirmation.

Elle remet le nom de l’unité, les coordonnées, le logo et les sections à leurs
valeurs génériques, et remplace le nom du dépôt dans `config.yml` par
`mon-unite/mon-site`. Avec `--tout`, elle restaure aussi les contenus d’exemple
et supprime les photos envoyées depuis `/admin`.

**Une sauvegarde horodatée est créée avant toute écriture**, dans
`.sauvegardes/`. Pour revenir en arrière, recopie le dossier de sauvegarde
par-dessus `src/`. Ce dossier n’est pas versionné.

Les valeurs de départ sont dans `scripts/defauts/` : si tu veux que « repartir de
zéro » corresponde à ta propre base, modifie ces fichiers.
