import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const IMAGE_CACHE_KEY = "@cardgame:image_cache";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface CacheEntry {
  localUri: string;
  timestamp: number;
}

interface CacheMap {
  [url: string]: CacheEntry;
}

export const useImageCache = (url: string | null) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      try {
        // Charger le cache
        const cacheJson = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
        const cache: CacheMap = cacheJson ? JSON.parse(cacheJson) : {};

        // Vérifier si l'image est en cache et n'est pas expirée
        const cacheEntry = cache[url];
        if (cacheEntry) {
          const isExpired = Date.now() - cacheEntry.timestamp > CACHE_EXPIRY;
          if (!isExpired) {
            // Vérifier si le fichier existe toujours
            const fileInfo = await FileSystem.getInfoAsync(cacheEntry.localUri);
            if (fileInfo.exists) {
              if (isMounted) {
                setLocalUri(cacheEntry.localUri);
                setLoading(false);
              }
              return;
            }
          }
        }

        // Télécharger l'image
        const filename = url.split("/").pop() || "image";
        const localUri = `${FileSystem.cacheDirectory}${filename}`;

        const downloadResult = await FileSystem.downloadAsync(url, localUri);

        if (downloadResult.status !== 200) {
          throw new Error("Échec du téléchargement de l'image");
        }

        // Mettre à jour le cache
        cache[url] = {
          localUri: downloadResult.uri,
          timestamp: Date.now(),
        };

        await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));

        if (isMounted) {
          setLocalUri(downloadResult.uri);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'image:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [url]);

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const cleanCache = async () => {
      try {
        const cacheJson = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
        if (!cacheJson) return;

        const cache: CacheMap = JSON.parse(cacheJson);
        const now = Date.now();
        let hasChanges = false;

        // Supprimer les entrées expirées
        for (const [url, entry] of Object.entries(cache)) {
          if (now - entry.timestamp > CACHE_EXPIRY) {
            try {
              await FileSystem.deleteAsync(entry.localUri);
              delete cache[url];
              hasChanges = true;
            } catch (err) {
              console.warn("Erreur lors de la suppression du fichier:", err);
            }
          }
        }

        if (hasChanges) {
          await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
        }
      } catch (err) {
        console.error("Erreur lors du nettoyage du cache:", err);
      }
    };

    cleanCache();
  }, []);

  return { localUri, loading, error };
};

export default useImageCache;
