/**
 * Audio Service
 * Handles audio hint playback with IndexedDB caching
 */

import { Language } from '../types';

export interface AudioService {
  playHint(fieldId: string, language: Language): Promise<void>;
  preloadAudio(language: Language): Promise<void>;
  isCached(fieldId: string, language: Language): Promise<boolean>;
}

class AudioServiceImpl implements AudioService {
  private readonly DB_NAME = 'ektamandi_audio';
  private readonly STORE_NAME = 'audio_cache';
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async playHint(fieldId: string, language: Language): Promise<void> {
    if (!this.db) await this.initDB();

    const cacheKey = `${fieldId}_${language}`;

    // Try to get from cache
    let audioBlob = await this.getFromCache(cacheKey);

    if (!audioBlob) {
      // Fetch from network
      try {
        const response = await fetch(`/audio/${language}/${fieldId}.mp3`);
        if (!response.ok) {
          throw new Error('Audio file not found');
        }
        audioBlob = await response.blob();

        // Cache for offline use
        await this.saveToCache(cacheKey, audioBlob);
      } catch (error) {
        console.error(`Failed to load audio: ${cacheKey}`, error);
        throw error;
      }
    }

    // Play audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (err) => {
        URL.revokeObjectURL(audioUrl);
        reject(err);
      };
      audio.play().catch(reject);
    });
  }

  async preloadAudio(language: Language): Promise<void> {
    const fields = ['mobile_number', 'otp', 'email', 'password', 'name'];

    await Promise.all(
      fields.map(fieldId => this.cacheAudio(fieldId, language))
    );
  }

  async isCached(fieldId: string, language: Language): Promise<boolean> {
    if (!this.db) await this.initDB();

    const cacheKey = `${fieldId}_${language}`;
    const cached = await this.getFromCache(cacheKey);
    return cached !== null;
  }

  private async cacheAudio(fieldId: string, language: Language): Promise<void> {
    const cacheKey = `${fieldId}_${language}`;

    if (await this.isCached(fieldId, language)) {
      return;
    }

    try {
      const response = await fetch(`/audio/${language}/${fieldId}.mp3`);
      if (!response.ok) return;
      
      const blob = await response.blob();
      await this.saveToCache(cacheKey, blob);
    } catch (error) {
      console.error(`Failed to cache audio: ${cacheKey}`, error);
    }
  }

  private async getFromCache(key: string): Promise<Blob | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.blob || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToCache(key: string, blob: Blob): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put({ id: key, blob, cachedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const audioService = new AudioServiceImpl();
