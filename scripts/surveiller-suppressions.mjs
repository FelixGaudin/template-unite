/**
 * Reconstruit le site quand un contenu est supprimé.
 *
 * Pourquoi ce script existe
 * -------------------------
 * Eleventy reconstruit le site quand un fichier est ajouté ou modifié, mais pas
 * quand il est supprimé : son gestionnaire de suppression se contente de vider
 * un cache interne. Résultat, une actualité supprimée depuis /admin restait
 * affichée dans les listes.
 *
 * Et même après reconstruction, la page de l’actualité supprimée restait
 * accessible par son adresse : Eleventy n’efface pas ce qu’il a déjà écrit.
 *
 * Ce script surveille donc les dossiers de contenus. À la moindre suppression,
 * il vide le site généré et provoque une reconstruction complète, ce qui règle
 * les deux problèmes d’un coup. Une reconstruction prend moins d’une seconde.
 */
import { existsSync, rmSync, utimesSync, watch } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = join(RACINE, '_site');

/** Dossiers dont la disparition d’un fichier doit provoquer une reconstruction. */
const SURVEILLES = ['src/contenus', 'src/medias'].map((d) => join(RACINE, d));

/**
 * Fichier touché pour réveiller Eleventy : il surveille les modifications, donc
 * changer sa date suffit. Son contenu n’est pas modifié.
 */
const DECLENCHEUR = join(RACINE, 'src/index.njk');

const DELAI_REGROUPEMENT = 400;
let minuterie = null;

function reconstruire() {
    if (!existsSync(DECLENCHEUR)) return;

    // Vider la sortie retire les pages devenues orphelines.
    rmSync(SORTIE, { recursive: true, force: true });

    const maintenant = new Date();
    utimesSync(DECLENCHEUR, maintenant, maintenant);
    console.log('[suppressions] contenu supprimé, reconstruction complète du site');
}

function auChangement(dossier, nomFichier) {
    if (!nomFichier) return;
    // Seules les disparitions nous intéressent : les ajouts et modifications
    // sont déjà pris en charge par Eleventy.
    if (existsSync(join(dossier, nomFichier))) return;

    clearTimeout(minuterie);
    minuterie = setTimeout(reconstruire, DELAI_REGROUPEMENT);
}

for (const dossier of SURVEILLES) {
    if (!existsSync(dossier)) continue;
    try {
        watch(dossier, { recursive: true }, (_type, nomFichier) => auChangement(dossier, nomFichier));
    } catch (erreur) {
        console.error(
            `[suppressions] surveillance impossible pour ${dossier} (${erreur.code || erreur.message}). ` +
                'Les contenus supprimés resteront affichés jusqu’au prochain redémarrage.',
        );
    }
}
