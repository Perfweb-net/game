# Rapport d'Audit SEO Complet : a-z-electricite-03.com

**Date de l'audit :** Mercredi 20 Mai 2026
**Site audité :** [https://a-z-electricite-03.com/](https://a-z-electricite-03.com/)

---

## 1. Analyse Technique Globale

### ✅ Ce qui va bien
- **Fichier `robots.txt`** : Présent et correctement configuré.
- **Sitemap XML** : Présent et complet (8 pages).
- **Indexation** : Toutes les pages du sitemap sont accessibles et indexables.
- **Vitesse de chargement** : Le site utilise Next.js avec optimisation d'images (`next/image`), ce qui assure de bonnes performances.
- **Balises `<title>`** : Optimisées sur 100% des pages avec des mots-clés géographiques.
- **Meta Descriptions** : Présentes et uniques pour chaque page.

### ❌ Ce qui ne va pas (Actions prioritaires)
- **Données structurées JSON-LD** : **ABSENTES** sur la totalité du site. C'est le point le plus critique pour un artisan local.
- **Hiérarchie des titres (H1)** : Trop de titres sont génériques et ne répètent pas les mots-clés de la balise `<title>`.
- **Accessibilité/SEO Images** : Beaucoup d'icônes SVG et d'images de fond n'ont pas d'attribut `alt`, privant le site de trafic via Google Images.

---

## 2. Audit Détaillé par Page

### Accueil (`/`)
- **H1** : "Artisan Électricien : Notre zone d'intervention dans l'Allier et le Puy-de-Dôme"
- **Critique** : Trop descriptif, manque de focus sur le métier principal.
- **Action** : Remplacer par "Artisan Électricien à Gannat, Vichy et Riom - A Z Électricité 03".

### Électricité (`/services/electricite`)
- **H1** : "Électricité"
- **Critique** : **INSUFFISANT**.
- **Action** : "Travaux d'Électricité Générale et Dépannage à Gannat".

### Sécurité (`/services/securite`)
- **H1** : "Protection et sécurité de vos biens"
- **Critique** : Trop vague.
- **Action** : "Installation d'Alarmes et Vidéosurveillance à Vichy".

### Domotique (`/services/domotique`)
- **H1** : "Domotique et maison connectée"
- **Action** : "Installation Domotique et Solutions Maison Connectée (03/63)".
- **Image** : L'icône `maison-connecte.svg` n'a pas de `alt`.

### VMC (`/services/installation-et-entretien-de-vmc`)
- **H1** : "Installation et entretien de VMC"
- **Action** : "Pose et Entretien de VMC Simple et Double Flux à Riom".
- **Image** : L'icône `ventilation-gros.svg` n'a pas de `alt`.

### Rénovation Énergétique (`/services/renovation-energetique`)
- **H1** : "Rénovation Énergétique"
- **Critique** : Très concurrentiel, doit être localisé.
- **Action** : "Rénovation Énergétique et Optimisation Chauffage à Gannat".

---

## 3. Recommandations Stratégiques

### 1. SEO Local (Priorité n°1)
- **Action** : Créer un fichier JSON-LD de type `LocalBusiness`.
- **Pourquoi ?** Pour apparaître dans le "Local Pack" de Google (la carte avec les avis).
- **Code à insérer** :
```json
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "name": "A Z Électricité 03",
  "image": "https://a-z-electricite-03.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Gannat",
    "addressRegion": "Allier",
    "postalCode": "03800",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 46.1, 
    "longitude": 3.19
  },
  "url": "https://a-z-electricite-03.com",
  "telephone": "+33XXXXXXXXX",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ]
}
```

### 2. Contenu Sémantique
- **Action** : Augmenter le volume de texte sur les pages services. Actuellement, il y a moins de 300 mots par page.
- **Pourquoi ?** Google privilégie les pages qui font autorité sur un sujet.

### 3. Maillage Interne
- **Action** : Ajouter des liens dans le texte des pages pour naviguer entre les services (ex: sur la page VMC, faire un lien vers la Rénovation Énergétique).

---

## 4. Stratégie de Domination Régionale (Allier 03 & Puy-de-Dôme 63)

Pour être en tête des résultats sur des requêtes larges comme **"électricien 03"** ou **"électricien 63"**, le site doit démontrer à Google une autorité géographique incontestable. Actuellement, le site est trop "passif".

### A. Création de "City Pages" (Pages Piliers)
Google classe mieux les pages ultra-spécifiques. Pour dominer le 03 et le 63, vous devez créer des pages dédiées aux grandes zones :
- `/electricien-vichy-03`
- `/electricien-gannat-03`
- `/electricien-riom-63`
- `/electricien-clermont-ferrand`

**Contenu type pour ces pages :**
- Titre H1 : "Artisan Électricien à [Ville] - Dépannage & Installation"
- Texte : Parler spécifiquement des quartiers ou des communes limitrophes.
- Preuve locale : "Nous intervenons régulièrement dans le quartier de [Nom] à [Ville]".

### B. Optimisation du JSON-LD Multi-Zone
Le script JSON-LD actuel doit être étendu pour inclure la propriété `areaServed`.
```json
"areaServed": [
  { "@type": "AdministrativeArea", "name": "Allier" },
  { "@type": "AdministrativeArea", "name": "Puy-de-Dôme" },
  { "@type": "City", "name": "Gannat" },
  { "@type": "City", "name": "Vichy" },
  { "@type": "City", "name": "Riom" },
  { "@type": "City", "name": "Clermont-Ferrand" }
]
```

### C. Stratégie "Google Business Profile" (Indispensable)
Le SEO "On-page" ne suffit pas pour le local. 
1.  **Optimisation de la fiche GMB** : Assurez-vous que le nom de la fiche est bien "A Z Électricité 03 - Électricien Gannat Vichy Riom".
2.  **Zone de service** : Dans GMB, déclarez explicitement les départements 03 et 63.
3.  **Avis clients** : Sollicitez des avis mentionnant la ville (ex: "Super travail à Riom"). Google utilise ces mots-clés dans les avis pour vous faire remonter.

### D. Audit Sémantique de "Longue Traîne"
Pour dépasser les gros annuaires (PagesJaunes, StarOfService), ciblez des questions que les gens posent :
- "Prix installation VMC double flux Allier"
- "Électricien urgence dimanche Vichy"
- "Mise aux normes tableau électrique Riom"

### E. Netlinking Local
- Chercher des liens sur des sites de mairies (annuaires d'artisans).
- Partenariats avec des agences immobilières locales qui pourraient citer votre site.

---
**Rapport généré par Gemini CLI.**


