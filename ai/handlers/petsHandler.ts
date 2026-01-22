/**
 * Pets Handler
 * Handles creation and management of pets
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { Pet } from "@/types/home";
import { logger } from "@/lib/logger";

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

export interface PetPreview {
  preview: Pet;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class PetsHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: PetPayload): Promise<void> {
    return this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   */
  async propose(payload: PetPayload): Promise<PetPreview> {
    const validation = this.validate(payload);
    
    const preview: Pet = {
      id: `temp_${Date.now()}`,
      name: payload.name,
      type: payload.type,
      breed: payload.breed,
      age: payload.age,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };
    
    const impacts = [`Adds 1 pet: "${payload.name}"`];
    if (payload.type) impacts.push(`Type: ${payload.type}`);
    if (payload.breed) impacts.push(`Breed: ${payload.breed}`);
    if (payload.age) impacts.push(`Age: ${payload.age}`);
    
    return { preview, validation, impacts };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   */
  async execute(payload: PetPayload): Promise<Pet> {
    if (typeof window === 'undefined' || !window.localStorage) {
      logger.error('localStorage is not available. Cannot create pet.');
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
      return pet;
    } catch (error) {
      logger.error('Failed to save pet to localStorage', error);
      throw new Error('Failed to save pet');
    }
  }

  /**
   * Update an existing pet
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<PetPayload>): Promise<Pet> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Pet ID is required for update');
    }

    const stored = localStorage.getItem("pets");
    const pets: Pet[] = stored ? JSON.parse(stored) : [];
    
    const petIndex = pets.findIndex(p => p.id === payload.id);
    if (petIndex === -1) {
      throw new Error(`Pet with ID ${payload.id} not found`);
    }

    const updatedPet: Pet = {
      ...pets[petIndex],
      ...(payload.name && { name: payload.name }),
      ...(payload.type && { type: payload.type }),
      ...(payload.breed !== undefined && { breed: payload.breed }),
      ...(payload.age !== undefined && { age: payload.age }),
      ...(payload.notes !== undefined && { notes: payload.notes }),
    };

    pets[petIndex] = updatedPet;
    localStorage.setItem("pets", JSON.stringify(pets));
    
    logger.info('Pet updated successfully', { petId: updatedPet.id });
    return updatedPet;
  }

  /**
   * Delete a pet
   * SAFETY: Requires valid ID and validates existence
   */
  async delete(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Pet ID is required for delete');
    }

    const stored = localStorage.getItem("pets");
    const pets: Pet[] = stored ? JSON.parse(stored) : [];
    
    const petIndex = pets.findIndex(p => p.id === payload.id);
    if (petIndex === -1) {
      throw new Error(`Pet with ID ${payload.id} not found`);
    }

    pets.splice(petIndex, 1);
    localStorage.setItem("pets", JSON.stringify(pets));
    
    logger.info('Pet deleted successfully', { petId: payload.id });
  }

  private validate(payload: PetPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload.name || payload.name.trim() === '') {
      errors.push('Pet name is required');
    }
    if (!payload.type || payload.type.trim() === '') {
      errors.push('Pet type is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const petsHandler = new PetsHandler();
