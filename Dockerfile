# Image du site d’unité.
#
# Deux usages, deux cibles :
#
#   · developpement : le site + l’administration en local, sans installer Node.
#       docker compose up
#
#   · production : une image légère qui ne contient que le site construit,
#     servi par nginx. Utile pour héberger soi-même.
#       docker build -t site-unite .
#       docker run -p 8080:80 site-unite
#
# Pour un hébergement gratuit sur Cloudflare Pages ou Netlify, Docker n’est pas
# nécessaire : voir README.md.

# ──────────────────────────────── Dépendances ────────────────────────────────
# On part de Debian slim et non d’Alpine : certaines dépendances d’Eleventy
# (la surveillance des fichiers) n’ont pas de binaire prêt à l’emploi pour la
# bibliothèque C d’Alpine et devraient être recompilées.
FROM node:20-bookworm-slim AS dependances

WORKDIR /site

# Les fichiers de dépendances d’abord : cette couche est réutilisée telle quelle
# tant que package.json ne change pas, ce qui évite de réinstaller à chaque
# modification du contenu du site.
COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────── Développement ───────────────────────────────
# Le code n’est pas copié : il est monté depuis la machine hôte par
# `compose.yaml`, pour que les modifications soient visibles immédiatement.
FROM dependances AS developpement

ENV NODE_ENV=development
EXPOSE 8080 8081
CMD ["npm", "start"]

# ──────────────────────────────── Construction ───────────────────────────────
FROM dependances AS construction

COPY . .
RUN npm run build

# ───────────────────────────────── Production ────────────────────────────────
# Seul le site construit arrive ici : ni Node, ni les dépendances, ni les
# sources. L’image reste petite et n’expose pas l’outillage.
FROM nginx:alpine AS production

# nginx sert déjà les adresses en /dossier/ grâce au index.html qu’elles
# contiennent : la configuration par défaut suffit.
COPY --from=construction /site/_site /usr/share/nginx/html

# Un fichier de configuration minimal, juste pour la page d’erreur et la
# compression des fichiers texte.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
