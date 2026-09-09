# Moulazim Law Firm — site vitrine

Site statique (HTML/CSS/JS, sans dépendance ni build) du cabinet d'avocats Moulazim Law Firm, Casablanca — boulevard Mostapha El Maani, fondé par Me Mehdi Moulazim.

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

- téléphone `+212 5 22 00 00 00` et e-mail `contact@moulazim-lawfirm.ma` (présents dans chaque page et dans le JSON-LD de `index.html`) ;
- numéro exact et étage de l'adresse boulevard Mostapha El Maani, et coordonnées de la carte dans `contact.html` ;
- chiffres clés (années d'expérience, nombre de dossiers), témoignages et composition de l'équipe ;
- horaires, mentions d'hébergeur et identifiants légaux dans `mentions-legales.html` ;
- photographies du cabinet et du fondateur (à placer dans `assets/img/`).

Le formulaire de contact est purement côté client : il valide les champs et affiche une confirmation, sans envoi. Pour recevoir les demandes, brancher un service (Formspree, Netlify Forms) ou un endpoint côté serveur sur l'élément `form[data-contact-form]` dans `assets/js/main.js`.
