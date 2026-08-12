/**
 * Middlewares du serveur de développement.
 *
 * Ils permettent de tout servir sur un seul port (8080 par défaut) :
 *
 *   /admin/api/v1 → transmis au pont d’écriture, qui n’écoute que sur la
 *                   machine locale et n’est donc pas joignable de l’extérieur
 *   /admin        → l’interface d’administration
 *   le reste      → le site public, servi normalement
 *
 * Tout ce qui modifie le site vit sous `/admin` : il suffit donc de protéger
 * cette seule adresse, ici avec `ADMIN_MOT_DE_PASSE`, ou en amont avec un
 * reverse proxy (voir « Protéger l’administration » dans le README). Une
 * protection posée sur `/admin*` ne laisse rien passer à côté.
 *
 * Deux conséquences utiles au fait de tout passer par la même adresse :
 * il n’y a plus de requête entre deux origines différentes — donc plus rien à
 * configurer côté CORS — et un seul port à ouvrir sur un serveur.
 */
import { request } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

/** Port du pont d’écriture, qui reste interne à la machine. */
export const PORT_PONT = Number(process.env.PONT_PORT || 8082);

const CHEMIN_ADMIN = '/admin';

/** L’adresse de l’API vue du navigateur, sous /admin pour être protégée avec lui. */
const CHEMIN_API = '/admin/api/v1';

/** Celle qu’expose le pont, qui ne connaît que la sienne. */
const CHEMIN_API_PONT = '/api/v1';

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
 * Demande le mot de passe sur `/admin`, quand `ADMIN_MOT_DE_PASSE` est défini.
 *
 * Laissé vide, rien n’est demandé : c’est ce qu’il faut quand la protection est
 * assurée en amont par un reverse proxy, qui protège la même adresse.
 */
export function protectionAdmin() {
    const motDePasse = process.env.ADMIN_MOT_DE_PASSE || '';
    const utilisateur = process.env.ADMIN_UTILISATEUR || 'admin';

    return function (req, res, next) {
        const chemin = (req.url || '').split('?')[0];
        const concerne = chemin === CHEMIN_ADMIN || chemin.startsWith(CHEMIN_ADMIN + '/');

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
        const [chemin, requete] = (req.url || '').split('?');
        if (chemin !== CHEMIN_API) return next();

        const amont = request(
            {
                host: '127.0.0.1',
                port: PORT_PONT,
                path: CHEMIN_API_PONT + (requete ? `?${requete}` : ''),
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
