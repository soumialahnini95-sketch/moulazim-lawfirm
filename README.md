# Moulazim Law Firm — site vitrine

Site statique (HTML/CSS/JS, sans dépendance ni build) du cabinet d'avocats Moulazim Law Firm, Casablanca — boulevard Mostapha El Maani, fondé par Mehdi Moulazim.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : hero, domaines d'intervention, méthode de suivi, fondateur, secteurs, témoignages, FAQ courte |
| `cabinet.html` | Identité du cabinet, parcours du fondateur, protocole de suivi approfondi, équipe, chiffres |
| `prestations.html` | 9 blocs détaillés : corporate, contrats, contentieux, recouvrement, social, immobilier, pénal des affaires, famille, investisseurs étrangers |
| `honoraires.html` | Modes d'honoraires (tableau) + FAQ complète |
| `contact.html` | Coordonnées, plan d'accès, formulaire de rendez-vous avec validation JavaScript |
| `mentions-legales.html` | Mentions légales, données personnelles (loi 09-08), avertissement |

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Aucune installation n'est nécessaire : les fichiers peuvent aussi être ouverts directement ou déployés tels quels (GitHub Pages, Netlify, hébergement mutualisé).

## À personnaliser avant mise en ligne

Les éléments suivants sont des valeurs d'exemple à remplacer par les informations réelles du cabinet :

- e-mail `contact@moulazim-lawfirm.ma` (présent dans chaque page et dans le JSON-LD de `index.html`) ; le numéro `+212 669 02 62 10` sert à la fois de téléphone et de contact WhatsApp ;
- numéro exact et étage de l'adresse boulevard Mostapha El Maani, et coordonnées de la carte dans `contact.html` ;
- chiffres clés (années d'expérience, nombre de dossiers), témoignages et composition de l'équipe ;
- horaires, mentions d'hébergeur et identifiants légaux dans `mentions-legales.html` ;
- photographies du cabinet et du fondateur (à placer dans `assets/img/`).

## Formulaire de contact → WhatsApp

Le formulaire valide les champs côté client puis ouvre WhatsApp (`https://wa.me/<numéro>`) avec un message pré-rempli reprenant nom, société, e-mail, téléphone, domaine, urgence et description ; le visiteur n'a plus qu'à appuyer sur « Envoyer ». Le numéro destinataire est défini par l'attribut `data-whatsapp` du formulaire dans `contact.html` (format international sans `+`, actuellement `212669026210`).

Aucune donnée n'est envoyée à un serveur. Pour recevoir aussi les demandes par e-mail, brancher un service (Formspree, Netlify Forms) sur `form[data-contact-form]` dans `assets/js/main.js`.

## Numéro de dossier et page de suivi

À chaque envoi valide, le site attribue une référence `MLF-<année>-<4 chiffres>`, l'insère en tête du message WhatsApp et l'enregistre dans le `localStorage` du visiteur (clé `mlf-dossiers`, 20 dernières demandes). La page `suivi.html` lit cette référence (saisie manuelle ou paramètre `?ref=`) et affiche la fiche du dossier ainsi que la frise des cinq étapes, la première étant marquée comme courante.

Le suivi est donc local au navigateur du client : il restitue la demande déposée, pas l'avancement réel de la procédure. Pour un suivi partagé et mis à jour par le cabinet, il faut une base de données et une authentification — brancher alors `initTracking()` (`assets/js/main.js`) sur une API renvoyant `{ ref, date, domaine, urgence, etape }`.
