# 🐳 Configuration Docker pour CardGame

## 🚀 Démarrage rapide

### 1. Lancer les services

```bash
docker-compose up -d
```

### 2. Accéder à pgAdmin

- **URL** : http://localhost:8080
- **Email** : admin@cardgame.com
- **Mot de passe** : admin123

### 3. Connexion à la base de données

Dans pgAdmin, ajoutez un nouveau serveur avec :

- **Nom** : CardGame
- **Host** : postgres
- **Port** : 5432
- **Database** : cardgame
- **Username** : postgres
- **Password** : postgres

## 📊 Structure de la base de données

### Tables principales :

- **`cards`** - Cartes disponibles dans le jeu
- **`card_packs`** - Packs de cartes à acheter
- **`users`** - Utilisateurs du jeu
- **`user_balances`** - Solde des utilisateurs
- **`user_cards`** - Collection de cartes des utilisateurs
- **`decks`** - Decks des utilisateurs
- **`deck_cards`** - Cartes dans les decks

### Fonctions :

- **`open_pack(user_id, pack_id)`** - Ouvrir un pack et obtenir des cartes

## 🧪 Tests

### Utilisateur de test :

- **ID** : `550e8400-e29b-41d4-a716-446655440000`
- **Username** : `testuser`
- **Solde initial** : 1000

### Packs disponibles :

- **Pack de Base** (100 pièces) - Cartes communes
- **Pack Premium** (250 pièces) - Cartes rares
- **Pack Légendaire** (500 pièces) - Cartes épiques

## 🔧 Commandes utiles

### Voir les logs

```bash
docker-compose logs -f postgres
docker-compose logs -f pgadmin
```

### Arrêter les services

```bash
docker-compose down
```

### Redémarrer les services

```bash
docker-compose restart
```

### Supprimer tout (attention : supprime les données)

```bash
docker-compose down -v
```

## 🎯 Utilisation dans l'application

### Connexion depuis votre app :

```javascript
// Configuration Supabase
const supabaseUrl = "http://localhost:5432";
const supabaseKey = "your-key";

// Ou connexion directe PostgreSQL
const connectionString =
  "postgresql://postgres:postgres@localhost:5432/cardgame";
```

### Test de la fonction open_pack :

```sql
-- Ouvrir un pack
SELECT * FROM open_pack(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    (SELECT id FROM card_packs WHERE name = 'Pack de Base' LIMIT 1)
);
```

## 🐛 Dépannage

### Port déjà utilisé

Si le port 5432 est déjà utilisé par votre PostgreSQL local :

```bash
# Modifier le port dans docker-compose.yml
ports:
  - "5433:5432"  # Utiliser le port 5433 au lieu de 5432
```

### pgAdmin ne démarre pas

```bash
# Vérifier les logs
docker-compose logs pgadmin

# Redémarrer le service
docker-compose restart pgadmin
```

### Base de données vide

```bash
# Réinitialiser complètement
docker-compose down -v
docker-compose up -d
```
