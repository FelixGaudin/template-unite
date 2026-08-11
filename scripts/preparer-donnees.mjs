/**
 * Prépare le dossier `donnees/`, utilisé quand le site tourne sur un serveur.
 *
 * Pourquoi ce dossier existe
 * --------------------------
 * Sur un serveur, l’administration écrit dans les fichiers du site. Si ces
 * fichiers sont ceux du dépôt git, chaque modification faite depuis /admin
 * apparaît comme une modification locale, et `git pull` refuse de s’appliquer.
 *
 * `docker-compose.yaml` monte donc `donnees/` par-dessus les trois dossiers
 * modifiables — contenus, photos et réglages. Le dépôt reste intact, et les
 * données de l’unité vivent à côté, faciles à sauvegarder.
 *
 * Ce script recopie les contenus d’exemple la première fois, pour que le site
 * ne soit pas vide au premier démarrage. Il ne touche à rien ensuite.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAUTS = join(RACINE, 'scripts/defauts');

/** [dossier de données, source des valeurs de départ] */
const A_PREPARER = [
    ['src/contenus', join(DEFAUTS, 'contenus')],
    ['src/medias', join(DEFAUTS, 'medias')],
    ['src/_data', join(DEFAUTS, 'reglages')],
];

/** Un dossier absent, vide, ou ne contenant qu’un `.gitkeep`. */
function aRemplir(chemin) {
    if (!existsSync(chemin)) return true;
    return readdirSync(chemin).filter((f) => f !== '.gitkeep').length === 0;
}

let prepares = 0;

for (const [relatif, source] of A_PREPARER) {
    const cible = join(RACINE, relatif);

    if (!aRemplir(cible)) continue;

    if (!existsSync(source)) {
        console.error(`Valeurs de départ introuvables : ${source}`);
        process.exit(1);
    }

    mkdirSync(cible, { recursive: true });
    cpSync(source, cible, { recursive: true });
    console.log(`Données initialisées : ${relatif}`);
    prepares += 1;
}

if (prepares === 0) {
    console.log('Données déjà en place, rien à initialiser.');
}
