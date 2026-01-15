/**
 * Pets Handler
 * Handles creation and management of pets
 */

import type { Pet } from "@/types/home";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

interface PetPayload {
  name: string;
  type: string;
  breed?: string;
  age?: number;
  notes?: string;
}

class PetsHandler implements ModuleHandler {
  async create(payload: PetPayload): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('❌ localStorage is not available. Cannot create pet.');
      throw new Error('localStorage is not available');
    }

    try {
      const stored = localStorage.getItem("pets");
      const pets: Pet[] = stored ? JSON.parse(stored) : [];

      const pet: Pet = {
        id: `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: payload.name,
        type: payload.type,
        breed: payload.breed,
        age: payload.age,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
      };

      pets.push(pet);
      localStorage.setItem("pets", JSON.stringify(pets));
      console.log('✅ Pet created and saved:', pet);
    } catch (error) {
      console.error('❌ Failed to save pet to localStorage:', error);
      throw new Error('Failed to save pet');
    }
  }
}

export const petsHandler = new PetsHandler();
