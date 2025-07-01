# 🎮 CardGame - Jeu de cartes à collectionner

Application mobile React Native de jeu de cartes à collectionner avec backend Supabase.

## 🚀 Technologies utilisées

- **Frontend** : React Native avec Expo
- **Backend** : Supabase (authentification, base de données, fonctions edge)
- **Base de données** : PostgreSQL via Supabase
- **Navigation** : React Navigation v6
- **Gestion d'état** : Zustand
- **Styling** : NativeWind (Tailwind CSS pour React Native)
- **Stockage local** : AsyncStorage

## 📋 Fonctionnalités

### MVP (Version 1.0)

- ✅ Authentification utilisateur (inscription/connexion)
- ✅ Dashboard d'accueil
- ✅ Système de récompenses journalières
- ✅ Navigation principale avec tabs
- ⏳ Collection de cartes
- ⏳ Boutique et achat de packs
- ⏳ Deck builder
- ⏳ Système de jeu PvP

### Fonctionnalités futures

- Match-making en ligne
- Tournois
- Chat en jeu
- Système de classement
- Échanges entre joueurs

## 🛠️ Installation et configuration

### 1. Prérequis

- Node.js >= 16
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Compte Supabase

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Créez un fichier `.env` à la racine du projet :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Exécutez les scripts SQL pour créer les tables (voir section "Schema de base de données")

### 4. Lancement de l'application

```bash
npm start
```

## 🗃️ Schema de base de données

Exécutez ces requêtes SQL dans l'éditeur SQL de Supabase :

```sql
-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  daily_reward_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des cartes
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  rarity VARCHAR(50) NOT NULL,
  image_url TEXT,
  description TEXT,
  attack INTEGER,
  defense INTEGER,
  cost INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des cartes possédées par les utilisateurs
CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des packs disponibles
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  card_pool TEXT[] NOT NULL,
  card_count INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des packs achetés par les utilisateurs
CREATE TABLE user_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des decks
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  cards TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES users(id),
  match_data JSONB,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les cartes utilisateur
CREATE POLICY "Users can view own cards" ON user_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON user_cards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les packs utilisateur
CREATE POLICY "Users can view own packs" ON user_packs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packs" ON user_packs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packs" ON user_packs FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les decks
CREATE POLICY "Users can manage own decks" ON decks FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);
```

## 📱 Structure du projet

```
src/
├── components/          # Composants réutilisables
├── navigation/          # Configuration de navigation
├── screens/             # Écrans de l'application
├── services/            # Services (Supabase, API)
├── stores/              # Gestion d'état (Zustand)
├── types/               # Types TypeScript
├── hooks/               # Hooks personnalisés
└── utils/               # Fonctions utilitaires
```

## 🎯 Roadmap de développement

### Phase 1 - MVP (En cours)

- [x] Configuration projet et authentification
- [x] Navigation et écrans de base
- [x] Dashboard d'accueil
- [ ] Système de cartes et collection
- [ ] Boutique et packs
- [ ] Deck builder basique

### Phase 2 - Gameplay

- [ ] Système de jeu en local
- [ ] Match-making
- [ ] Règles de jeu avancées
- [ ] Animations et effets

### Phase 3 - Social et progression

- [ ] Système de classement
- [ ] Tournois
- [ ] Chat et amis
- [ ] Achievements

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème, créez une issue dans le repository GitHub.

---

**Bon jeu ! 🎮✨**
