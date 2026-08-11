/**
 * Lance en une seule commande les deux processus nécessaires au travail local :
 *
 *   · le site, reconstruit à chaque modification    (port 8080)
 *   · le pont qui permet à /admin d’écrire          (port 8081)
 *
 * Les deux sont inséparables : l’administration locale ne sert à rien sans le
 * site, et inversement. Les lancer ensemble évite d’avoir à ouvrir deux
 * terminaux, et garantit qu’on ne se retrouve pas avec un seul des deux actif.
 *
 * Si l’un des deux s’arrête, l’autre est arrêté aussi : mieux vaut un échec
 * visible qu’une administration à moitié fonctionnelle.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const surWindows = process.platform === 'win32';

const PORT_PONT = process.env.PONT_PORT || '8082';

const processus = [
    { nom: 'site', commande: 'npx', args: ['eleventy', '--serve'] },
    {
        // Le pont écrit dans les fichiers du dépôt : il doit tourner depuis sa racine.
        //
        // Il n’écoute que sur la machine locale : c’est le serveur du site qui
        // lui transmet les appels, sur le même port que le reste. Rien à ouvrir
        // de plus sur un serveur, et l’API n’est pas joignable en contournant
        // la protection par mot de passe.
        nom: 'admin',
        commande: 'npx',
        args: ['decap-server'],
        env: { PORT: PORT_PONT, BIND_HOST: '127.0.0.1' },
    },
    {
        // Eleventy ne reconstruit pas le site quand un contenu est supprimé :
        // ce petit surveillant s’en charge.
        nom: 'suppressions',
        commande: process.execPath,
        args: ['scripts/surveiller-suppressions.mjs'],
    },
];

let onSArrete = false;
const enfants = [];

function toutArreter(signal = 'SIGTERM') {
    if (onSArrete) return;
    onSArrete = true;
    for (const enfant of enfants) {
        if (enfant.exitCode === null && enfant.signalCode === null) {
            enfant.kill(signal);
        }
    }
}

for (const { nom, commande, args, env } of processus) {
    const enfant = spawn(commande, args, {
        cwd: RACINE,
        stdio: 'inherit',
        shell: surWindows,
        env: { ...process.env, ...env },
    });

    enfant.on('error', (erreur) => {
        console.error(`[${nom}] impossible de démarrer : ${erreur.message}`);
        toutArreter();
        process.exitCode = 1;
    });

    enfant.on('exit', (code, signal) => {
        if (onSArrete) return;
        console.error(`\n[${nom}] s’est arrêté (${signal || `code ${code}`}) — arrêt de l’ensemble.`);
        process.exitCode = code ?? 1;
        toutArreter();
    });

    enfants.push(enfant);
}

// `docker compose down` et Ctrl+C doivent arrêter les deux processus, pas
// seulement ce script.
for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => toutArreter(signal));
}
