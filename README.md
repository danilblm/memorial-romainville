# Mémorial numérique du Fort de Romainville

Site mémoriel sur les femmes résistantes et déportées passées par le Fort de Romainville (Les Lilas).
Projet M2 THYP – Paris 8 – groupe Fatoumata, Théo, Daphné, Zakaria, Danil.

Stack MERN en TypeScript, organisée comme [E-Commerce_MERN](https://github.com/yaya1426/E-Commerce_MERN) :

- **backend** : Node + Express + MongoDB (Mongoose), JWT pour l'équipe
- **frontend** : React + Vite + MUI, react-router, react-i18next (FR/EN), react-leaflet (carte), @mui/lab (frise)

## Lancer le projet

Prérequis : Node 20+ et MongoDB lancé en local.

```bash
# Backend (http://localhost:3001)
cd backend
cp .env.example .env      # puis remplir JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev

# Frontend (http://localhost:5173)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Au premier démarrage, le backend crée le compte admin défini dans `.env` et charge des **données d'exemple fictives**
(`backend/src/seed/exampleData.ts`) pour tester l'affichage. Elles sont à supprimer quand les vraies fiches seront saisies.

## Structure

```
backend/src/
  index.ts          démarrage, routes, connexion Mongo
  models/           Person, Testimony, Source, Place, Event, Contribution, User (+ shared.ts)
  services/         logique métier ; publicFilters.ts = règles de publication
  routes/           une route par entité
  middlewares/      validateJWT, requireRole, upload (multer)
  validators/       schémas zod des formulaires
  types/            vocabulaires communs (fiabilité, statuts…), extendedRequest
  seed/             données d'exemple + script `npm run seed`

frontend/src/
  pages/            Home (arbre), Person, Testimony, Timeline, Map, Place,
                    Contribute, Sources, Archives, community/, Login, admin/
  components/       Navbar, WomenTree, ReliabilityBadge, ClaimList, MissingInfo,
                    TestimonyContext, MediaPlayer, SourceList, AccessibilityPanel…
  context/          Auth/, Accessibility/ (thème MUI : taille, contraste, police)
  i18n/             fr.json, en.json
  types/  api/  hooks/  utils/  constants/
```

## Principes du modèle de données

- On stocke des **affirmations** (`claims`) plutôt que des faits : chacune a ses sources, un niveau de fiabilité,
  un statut de validation et un indicateur `aiAssisted`.
- Seul le statut `valide` est publié (`services/publicFilters.ts`).
- Chaque fiche a un champ **« Ce que l'on ne sait pas »** (`missingInfo`).
- **Consentement / visibilité** : `publique`, `reservee` (seul le nom reste, pomme vide dans l'arbre), `masquee` (rien n'apparaît).
- Un **témoignage** porte son contexte : qui parle, pour qui, depuis quand, par quel chemin.
- Les **contributions** du public ne sont jamais publiées automatiquement ; leurs fichiers ne sont accessibles qu'à l'équipe,
  et chaque décision demande un motif.

Les niveaux de fiabilité (`documentee`, `recoupee`, `temoignee`, `transmise`, `incertaine`, `inconnue`) sont une
proposition à valider avec le groupe.

## API

| Méthode | Route | Accès |
| --- | --- | --- |
| GET | `/persons`, `/persons/:id` | public |
| GET | `/events?period=`, `/events/periods` | public |
| GET | `/places`, `/places/:code` | public |
| GET | `/testimonies/:id`, `/sources/:id` | public |
| POST | `/contributions` (multipart, champ `files`) | public |
| GET | `/contributions?status=` | équipe |
| PATCH | `/contributions/:id/decision` | équipe |
| GET | `/contributions/:id/files/:index` | équipe |
| GET | `/contributions/published?kind=&q=`, `/contributions/published/:id` | public (validées + accord) |
| GET | `/contributions/published/:id/files/:index` | public (validées + accord) |
| POST | `/community/register`, `/community/login` | public |
| GET / PATCH | `/community/me` | membre |
| GET | `/community/posts?kind=&tag=&q=&before=`, `/community/posts/:id`, `/community/stats`, `/community/members/:id` | public |
| POST / DELETE | `/community/posts` (multipart, champ `image`), `/community/posts/:id` | membre (auteur pour supprimer) |
| POST | `/community/posts/:id/like`, `/community/posts/:id/comments`, `/community/{posts,comments}/:id/report` | membre |
| GET / PATCH | `/community/moderation/{posts,comments,members}` | équipe |
| POST | `/user/login` | public |
| GET / POST | `/user` (lister, créer un compte) | admin |
| PATCH / DELETE | `/user/:id` (rôle, nouveau mot de passe, suppression) | admin |
| PATCH | `/user/me/password` | membre connecté |
| GET | `/admin/:entity?status=&q=` | équipe |
| GET | `/admin/:entity/options` (pour les sélecteurs) | équipe |
| GET / POST / PUT | `/admin/:entity`, `/admin/:entity/:id` | équipe |
| DELETE | `/admin/:entity/:id` | admin |
| POST | `/admin/media` (champ `file`, renvoie `{ url }`) | équipe |

`:entity` = `persons`, `places`, `events`, `sources` ou `testimonies`. Les médias téléversés sont servis sur `/media/…`.

## Administration (`/admin`)

Après connexion de l'équipe, `/admin` donne accès aux contributions du public et aux 5 types de fiches.
Les formulaires sont générés à partir de `frontend/src/constants/adminEntities.ts` : pour ajouter un champ,
l'ajouter au modèle Mongoose puis à cette configuration. Types de champs disponibles : texte, texte bilingue,
date avec précision, liste de choix, liens vers d'autres fiches, affirmations (sources + fiabilité + statut),
« ce que l'on ne sait pas », consentement et visibilité, position sur le plan (clic), photos, médias téléversés.

Une nouvelle fiche est créée au statut « Proposée » : elle n'apparaît sur le site qu'une fois passée à « Validée ».
Seul l'admin peut supprimer une fiche ; pour la retirer du site sans la perdre, la passer à « Refusée ».

### Comptes de l'équipe

- `/admin/comptes` (admin) : créer un compte avec un mot de passe provisoire (bouton « Générer »), changer le rôle,
  générer un nouveau mot de passe, supprimer. Les identifiants ne s'affichent qu'une fois : les transmettre en privé.
- `/admin/mon-compte` (tout membre) : changer son mot de passe.
- Rôles : **modérateur** (saisit les fiches, modère les contributions) et **admin** (gère aussi les comptes, peut supprimer).
- Garde-fous : on ne peut ni supprimer son propre compte, ni retirer son propre rôle admin, ni supprimer le dernier admin.

## Archives publiées (`/archives`)

Les contributions du public apparaissent ici **uniquement** si l'équipe les a validées **et** si la personne a accepté
la publication. Le nom est raccourci (« Marie D. »), l'adresse e-mail n'est jamais exposée. Les fichiers joints
(images, PDF, audio) deviennent alors consultables.

## La communauté du fort (`/communaute`)

Réseau thématique demandé par le prof : les visiteurs créent un compte **membre** (distinct des comptes de l'équipe,
un membre ne peut jamais accéder à `/admin`), publient (discussion, question, archive, souvenir, recherche) avec image
et sujets, commentent, aiment, signalent. Pages : fil avec recherche et filtres, `/communaute/rejoindre`,
profil `/communaute/membres/:id` (modifiable par son propriétaire), publication seule `/communaute/publication/:id`.

- Les publications sont en ligne immédiatement ; l'équipe traite les signalements dans `/admin/communaute`
  (masquer / conserver avec motif, suspendre un membre).
- Une publication de type « archive » affiche qu'elle **n'est pas vérifiée** et renvoie vers « Contribuer » :
  seul ce circuit fait entrer un document au mémorial.
- Des membres, publications et archives **d'exemple** (fictifs, marqués « exemple ») sont créés au premier démarrage
  par `backend/src/seed/communityExamples.ts` ; à supprimer avant la mise en ligne.

## Prochaines étapes

- [ ] Remplacer `frontend/public/plan-fort.svg` par le vrai plan (1000 × 700) et placer les lieux
- [ ] Saisir les vraies données à partir des dossiers de l'historien
- [ ] Ajouter la police OpenDyslexic dans `frontend/public/fonts/`
- [ ] Intégrer le teaser sur la page d'accueil
- [ ] Hébergement (à décider)
