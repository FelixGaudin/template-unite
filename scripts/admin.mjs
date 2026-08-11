/**
 * Démarre le serveur local de l’administration (`decap-server`).
 *
 * Ce serveur écrit dans les fichiers du dépôt et attend d’être lancé depuis sa
 * racine, à laquelle les chemins de `config.yml` sont relatifs — c’est tout ce
 * que fait ce script.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racineDepot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const serveur = spawn('npx', ['decap-server'], {
    cwd: racineDepot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
});

serveur.on('error', (erreur) => {
    console.error('Impossible de démarrer decap-server :', erreur.message);
    process.exit(1);
});

serveur.on('exit', (code) => process.exit(code ?? 0));
