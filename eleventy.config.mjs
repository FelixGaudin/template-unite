/**
 * Configuration Eleventy du site d’unité.
 *
 * Tu n’as normalement pas besoin de toucher à ce fichier : le contenu du site
 * se modifie depuis l’interface d’administration (/admin).
 */
import markdownIt from 'markdown-it';
import { protectionAdmin, relaisPont } from './scripts/middleware-admin.mjs';

// Les feuilles de styles, polices et images du template Les Scouts vivent à la
// racine du dépôt, à côté du site. On les recopie sous /template/ en gardant la
// même structure, parce que `css/base.css` référence `../images/…` et
// `../fonts/…` en relatif.
const ASSETS_TEMPLATE = {
    css: 'template/css',
    fonts: 'template/fonts',
    images: 'template/images',
};

const FUSEAU = 'Europe/Brussels';

// Pour les courts textes où l’on veut autoriser un lien ou un mot en gras sans
// ajouter de paragraphe autour. `html: false` : le contenu vient du formulaire
// d’administration, on ne laisse pas passer de balises écrites à la main.
const markdown = markdownIt({ html: false, linkify: true });

/** Analyse une date de contenu en date UTC, en tolérant `2026-03-14`. */
function versDate(valeur) {
    if (valeur instanceof Date) return valeur;
    if (typeof valeur === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valeur)) {
        return new Date(`${valeur}T12:00:00Z`);
    }
    return new Date(valeur);
}

/** Aujourd’hui à minuit : une activité du jour compte encore comme à venir. */
function debutDuJour() {
    const maintenant = new Date();
    return new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate()));
}

export default function (eleventyConfig) {
    // Tout passe par un seul port : le site, l’administration et son API.
    // La protection par mot de passe s’active dès que `ADMIN_MOT_DE_PASSE`
    // est défini — elle doit précéder le relais, sinon l’API resterait ouverte.
    eleventyConfig.setServerOptions({
        middleware: [protectionAdmin(), relaisPont()],
    });

    for (const [source, destination] of Object.entries(ASSETS_TEMPLATE)) {
        eleventyConfig.addPassthroughCopy({ [source]: destination });
    }

    // Les photos envoyées depuis /admin
    eleventyConfig.addPassthroughCopy('src/medias');
    // L’interface d’administration est livrée telle quelle
    eleventyConfig.addPassthroughCopy('src/admin');

    // « 14 mars 2026 »
    eleventyConfig.addFilter('dateFR', (valeur) =>
        new Intl.DateTimeFormat('fr-BE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: FUSEAU,
        }).format(versDate(valeur)),
    );

    // « 14/03/2026 », pour les listes compactes. On évite `dateStyle: 'short'`,
    // qui abrège l’année en « 26 » et devient ambigu.
    eleventyConfig.addFilter('dateCourteFR', (valeur) =>
        new Intl.DateTimeFormat('fr-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: FUSEAU,
        }).format(versDate(valeur)),
    );

    // Pour l’attribut datetime="" de <time>, que les lecteurs d’écran utilisent
    eleventyConfig.addFilter('dateISO', (valeur) => versDate(valeur).toISOString().slice(0, 10));

    // Activités encore à venir, de la plus proche à la plus lointaine.
    // Une activité qui s’étale sur plusieurs jours reste « à venir » jusqu’à sa fin.
    eleventyConfig.addFilter('aVenir', (activites = []) => {
        const seuil = debutDuJour();
        return [...activites]
            .filter((a) => versDate(a.data.date_fin || a.data.date) >= seuil)
            .sort((a, b) => versDate(a.data.date) - versDate(b.data.date));
    });

    // Activités passées, de la plus récente à la plus ancienne
    eleventyConfig.addFilter('passees', (activites = []) => {
        const seuil = debutDuJour();
        return [...activites]
            .filter((a) => versDate(a.data.date_fin || a.data.date) < seuil)
            .sort((a, b) => versDate(b.data.date) - versDate(a.data.date));
    });

    eleventyConfig.addFilter('limite', (tableau = [], n) => tableau.slice(0, n));

    // Rend un court texte saisi dans l’administration, en autorisant un lien ou
    // un mot en gras, sans l’envelopper dans un paragraphe.
    eleventyConfig.addFilter('markdownEnLigne', (valeur) =>
        valeur ? markdown.renderInline(String(valeur).trim()) : '',
    );

    // Google Forms n’affiche sa version intégrable que si l’adresse porte
    // `embedded=true`. On l’ajoute pour éviter d’avoir à l’expliquer : coller
    // l’adresse du formulaire suffit.
    eleventyConfig.addFilter('adresseIntegrable', (valeur) => {
        const adresse = String(valeur || '').trim();
        if (!adresse.includes('docs.google.com/forms') || adresse.includes('embedded=true')) {
            return adresse;
        }
        return adresse + (adresse.includes('?') ? '&' : '?') + 'embedded=true';
    });

    // Actualités, de la plus récente à la plus ancienne
    eleventyConfig.addCollection('actualites', (api) =>
        api
            .getFilteredByGlob('src/contenus/actualites/*.md')
            .sort((a, b) => versDate(b.data.date) - versDate(a.data.date)),
    );

    eleventyConfig.addCollection('agenda', (api) => api.getFilteredByGlob('src/contenus/agenda/*.md'));

    eleventyConfig.addCollection('galeries', (api) =>
        api
            .getFilteredByGlob('src/contenus/galeries/*.md')
            .sort((a, b) => versDate(b.data.date) - versDate(a.data.date)),
    );

    return {
        dir: {
            input: 'src',
            output: '_site',
            includes: '_includes',
            data: '_data',
        },
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        templateFormats: ['njk', 'md', 'html'],
    };
}
