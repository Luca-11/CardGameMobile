# 📱 Instructions pour le simulateur iOS

## Installation de Xcode (Optionnel)

Si vous souhaitez utiliser le simulateur iOS au lieu d'un iPhone physique :

### 1. Installer Xcode

- Ouvrez l'App Store sur votre Mac
- Recherchez "Xcode"
- Téléchargez et installez Xcode (environ 15 GB, peut prendre 1-2 heures)

### 2. Configurer le simulateur

Après installation de Xcode :

```bash
# Vérifier que Xcode est installé
xcode-select --install

# Lister les simulateurs disponibles
xcrun simctl list devices available

# Lancer un simulateur spécifique (exemple iPhone 15)
xcrun simctl boot "iPhone 15"
```

### 3. Lancer sur simulateur

Une fois Xcode installé, dans votre terminal Expo, appuyez sur :

- **`i`** pour ouvrir le simulateur iOS
- Le simulateur se lancera automatiquement avec votre app

## Avantages du simulateur vs iPhone physique

### Simulateur iOS ✅

- Pas besoin d'iPhone physique
- Tests rapides et faciles
- Outils de debug intégrés
- Différentes tailles d'écran

### iPhone physique ✅

- Tests de performances réels
- Capteurs réels (gyroscope, accéléromètre)
- Test de la connectivité réseau réelle
- Expérience utilisateur authentique

## Recommandation

Pour le développement initial, l'iPhone physique avec Expo Go est plus rapide à mettre en place.
