# ADAPI — API REST de La Remise

API REST exposant les données de La Remise (ressourcerie) : catégories, objets, dépôts et personnes. Construite avec Node.js, Express et le driver `pg` (sans ORM), branchée sur une base PostgreSQL fournie.

## Installation et lancement

### Prérequis
- Node.js
- PostgreSQL (via Docker, recommandé, ou une instance locale)

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
Copie `.env.example` en `.env` et renseigne tes propres valeurs :
```bash
cp .env.example .env
```

Variables attendues :
| Variable | Description |
|---|---|
| `PORT` | Port d'écoute du serveur Express |
| `PGHOST` | Hôte PostgreSQL |
| `PGPORT` | Port PostgreSQL |
| `PGUSER` | Utilisateur PostgreSQL |
| `PGPASSWORD` | Mot de passe PostgreSQL |
| `PGDATABASE` | Nom de la base (`laremise`) |

### 3. Démarrer PostgreSQL
Avec Docker :
```bash
docker compose up -d
```

### 4. Importer la base
```bash
psql -h localhost -p <PGPORT> -U postgres -c "CREATE DATABASE laremise;"
psql -h localhost -p <PGPORT> -U postgres -d laremise -f db/migration_up.sql
psql -h localhost -p <PGPORT> -U postgres -d laremise -f db/seed.sql
```

Vérifie l'import : 79 objets, 30 dépôts, 22 personnes, dont 32 objets en rayon.
```bash
psql -h localhost -p <PGPORT> -U postgres -d laremise -c "SELECT COUNT(*) FROM objet;"
```

### 5. Lancer le serveur
```bash
npm start
```
ou, pendant le développement, avec rechargement automatique :
```bash
npm run dev
```

Le serveur écoute sur `http://localhost:<PORT>` (par défaut `http://localhost:3000`, sauf si tu as changé `PORT` dans ton `.env`).

## Routes disponibles

Toutes les routes sont préfixées par `/api`.

| Verbe | Route | Description | Statuts |
|---|---|---|---|
| GET | `/api/categories` | Liste des catégories (id, libelle) | 200 |
| GET | `/api/objets` | Liste des objets avec leur catégorie | 200 |
| GET | `/api/objets?statut=&categorie_id=` | Liste filtrée (filtres optionnels et cumulables) | 200 |
| GET | `/api/objets/:id` | Un objet, sa catégorie, son dépôt, sa donatrice | 200 / 404 |
| GET | `/api/depots/:id` | Un dépôt, sa donatrice, ses objets | 200 / 404 |
| POST | `/api/personnes` | Crée une donatrice (`nom`, `prenom`, `telephone?`, `adherente?`) | 201 / 400 |
| POST | `/api/depots` | Enregistre un dépôt (`personne_id`, `date_depot`, `type`) | 201 / 400 |
| POST | `/api/depots/:id/objets` | Ajoute un objet à un dépôt (`libelle`, `poids_kg`, `etat_arrivee`, `categorie_id`) | 201 / 400 / 404 |
| PATCH | `/api/objets/:id/statut` | Fait évoluer le statut d'un objet (`statut`, `prix?`) | 200 / 400 / 404 |
| GET | `/api/stats` | Objets par statut, poids total reçu, poids détourné de la déchetterie | 200 |

Valeurs d'enum acceptées :
- `statut` (objets) : `arrive`, `en_reparation`, `en_rayon`, `recycle`
- `etat_arrivee` (objets) : `bon_etat`, `a_reparer`, `hors_service`
- `type` (dépôts) : `boutique`, `domicile`

## Comment tester l'API

Les requêtes de test sont écrites avec l'extension **REST Client** de VS Code et versionnées dans le dossier `requetes/` (un fichier par ressource : `categories.http`, `objets.http`, `depots.http`, `personnes.http`, `stats.http`).

1. Installe l'extension **REST Client** (Huachao Mao) dans VS Code
2. Démarre le serveur (`npm start`)
3. Ouvre un fichier `.http` dans `requetes/`
4. Clique sur "Send Request" au-dessus de chaque requête

Chaque fichier contient au moins un cas nominal par route, ainsi que des cas d'erreur (identifiant inexistant, corps incomplet, valeur d'enum invalide).