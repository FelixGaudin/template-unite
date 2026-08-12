/**
 * Aperçus du volet de droite de l’administration.
 *
 * Sans ce fichier, Decap CMS empile simplement les champs les uns sous les
 * autres dans le volet d’aperçu, ce qui est illisible — surtout pour les
 * réglages, qui contiennent des listes imbriquées. On lui fournit donc un
 * gabarit par rubrique, qui reprend la mise en page réelle du site.
 *
 * `createClass` et `h` sont fournis par Decap CMS (voir index.html) : il n’y a
 * ni compilation ni JSX ici, le fichier est chargé tel quel par le navigateur.
 */
(function () {
    'use strict';

    // La feuille de styles du site : l’aperçu ressemble ainsi au résultat final.
    CMS.registerPreviewStyle('/template/css/base.css');

    // Quelques retouches propres au volet d’aperçu, qui est plus étroit
    // qu’un vrai écran.
    CMS.registerPreviewStyle(
        [
            'body { padding: 0; background: #fff; }',
            '.apercu-etiquette { font: 600 11px/1 sans-serif; letter-spacing: .08em;',
            '  text-transform: uppercase; color: #6c757d; padding: 8px 12px;',
            '  border-bottom: 1px solid #dee2e6; background: #f8f9fa; }',
            '.apercu-vide { color: #6c757d; font-style: italic; }',
            // Les champs « texte » gardent leurs retours à la ligne, comme le
            // site, qui les convertit en <br> (filtre `sautsDeLigne`).
            '.apercu-texte { white-space: pre-line; }',
        ].join('\n'),
        { raw: true },
    );

    /** Les valeurs du formulaire, en objet JavaScript ordinaire. */
    function valeurs(props) {
        var data = props.entry && props.entry.get('data');
        return data && data.toJS ? data.toJS() : {};
    }

    /** Résout le chemin d’une image, qu’elle soit déjà enregistrée ou tout juste déposée. */
    function urlImage(props, chemin) {
        if (!chemin) return null;
        var asset = props.getAsset ? props.getAsset(chemin) : null;
        return asset ? asset.toString() : chemin;
    }

    /**
     * Le champ markdown « mention » du pied de page, rendu par Decap lui-même.
     * `widgetsFor` donne accès aux champs d’un groupe : on récupère le rendu du
     * widget plutôt que de réimplémenter une conversion markdown ici.
     */
    function mentionRendue(props) {
        if (!props.widgetsFor) return null;
        var pied = props.widgetsFor('pied_de_page');
        return pied && pied.getIn ? pied.getIn(['widgets', 'mention']) : null;
    }

    function dateFR(valeur) {
        if (!valeur) return '';
        var d = new Date(valeur);
        if (isNaN(d.getTime())) return String(valeur);
        return new Intl.DateTimeFormat('fr-BE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(d);
    }

    /** Bandeau de titre, identique à celui du site (voir partials/banniere.njk). */
    function banniere(couleur, decor, titre, chapeau) {
        return h(
            'div',
            { className: (couleur || 'bg-primary') + ' overflow-hidden' },
            h(
                'div',
                { className: 'container' },
                h(
                    'div',
                    {
                        className:
                            'row topping-' +
                            (decor || 'federation') +
                            ' topping-white topping-bottom-overflow topping-right topping-large',
                    },
                    h(
                        'div',
                        { className: 'col-12 pb-5 pt-4' },
                        h('h1', { className: 'mb-3' }, titre || 'Nom de l’unité'),
                        chapeau ? h('p', { className: 'mb-0 apercu-texte' }, chapeau) : null,
                    ),
                ),
            ),
        );
    }

    function etiquette(texte) {
        return h('div', { className: 'apercu-etiquette' }, texte);
    }

    function absent(texte) {
        return h('p', { className: 'apercu-vide mb-0' }, texte);
    }

    // ───────────────────────────── Réglages du site ─────────────────────────────

    var ApercuReglages = createClass({
        render: function () {
            var d = valeurs(this.props);
            var locaux = d.locaux || {};
            var contact = d.contact || {};
            var sections = d.sections || [];
            var colonnes = (d.pied_de_page && d.pied_de_page.colonnes) || [];
            var logo = urlImage(this.props, d.logo) || '/template/images/logos/logo_Federation_couleur_baseline_562x236.png';

            return h(
                'div',
                {},
                etiquette('Aperçu de la page d’accueil'),

                // Barre du haut, pour voir le logo tel qu’il apparaîtra
                h(
                    'div',
                    { className: 'navbar navbar-light bg-light border-bottom' },
                    h(
                        'div',
                        { className: 'container' },
                        h(
                            'span',
                            { className: 'navbar-brand' },
                            h('img', { src: logo, alt: d.logo_alt || d.nom || '' }),
                        ),
                    ),
                ),

                banniere(d.couleur_banniere, d.branche_decor, d.nom, d.accroche),

                h(
                    'div',
                    { className: 'container my-4' },

                    d.presentation
                        ? h('p', { className: 'apercu-texte' }, d.presentation)
                        : absent('Pas encore de texte de présentation.'),

                    h('h2', { className: 'mt-5' }, 'informations pratiques'),
                    h(
                        'div',
                        { className: 'row g-4 mt-2' },
                        h(
                            'div',
                            { className: 'col-12 col-md-6' },
                            h('h3', { className: 'h5' }, locaux.nom || 'Nos locaux'),
                            locaux.adresse ? h('address', { className: 'mb-2' }, locaux.adresse) : null,
                            locaux.informations
                                ? h('p', { className: 'mb-2 apercu-texte' }, locaux.informations)
                                : null,
                            locaux.lien_itineraire
                                ? h('p', { className: 'fw-bold mb-0' }, 'Itinéraire ›')
                                : null,
                        ),
                        h(
                            'div',
                            { className: 'col-12 col-md-6' },
                            h('h3', { className: 'h5' }, 'Contact'),
                            h('p', { className: 'mb-1' }, h('strong', {}, contact.responsable || '—')),
                            contact.fonction
                                ? h('p', { className: 'small text-muted mb-2' }, contact.fonction)
                                : null,
                            h(
                                'address',
                                { className: 'mb-0' },
                                contact.telephone
                                    ? h(
                                          'span',
                                          {},
                                          contact.telephone,
                                          contact.telephone_precision
                                              ? h(
                                                    'span',
                                                    { className: 'text-muted' },
                                                    ' (' + contact.telephone_precision + ')',
                                                )
                                              : null,
                                          h('br'),
                                      )
                                    : null,
                                contact.email || null,
                            ),
                        ),
                    ),

                    sections.length
                        ? h(
                              'div',
                              {},
                              h('h2', { className: 'mt-5' }, 'nos sections'),
                              h(
                                  'div',
                                  { className: 'row g-3 mt-2' },
                                  sections.map(function (section, i) {
                                      return h(
                                          'div',
                                          { className: 'col-6', key: i },
                                          h(
                                              'div',
                                              {
                                                  className:
                                                      (section.couleur || 'bg-primary') +
                                                      ' p-3 h-100 bg-topping bg-topping-right bg-topping-' +
                                                      (section.decor || 'federation') +
                                                      ' bg-topping-opacity-20',
                                              },
                                              h('h3', { className: 'h6 mb-1' }, section.nom || '—'),
                                              h('p', { className: 'small mb-0' }, section.ages || ''),
                                          ),
                                      );
                                  }),
                              ),
                          )
                        : null,
                ),

                h(
                    'div',
                    { className: 'bg-primary py-4 mt-4' },
                    h(
                        'div',
                        { className: 'container' },
                        // Même repli que le site : phrase libre si elle est
                        // renseignée, sinon celle construite depuis le nom.
                        // On laisse Decap rendre le champ markdown lui-même
                        // plutôt que de réécrire un convertisseur ici.
                        h(
                            'div',
                            { className: 'text-center small' },
                            d.pied_de_page && d.pied_de_page.mention
                                ? mentionRendue(this.props)
                                : (d.nom || 'L’unité') + ' est membre de Les Scouts asbl',
                        ),
                        h(
                            'div',
                            { className: 'row g-3' },
                            colonnes.map(function (colonne, i) {
                                var liens = colonne.liens || [];
                                return h(
                                    'div',
                                    { className: 'col-6', key: i },
                                    h('p', { className: 'fw-bold small mb-1' }, colonne.titre || '—'),
                                    colonne.texte ? h('p', { className: 'small mb-2 apercu-texte' }, colonne.texte) : null,
                                    // Les liens sont montrés mais pas cliquables : un clic
                                    // dans le volet d’aperçu quitterait l’administration,
                                    // en abandonnant les modifications en cours.
                                    liens.length
                                        ? h(
                                              'ul',
                                              { className: 'list-unstyled small mb-0' },
                                              liens.map(function (lien, j) {
                                                  return h(
                                                      'li',
                                                      { className: 'text-decoration-underline', key: j },
                                                      lien.libelle || lien.adresse || '—',
                                                  );
                                              }),
                                          )
                                        : null,
                                );
                            }),
                        ),
                    ),
                ),
            );
        },
    });

    // ─────────────────────────────── Actualité ──────────────────────────────────

    var ApercuActualite = createClass({
        render: function () {
            var d = valeurs(this.props);
            var image = urlImage(this.props, d.image);

            return h(
                'div',
                {},
                etiquette('Aperçu de l’actualité'),
                banniere(null, null, d.titre, d.resume),
                h(
                    'div',
                    { className: 'container my-4' },
                    d.date
                        ? h('p', { className: 'small text-muted' }, 'Publié le ' + dateFR(d.date))
                        : null,
                    image
                        ? h('img', { src: image, className: 'img-fluid mb-4', alt: d.image_alt || '' })
                        : null,
                    h('div', {}, this.props.widgetFor('body')),
                ),
            );
        },
    });

    // ──────────────────────────────── Activité ──────────────────────────────────

    var ApercuActivite = createClass({
        render: function () {
            var d = valeurs(this.props);

            function ligne(intitule, valeur) {
                if (!valeur) return null;
                return h(
                    'div',
                    { className: 'row mb-1' },
                    h('div', { className: 'col-4 fw-bold small' }, intitule),
                    h('div', { className: 'col-8 small' }, valeur),
                );
            }

            return h(
                'div',
                {},
                etiquette('Aperçu de l’activité'),
                banniere(null, null, d.titre, null),
                h(
                    'div',
                    { className: 'container my-4' },
                    ligne('Date', dateFR(d.date) + (d.date_fin ? ' → ' + dateFR(d.date_fin) : '')),
                    ligne('Heure', d.heure),
                    ligne('Lieu', d.lieu),
                    ligne('Section', d.section),
                    d.description ? h('p', { className: 'mt-3 apercu-texte' }, d.description) : null,
                    h('div', {}, this.props.widgetFor('body')),
                ),
            );
        },
    });

    // ───────────────────────────────── Galerie ──────────────────────────────────

    var ApercuGalerie = createClass({
        render: function () {
            var props = this.props;
            var d = valeurs(props);
            var photos = d.photos || [];

            return h(
                'div',
                {},
                etiquette('Aperçu de la galerie'),
                banniere(null, null, d.titre, d.description),
                h(
                    'div',
                    { className: 'container my-4' },
                    h(
                        'p',
                        { className: 'small text-muted' },
                        dateFR(d.date) + (d.section ? ' − ' + d.section : ''),
                    ),
                    photos.length
                        ? h(
                              'div',
                              { className: 'row g-3' },
                              photos.map(function (photo, i) {
                                  var src = urlImage(props, photo && photo.image);
                                  return h(
                                      'div',
                                      { className: 'col-6', key: i },
                                      src
                                          ? h('img', {
                                                src: src,
                                                className: 'img-fluid d-block w-100',
                                                alt: (photo && photo.legende) || '',
                                            })
                                          : absent('Photo manquante'),
                                      photo && photo.legende
                                          ? h('p', { className: 'small text-muted mt-1 mb-0' }, photo.legende)
                                          : null,
                                  );
                              }),
                          )
                        : absent('Aucune photo pour l’instant. Dépose-les dans le champ « Photos ».'),
                ),
            );
        },
    });

    // Pour une collection de type « files », l’aperçu se déclare au nom du
    // fichier (`unite`) et non au nom de la collection.
    CMS.registerPreviewTemplate('unite', ApercuReglages);
    CMS.registerPreviewTemplate('actualites', ApercuActualite);
    CMS.registerPreviewTemplate('agenda', ApercuActivite);
    CMS.registerPreviewTemplate('galeries', ApercuGalerie);
})();
