#!/bin/bash

# ========================================
# DIAGNOSTIC BASE LOCALE AVEC DOCKER
# ========================================

echo "🔍 Début du diagnostic de la base locale..."

# Configuration pour la base locale (depuis docker-compose.yml)
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="cardgame"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"

echo "📋 Utilisation des paramètres de connexion de docker-compose.yml"

echo "📊 Connexion à la base de données locale..."

# Créer un fichier temporaire avec les requêtes de diagnostic
cat > temp_diagnostic_local.sql << 'EOF'
-- Diagnostic rapide de la base locale
\echo '=== TABLES EXISTANTES ==='
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

\echo '=== FONCTIONS ==='
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

\echo '=== UTILISATEURS ==='
SELECT id, username, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

\echo '=== SOLDES ==='
SELECT user_id, balance 
FROM user_balances 
ORDER BY balance DESC 
LIMIT 5;

\echo '=== PACKS ==='
SELECT id, name, price, is_active, created_at 
FROM card_packs 
ORDER BY price;

\echo '=== CARTES PAR RARETÉ ==='
SELECT rarity, COUNT(*) as count 
FROM cards 
GROUP BY rarity 
ORDER BY count DESC;

\echo '=== CARTES UTILISATEURS ==='
SELECT user_id, COUNT(*) as card_count 
FROM user_cards 
GROUP BY user_id 
ORDER BY card_count DESC 
LIMIT 5;

\echo '=== TABLES OBSOLÈTES ==='
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('packs', 'user_packs', 'pack_purchases')
ORDER BY table_name;

\echo '=== STATISTIQUES ==='
SELECT 'Utilisateurs' as type, COUNT(*) as count FROM users
UNION ALL
SELECT 'Cartes totales', COUNT(*) FROM cards
UNION ALL
SELECT 'Packs actifs', COUNT(*) FROM card_packs WHERE is_active = TRUE
UNION ALL
SELECT 'Cartes utilisateurs', COUNT(*) FROM user_cards
UNION ALL
SELECT 'Decks', COUNT(*) FROM decks;
EOF

# Exécuter le diagnostic avec Docker (connexion au conteneur local)
echo "🚀 Exécution du diagnostic sur la base locale..."

# Option 1: Se connecter directement au conteneur cardgame_postgres
docker exec -i cardgame_postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < temp_diagnostic_local.sql

# Nettoyer le fichier temporaire
rm temp_diagnostic_local.sql

echo "✅ Diagnostic local terminé !" 