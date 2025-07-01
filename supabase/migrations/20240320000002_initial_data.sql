-- Insertion des packs de base
INSERT INTO card_packs (name, description, price, cards_per_pack, rarity_weights, guaranteed_rarity) VALUES
    ('Pack de Démarrage', 'Un pack parfait pour débuter, contenant principalement des cartes communes et peu communes.', 100, 5, 
    '{
        "common": 70,
        "uncommon": 25,
        "rare": 5,
        "epic": 0,
        "legendary": 0
    }'::jsonb, 'common'),
    
    ('Pack Élémentaire', 'Contient des cartes élémentaires puissantes avec une chance accrue d''obtenir des cartes rares.', 200, 5,
    '{
        "common": 50,
        "uncommon": 35,
        "rare": 13,
        "epic": 2,
        "legendary": 0
    }'::jsonb, 'uncommon'),
    
    ('Pack Premium', 'Garantit au moins une carte rare ou mieux.', 500, 5,
    '{
        "common": 30,
        "uncommon": 40,
        "rare": 25,
        "epic": 4,
        "legendary": 1
    }'::jsonb, 'rare'),
    
    ('Pack Légendaire', 'Garantit au moins une carte épique et une chance accrue d''obtenir une carte légendaire.', 1000, 5,
    '{
        "common": 0,
        "uncommon": 20,
        "rare": 45,
        "epic": 25,
        "legendary": 10
    }'::jsonb, 'epic');

-- Insertion des cartes de base
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost, attack, defense) VALUES
    -- Créatures communes
    ('Gobelin Fouineur', 'Un petit gobelin rusé et rapide', 'creature', 'earth', 'common', 1, 1, 1),
    ('Soldat de la Garde', 'Un soldat loyal et dévoué', 'creature', 'neutral', 'common', 2, 2, 2),
    ('Élémentaire de Feu', 'Une flamme vivante', 'creature', 'fire', 'common', 2, 3, 1),
    
    -- Créatures peu communes
    ('Mage des Arcanes', 'Un pratiquant des arts mystiques', 'creature', 'neutral', 'uncommon', 3, 2, 3),
    ('Dragon Juvénile', 'Un jeune dragon en pleine croissance', 'creature', 'fire', 'uncommon', 4, 4, 3),
    
    -- Créatures rares
    ('Géant des Tempêtes', 'Un colosse né des orages', 'creature', 'air', 'rare', 6, 6, 6),
    ('Hydre Venimeuse', 'Une créature mortelle aux multiples têtes', 'creature', 'water', 'rare', 7, 7, 7),
    
    -- Sorts communs
    ('Éclair', 'Lance un éclair sur une cible', 'spell', 'air', 'common', 1, NULL, NULL),
    ('Soin Mineur', 'Restaure un peu de vie', 'spell', 'light', 'common', 2, NULL, NULL),
    
    -- Sorts peu communs
    ('Boule de Feu', 'Une explosion de flammes dévastatrice', 'spell', 'fire', 'uncommon', 3, NULL, NULL),
    ('Bouclier de Glace', 'Protège une créature', 'spell', 'water', 'uncommon', 2, NULL, NULL),
    
    -- Équipements communs
    ('Épée Courte', 'Une arme simple mais efficace', 'equipment', 'neutral', 'common', 2, 2, 0),
    ('Bouclier en Bois', 'Une protection basique', 'equipment', 'neutral', 'common', 1, 0, 2),
    
    -- Équipements peu communs
    ('Bâton de Mage', 'Amplifie les sorts', 'equipment', 'neutral', 'uncommon', 3, 1, 1),
    ('Armure de Plates', 'Une protection solide', 'equipment', 'neutral', 'uncommon', 4, 0, 4); 