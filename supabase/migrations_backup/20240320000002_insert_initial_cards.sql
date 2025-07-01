-- Créatures
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost, attack, defense) VALUES
-- Créatures communes
('Gobelin Éclaireur', 'Un petit gobelin rapide et agile.', 'creature', 'fire', 'common', 1, 1, 1),
('Soldat de la Garde', 'Un soldat loyal et dévoué.', 'creature', 'light', 'common', 2, 2, 2),
('Loup des Plaines', 'Un prédateur solitaire.', 'creature', 'earth', 'common', 2, 2, 1),
('Élémentaire d''Eau', 'Une créature faite d''eau pure.', 'creature', 'water', 'common', 2, 1, 3),

-- Créatures peu communes
('Chevalier du Crépuscule', 'Un guerrier mystérieux aux pouvoirs obscurs.', 'creature', 'dark', 'uncommon', 3, 3, 2),
('Mage des Vents', 'Un sage maîtrisant les courants d''air.', 'creature', 'air', 'uncommon', 3, 2, 3),
('Golem de Pierre', 'Un colosse de roche animé par la magie.', 'creature', 'earth', 'uncommon', 4, 2, 5),

-- Créatures rares
('Dragon de Feu', 'Un puissant dragon cracheur de flammes.', 'creature', 'fire', 'rare', 6, 5, 4),
('Ange Gardien', 'Un protecteur céleste aux ailes dorées.', 'creature', 'light', 'rare', 5, 3, 5),
('Kraken des Abysses', 'Une terreur des océans.', 'creature', 'water', 'rare', 7, 6, 6),

-- Créatures épiques
('Phénix Immortel', 'Un oiseau légendaire renaissant de ses cendres.', 'creature', 'fire', 'epic', 8, 6, 6),
('Titan des Tempêtes', 'Un géant contrôlant les éléments.', 'creature', 'air', 'epic', 8, 7, 7),

-- Créatures légendaires
('Ancien Dragon Céleste', 'Le plus puissant des dragons.', 'creature', 'light', 'legendary', 10, 8, 8),
('Seigneur des Ténèbres', 'Le maître absolu de l''obscurité.', 'creature', 'dark', 'legendary', 10, 9, 7),

-- Sorts
-- Sorts communs
('Boule de Feu', 'Inflige 3 points de dégâts à une cible.', 'spell', 'fire', 'common', 2, NULL, NULL),
('Soin Mineur', 'Restaure 2 points de vie.', 'spell', 'light', 'common', 1, NULL, NULL),
('Bouclier de Glace', 'Protège une créature des dégâts pendant un tour.', 'spell', 'water', 'common', 2, NULL, NULL),

-- Sorts peu communs
('Tempête de Sable', 'Inflige 2 points de dégâts à toutes les créatures.', 'spell', 'earth', 'uncommon', 3, NULL, NULL),
('Éclair de Foudre', 'Inflige 4 points de dégâts à une cible.', 'spell', 'air', 'uncommon', 3, NULL, NULL),

-- Sorts rares
('Résurrection', 'Ramène une créature du cimetière sur le champ de bataille.', 'spell', 'light', 'rare', 5, NULL, NULL),
('Malédiction Mortelle', 'Détruit une créature ciblée.', 'spell', 'dark', 'rare', 6, NULL, NULL),

-- Sorts épiques
('Jugement Divin', 'Détruit toutes les créatures sauf les vôtres.', 'spell', 'light', 'epic', 8, NULL, NULL),
('Cataclysme', 'Inflige 5 points de dégâts à tout le monde.', 'spell', 'fire', 'epic', 7, NULL, NULL),

-- Équipements
-- Équipements communs
('Épée Courte', 'La créature équipée gagne +1/+0.', 'equipment', 'neutral', 'common', 1, NULL, NULL),
('Bouclier en Bois', 'La créature équipée gagne +0/+1.', 'equipment', 'neutral', 'common', 1, NULL, NULL),

-- Équipements peu communs
('Armure de Plates', 'La créature équipée gagne +0/+2.', 'equipment', 'neutral', 'uncommon', 2, NULL, NULL),
('Épée Longue', 'La créature équipée gagne +2/+0.', 'equipment', 'neutral', 'uncommon', 2, NULL, NULL),

-- Équipements rares
('Lame du Dragon', 'La créature équipée gagne +3/+1 et Souffle de feu.', 'equipment', 'fire', 'rare', 4, NULL, NULL),
('Armure Enchantée', 'La créature équipée gagne +1/+3 et Résistance à la magie.', 'equipment', 'light', 'rare', 4, NULL, NULL),

-- Équipements épiques
('Excalibur', 'La créature équipée gagne +4/+4 et Frappe divine.', 'equipment', 'light', 'epic', 6, NULL, NULL),
('Faux des Ténèbres', 'La créature équipée gagne +5/+2 et Drain de vie.', 'equipment', 'dark', 'epic', 6, NULL, NULL);

-- Donner quelques cartes de base à tous les utilisateurs existants
INSERT INTO user_cards (user_id, card_id, quantity)
SELECT 
    users.id,
    cards.id,
    CASE 
        WHEN cards.rarity = 'common' THEN 3
        WHEN cards.rarity = 'uncommon' THEN 2
        ELSE 1
    END as quantity
FROM auth.users
CROSS JOIN cards
WHERE cards.rarity IN ('common', 'uncommon');

-- Insertion des créatures de base
INSERT INTO cards (name, description, rarity, type, element, attack, defense, mana_cost) VALUES
    ('Dragon de Feu', 'Un puissant dragon cracheur de feu', 'rare', 'creature', 'fire', 6, 5, 7),
    ('Golem de Pierre', 'Une créature massive faite de roche', 'uncommon', 'creature', 'earth', 4, 7, 6),
    ('Sirène', 'Une créature marine enchanteresse', 'uncommon', 'creature', 'water', 3, 4, 4),
    ('Phénix', 'Un oiseau légendaire renaissant de ses cendres', 'legendary', 'creature', 'fire', 7, 4, 8),
    ('Esprit de l''Air', 'Un élémentaire d''air insaisissable', 'common', 'creature', 'air', 2, 3, 3),
    ('Ange Gardien', 'Un protecteur céleste', 'rare', 'creature', 'light', 4, 6, 6),
    ('Démon des Abysses', 'Une créature démoniaque redoutable', 'epic', 'creature', 'dark', 8, 3, 7),
    ('Guerrier', 'Un combattant aguerri', 'common', 'creature', 'neutral', 3, 3, 3);

-- Insertion des sorts de base
INSERT INTO cards (name, description, rarity, type, element, mana_cost) VALUES
    ('Boule de Feu', 'Lance une boule de feu qui inflige 4 points de dégâts', 'common', 'spell', 'fire', 3),
    ('Vague Déferlante', 'Repousse toutes les créatures ennemies', 'uncommon', 'spell', 'water', 4),
    ('Mur de Pierre', 'Invoque un mur protecteur', 'common', 'spell', 'earth', 2),
    ('Tempête', 'Déchaîne une tempête dévastatrice', 'rare', 'spell', 'air', 6),
    ('Guérison Divine', 'Restaure 5 points de vie', 'common', 'spell', 'light', 3),
    ('Malédiction', 'Réduit l''attaque et la défense d''une créature', 'uncommon', 'spell', 'dark', 4),
    ('Méditation', 'Pioche 2 cartes', 'common', 'spell', 'neutral', 2);

-- Insertion des équipements de base
INSERT INTO cards (name, description, rarity, type, element, mana_cost) VALUES
    ('Épée de Feu', 'Augmente l''attaque de 2 et inflige des dégâts de feu', 'uncommon', 'equipment', 'fire', 3),
    ('Armure de Glace', 'Augmente la défense de 3 et protège des effets de feu', 'rare', 'equipment', 'water', 4),
    ('Bouclier de Terre', 'Augmente la défense de 2', 'common', 'equipment', 'earth', 2),
    ('Bottes du Vent', 'Permet à la créature équipée d''attaquer immédiatement', 'uncommon', 'equipment', 'air', 3),
    ('Amulette de Lumière', 'Immunise contre les effets sombres', 'rare', 'equipment', 'light', 4),
    ('Dague des Ombres', 'Augmente l''attaque de 1 et permet d''attaquer deux fois', 'epic', 'equipment', 'dark', 5),
    ('Bâton de Combat', 'Augmente l''attaque de 1', 'common', 'equipment', 'neutral', 2);

-- Insertion des packs de base
INSERT INTO card_packs (name, description, price, cards_per_pack) VALUES
    ('Pack de Démarrage', 'Un pack parfait pour débuter', 100, 5),
    ('Pack Élémentaire', 'Contient des cartes élémentaires puissantes', 200, 5),
    ('Pack Premium', 'Garantit au moins une carte rare ou mieux', 500, 5),
    ('Pack Légendaire', 'Garantit au moins une carte épique ou légendaire', 1000, 5); 