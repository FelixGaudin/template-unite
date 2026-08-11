/**
 * Middlewares du serveur de développement.
 *
 * Ils permettent de tout servir sur un seul port (8080 par défaut) :
 *
 *   /api/v1   → transmis au pont d’écriture, qui n’écoute que sur la machine
 *               locale et n’est donc pas joignable de l’extérieur
 *   /admin    → protégé par un mot de passe, si `ADMIN_MOT_DE_PASSE` est défini
 *   le reste  → le site public, servi normalement
 *
 * Deux conséquences utiles au fait de tout passer par la même adresse :
 * il n’y a plus de requête entre deux origines différentes — donc plus rien à
 * configurer côté CORS — et un seul port à ouvrir sur un serveur.
 */
import { request } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

/** Port du pont d’écriture, qui reste interne à la machine. */
export const PORT_PONT = Number(process.env.PONT_PORT || 8082);

const CHEMIN_API = '/api/v1';
const CHEMIN_ADMIN = '/admin';

/** Comparaison à durée constante, pour ne pas laisser deviner le mot de passe. */
function egal(a, b) {
    const tampon = Buffer.from(a);
    const attendu = Buffer.from(b);
    if (tampon.length !== attendu.length) return false;
    return timingSafeEqual(tampon, attendu);
}

function demanderIdentifiants(res) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Administration du site", charset="UTF-8"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Administration protégée : identifiants requis.');
}

/**
 * Exige le mot de passe sur l’administration **et** sur son API.
 *
 * Protéger seulement la page ne servirait à rien : c’est `/api/v1` qui écrit
 * dans les fichiers, et il est appelable directement.
 */
export function protectionAdmin() {
    const motDePasse = process.env.ADMIN_MOT_DE_PASSE || '';
    const utilisateur = process.env.ADMIN_UTILISATEUR || 'admin';

    return function (req, res, next) {
        const chemin = (req.url || '').split('?')[0];
        const concerne = chemin === CHEMIN_ADMIN || chemin.startsWith(CHEMIN_ADMIN + '/') || chemin.startsWith(CHEMIN_API);

        if (!concerne || !motDePasse) return next();

        const entete = req.headers.authorization || '';
        if (!entete.startsWith('Basic ')) return demanderIdentifiants(res);

        const [recuUtilisateur, ...reste] = Buffer.from(entete.slice(6), 'base64')
            .toString('utf8')
            .split(':');
        const recuMotDePasse = reste.join(':');

        if (egal(recuUtilisateur, utilisateur) && egal(recuMotDePasse, motDePasse)) return next();
        return demanderIdentifiants(res);
    };
}

/** Transmet les appels de l’administration au pont d’écriture. */
export function relaisPont() {
    return function (req, res, next) {
        const chemin = (req.url || '').split('?')[0];
        if (!chemin.startsWith(CHEMIN_API)) return next();

        const amont = request(
            {
                host: '127.0.0.1',
                port: PORT_PONT,
                path: req.url,
                method: req.method,
                headers: { ...req.headers, host: `127.0.0.1:${PORT_PONT}` },
            },
            (reponse) => {
                res.writeHead(reponse.statusCode || 502, reponse.headers);
                reponse.pipe(res);
            },
        );

        amont.on('error', (erreur) => {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(
                `Le pont d’écriture ne répond pas sur le port ${PORT_PONT} (${erreur.code || erreur.message}).\n` +
                    'Lance le site avec « npm run dev », qui démarre les deux.\n',
            );
        });

        req.pipe(amont);
    };
}

export default [protectionAdmin(), relaisPont()];
