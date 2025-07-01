-- Insertion des créatures
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost, attack, defense) VALUES
-- Créatures communes (feu)
('Apprenti Pyromancien', 'Un jeune mage qui commence tout juste à maîtriser les flammes.', 'creature', 'fire', 'common', 2, 2, 1),
('Salamandre de Feu', 'Une petite créature agile qui laisse des traces brûlantes.', 'creature', 'fire', 'common', 1, 1, 1),

-- Créatures communes (eau)
('Ondine Novice', 'Une apprentie des océans qui manipule les courants.', 'creature', 'water', 'common', 2, 1, 3),
('Crabe de Cristal', 'Sa carapace reflète la lumière comme de l''eau gelée.', 'creature', 'water', 'common', 1, 1, 2),

-- Créatures communes (terre)
('Jeune Tréant', 'Un arbre à peine éveillé qui protège la forêt.', 'creature', 'earth', 'common', 2, 1, 4),
('Gnome Mineur', 'Il creuse inlassablement à la recherche de pierres précieuses.', 'creature', 'earth', 'common', 1, 2, 1),

-- Créatures communes (air)
('Sylphe Vagabond', 'Un esprit de l''air qui danse dans la brise.', 'creature', 'air', 'common', 2, 2, 1),
('Moineau Céleste', 'Un petit oiseau qui porte chance à son propriétaire.', 'creature', 'air', 'common', 1, 1, 1),

-- Créatures peu communes (feu)
('Gardien des Flammes', 'Un guerrier dont l''armure est forgée dans le feu éternel.', 'creature', 'fire', 'uncommon', 4, 3, 4),
('Renard de Lave', 'Sa fourrure brille comme de la lave en fusion.', 'creature', 'fire', 'uncommon', 3, 4, 2),

-- Créatures peu communes (eau)
('Prêtresse des Marées', 'Elle commande aux vagues avec grâce et précision.', 'creature', 'water', 'uncommon', 4, 2, 5),
('Serpent des Abysses', 'Une créature sinueuse qui se cache dans les profondeurs.', 'creature', 'water', 'uncommon', 3, 3, 3),

-- Créatures peu communes (terre)
('Golem d''Améthyste', 'Un gardien cristallin aux reflets violets.', 'creature', 'earth', 'uncommon', 4, 3, 4),
('Dryade Ancienne', 'Une protectrice de la forêt au pouvoir grandissant.', 'creature', 'earth', 'uncommon', 3, 2, 4),

-- Créatures rares (feu)
('Phénix Renaissant', 'Quand il est vaincu, il revient à la vie avec 1 point de vie.', 'creature', 'fire', 'rare', 6, 4, 4),
('Dragon de Magma', 'Ses écailles sont faites de roche en fusion.', 'creature', 'fire', 'rare', 7, 6, 5),

-- Créatures rares (eau)
('Léviathan Ancien', 'Un titan des mers qui commande aux tempêtes.', 'creature', 'water', 'rare', 7, 5, 7),
('Hydre Glaciale', 'Chaque fois qu''elle subit des dégâts, elle gagne +1/+1.', 'creature', 'water', 'rare', 6, 4, 6),

-- Créatures épiques
('Avatar de Feu', 'Incarne la puissance pure des flammes éternelles.', 'creature', 'fire', 'epic', 8, 8, 5),
('Titan des Océans', 'Son réveil provoque des raz-de-marée dévastateurs.', 'creature', 'water', 'epic', 8, 6, 8),
('Colosse de Diamant', 'Une entité cristalline d''une pureté absolue.', 'creature', 'earth', 'epic', 8, 5, 9),
('Seigneur des Tempêtes', 'Maître des vents et des éclairs.', 'creature', 'air', 'epic', 8, 7, 6),

-- Créatures légendaires
('Bahamut, Roi Dragon', 'Le souverain légendaire de tous les dragons.', 'creature', 'fire', 'legendary', 10, 10, 8),
('Poséidon, Dieu des Mers', 'Sa colère fait trembler les océans.', 'creature', 'water', 'legendary', 10, 8, 10),
('Gaia, Mère Nature', 'La terre elle-même prend vie pour protéger ses enfants.', 'creature', 'earth', 'legendary', 10, 7, 12),
('Éole, Maître des Vents', 'Celui qui commande aux quatre vents.', 'creature', 'air', 'legendary', 10, 9, 9);

-- Insertion des sorts
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost) VALUES
-- Sorts communs
('Trait de Feu', 'Inflige 2 points de dégâts à une cible.', 'spell', 'fire', 'common', 1),
('Vague Apaisante', 'Soigne 2 points de vie.', 'spell', 'water', 'common', 1),
('Bouclier de Pierre', 'Une créature gagne +0/+2 jusqu''à la fin du tour.', 'spell', 'earth', 'common', 1),
('Bourrasque', 'Une créature ne peut pas bloquer ce tour-ci.', 'spell', 'air', 'common', 1),

-- Sorts peu communs
('Explosion de Lave', 'Inflige 3 dégâts répartis comme vous le souhaitez.', 'spell', 'fire', 'uncommon', 3),
('Pluie Purificatrice', 'Soigne toutes vos créatures de 1 point de vie.', 'spell', 'water', 'uncommon', 3),
('Croissance Végétale', 'Une créature gagne +2/+2 et Vigilance.', 'spell', 'earth', 'uncommon', 3),
('Tornade', 'Renvoyez une créature dans la main de son propriétaire.', 'spell', 'air', 'uncommon', 3),

-- Sorts rares
('Météore', 'Inflige 5 dégâts à une créature et 2 à son contrôleur.', 'spell', 'fire', 'rare', 5),
('Déluge', 'Tap toutes les créatures adverses. Elles ne se dégagent pas au prochain tour.', 'spell', 'water', 'rare', 5),
('Éveil de la Nature', 'Cherchez jusqu''à deux cartes de créature dans votre deck.', 'spell', 'earth', 'rare', 5),
('Tempête Dévastatrice', 'Détruit toutes les créatures avec un vol.', 'spell', 'air', 'rare', 5),

-- Sorts épiques
('Éruption Volcanique', 'Inflige 7 dégâts à chaque créature et joueur.', 'spell', 'fire', 'epic', 7),
('Tsunami', 'Renvoyez toutes les créatures dans les mains de leurs propriétaires.', 'spell', 'water', 'epic', 7),
('Séisme', 'Détruit tous les équipements et inflige 4 dégâts à chaque créature.', 'spell', 'earth', 'epic', 7),
('Ouragan', 'Exilez toutes les créatures jusqu''à la fin du tour.', 'spell', 'air', 'epic', 7);

-- Insertion des équipements
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost) VALUES
-- Équipements communs
('Dague de Flammes', 'La créature équipée gagne +1/+0 et Célérité.', 'equipment', 'fire', 'common', 2),
('Amulette d''Eau', 'La créature équipée peut devenir imblocable en payant 2 manas.', 'equipment', 'water', 'common', 2),
('Bouclier de Granit', 'La créature équipée gagne +0/+2 et Vigilance.', 'equipment', 'earth', 'common', 2),
('Bottes du Vent', 'La créature équipée gagne Initiative.', 'equipment', 'air', 'common', 2),

-- Équipements peu communs
('Épée Ardente', 'La créature équipée gagne +2/+1 et inflige 1 dégât quand elle attaque.', 'equipment', 'fire', 'uncommon', 3),
('Trident des Marées', 'La créature équipée gagne +2/+2 et peut bloquer les créatures avec vol.', 'equipment', 'water', 'uncommon', 3),
('Armure de Ronces', 'La créature équipée gagne +1/+3 et inflige 1 dégât à qui la bloque.', 'equipment', 'earth', 'uncommon', 3),
('Cape des Nuages', 'La créature équipée gagne Vol et +1/+1.', 'equipment', 'air', 'uncommon', 3),

-- Équipements rares
('Lame du Dragon', 'La créature équipée gagne +3/+2 et peut infliger 2 dégâts à une cible.', 'equipment', 'fire', 'rare', 5),
('Couronne des Abysses', 'La créature équipée gagne +2/+4 et ne peut pas être ciblée par les sorts.', 'equipment', 'water', 'rare', 5),
('Marteau de Terra', 'La créature équipée gagne +4/+4 mais perd Initiative.', 'equipment', 'earth', 'rare', 5),
('Sceptre des Tempêtes', 'La créature équipée gagne +3/+1 et peut renvoyer une créature en main.', 'equipment', 'air', 'rare', 5),

-- Équipements épiques
('Épée Solaire', 'La créature équipée double son attaque et gagne Initiative.', 'equipment', 'fire', 'epic', 7),
('Kraken d''Acier', 'La créature équipée gagne +5/+5 et peut devenir imblocable.', 'equipment', 'water', 'epic', 7),
('Cuirasse de Gaia', 'La créature équipée gagne +3/+7 et Indestructible.', 'equipment', 'earth', 'epic', 7),
('Faux du Ciel', 'La créature équipée gagne Vol, Initiative et +4/+2.', 'equipment', 'air', 'epic', 7);

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
FROM users
CROSS JOIN cards
WHERE cards.rarity IN ('common', 'uncommon'); 