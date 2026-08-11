/**
 * Remet le site dans son état de départ.
 *
 *   npm run reset              réglages seuls (src/_data/unite.json + repo dans config.yml)
 *   npm run reset -- --tout    réglages + contenus d’exemple + photos
 *   npm run reset -- --tout --oui   sans demander confirmation
 *
 * Une sauvegarde horodatée est créée avant toute écriture, dans
 * `.sauvegardes/`. Rien n’est donc définitivement perdu.
 */
import { createInterface } from 'node:readline/promises';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = resolve(ICI, '..');
const DEFAUTS = join(ICI, 'defauts');

const REGLAGES = join(RACINE, 'src/_data/unite.json');
const CONFIG_CMS = join(RACINE, 'src/admin/config.yml');
const CONTENUS = join(RACINE, 'src/contenus');
const MEDIAS = join(RACINE, 'src/medias');
const SAUVEGARDES = join(RACINE, '.sauvegardes');

const DEPOT_PAR_DEFAUT = 'mon-unite/mon-site';

const args = process.argv.slice(2);
const tout = args.includes('--tout');
const sansDemander = args.includes('--oui');

/** Horodatage utilisable dans un nom de dossier : 2026-08-11_18-42-07 */
function horodatage() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

function sauvegarder() {
    const cible = join(SAUVEGARDES, horodatage());
    mkdirSync(cible, { recursive: true });
    cpSync(join(RACINE, 'src/_data'), join(cible, '_data'), { recursive: true });
    cpSync(CONFIG_CMS, join(cible, 'config.yml'));
    if (tout) {
        cpSync(CONTENUS, join(cible, 'contenus'), { recursive: true });
        cpSync(MEDIAS, join(cible, 'medias'), { recursive: true });
    }
    return cible;
}

/** Ce qui va être écrasé, décrit en clair avant de demander confirmation. */
function resume() {
    const lignes = [];
    try {
        const actuel = JSON.parse(readFileSync(REGLAGES, 'utf8'));
        lignes.push(`  · réglages du site — nom actuel : « ${actuel.nom} »`);
        if (actuel.logo) lignes.push(`  · logo actuel : ${actuel.logo} (la référence sera effacée)`);
    } catch {
        lignes.push('  · réglages du site');
    }

    const depot = (readFileSync(CONFIG_CMS, 'utf8').match(/^\s*repo:\s*(.+)$/m) || [])[1];
    if (depot && depot.trim() !== DEPOT_PAR_DEFAUT) {
        lignes.push(`  · dépôt configuré (${depot.trim()}) → remis à ${DEPOT_PAR_DEFAUT}`);
    }

    if (tout) {
        const compte = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.md')).length : 0);
        lignes.push(
            `  · contenus : ${compte(join(CONTENUS, 'actualites'))} actualité(s), ` +
                `${compte(join(CONTENUS, 'agenda'))} activité(s), ` +
                `${compte(join(CONTENUS, 'galeries'))} galerie(s)`,
        );
        const photos = existsSync(MEDIAS)
            ? readdirSync(MEDIAS).filter((f) => !f.startsWith('exemple-'))
            : [];
        if (photos.length) lignes.push(`  · ${photos.length} photo(s) envoyée(s) depuis /admin : ${photos.join(', ')}`);
    }
    return lignes;
}

function reinitialiser() {
    // Réglages
    cpSync(join(DEFAUTS, 'unite.json'), REGLAGES);

    // Nom du dépôt dans la configuration de l’administration
    const config = readFileSync(CONFIG_CMS, 'utf8');
    const remis = config.replace(/^(\s*repo:\s*).+$/m, `$1${DEPOT_PAR_DEFAUT}`);
    if (remis !== config) writeFileSync(CONFIG_CMS, remis);

    if (tout) {
        rmSync(CONTENUS, { recursive: true, force: true });
        cpSync(join(DEFAUTS, 'contenus'), CONTENUS, { recursive: true });

        rmSync(MEDIAS, { recursive: true, force: true });
        cpSync(join(DEFAUTS, 'medias'), MEDIAS, { recursive: true });
    }
}

const lignes = resume();
console.log(`\nCe qui va être remis à zéro :\n${lignes.join('\n')}\n`);
if (!tout) {
    console.log('Les contenus (actualités, agenda, galeries) et les photos ne sont pas touchés.');
    console.log('Ajoute --tout pour les remettre aussi à l’état de départ.\n');
}

if (!sansDemander) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const reponse = (await rl.question('Continuer ? [o/N] ')).trim().toLowerCase();
    rl.close();
    if (reponse !== 'o' && reponse !== 'oui') {
        console.log('Annulé, rien n’a été modifié.');
        process.exit(0);
    }
}

const sauvegarde = sauvegarder();
reinitialiser();

console.log(`\n✓ Remise à zéro effectuée.`);
console.log(`  Sauvegarde de l’état précédent : ${sauvegarde.replace(RACINE + '/', '')}`);
console.log(`  Pour revenir en arrière, recopie ce dossier par-dessus src/.\n`);
