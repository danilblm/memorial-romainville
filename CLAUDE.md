# CLAUDE.md – Mémorial numérique du Fort de Romainville

Consignes pour l'assistant IA (Claude Code) qui travaille sur ce dépôt.
Projet M2 THYP – Paris 8. Un seul développeur dans le groupe : Danil.

## Le projet en une phrase

Un site mémoriel sur les femmes résistantes et déportées passées par le Fort de Romainville :
chaque information affichée doit pouvoir être **vérifiée** (sources, niveau de fiabilité, ce que l'on ne sait pas).

## Stack

- **frontend/** : React 18 + Vite + TypeScript, Tailwind 4 (site public), MUI (administration),
  react-router, react-i18next (FR/EN), react-leaflet (carte), framer-motion.
- **backend/** : Node 20 + Express + TypeScript, MongoDB (Mongoose), zod (validation), JWT + bcrypt (comptes),
  multer + GridFS (fichiers stockés dans la base).
- **En ligne** : Vercel (site, branche `main`), Render (API, `render.yaml`), MongoDB Atlas (base).

## Commandes

```bash
cd backend  && npm run dev     # API sur http://localhost:3001
cd frontend && npm run dev     # site sur http://localhost:5173
cd frontend && npx tsc -b      # vérifier les types avant de publier
cd backend  && npm run sauvegarde | npm run restauration
```

## Règles du modèle de données (à ne jamais casser)

- On enregistre des **affirmations** (`claims`), pas des faits : chacune a ses sources, un niveau de fiabilité,
  un statut et l'indicateur `aiAssisted` (affiché au public quand l'IA a aidé).
- **Seul le statut `valide` est publié** (`backend/src/services/publicFilters.ts`).
- Chaque fiche garde un champ « Ce que l'on ne sait pas » (`missingInfo`).
- Les e-mails des contributeurs et des membres ne sont **jamais** renvoyés par l'API publique.
- Les contenus de la communauté sont en ligne tout de suite ; l'équipe modère après signalement.

## Façon de travailler

- **Langue** : code et noms en anglais, commentaires et textes de l'interface en français ;
  tout texte visible passe par `i18n/fr.json` et `i18n/en.json` (jamais de texte en dur côté public).
- **Style** : interface sobre et mémorielle, pas de texte qui « sonne IA » ; phrases courtes et simples.
- **Accessibilité** : garder les réglages (taille du texte, contraste élevé, police dyslexie), les `alt`, les `aria-label`.
- **Vérifier avant de dire « c'est fait »** : `npx tsc -b`, puis contrôle dans le navigateur
  (ordinateur 1024 / 1280 / 1920 px et téléphone).
- **Git** : travailler sur `feature/communaute-archives`, puis avancer `main` en fast-forward ;
  pousser `main` met le site en ligne à jour (Vercel). L'API Render se redéploie à la main.

## Ne jamais faire

- Committer un fichier `.env` (`backend/.env`, `backend/.env.atlas`) ou afficher un mot de passe, une clé, une URL de base.
- Inventer des faits historiques ou des sources : en cas de doute, laisser vide et le signaler.
- Supprimer des données de la base sans le demander d'abord.
