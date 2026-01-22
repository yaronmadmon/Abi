/**
 * Family Handler
 * Handles creation and management of family members
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { FamilyMember } from "@/types/home";
import { logger } from "@/lib/logger";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

interface FamilyMemberPayload {
  name: string;
  relationship?: string;
  age?: number;
  notes?: string;
}

export interface FamilyPreview {
  preview: FamilyMember;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class FamilyHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: FamilyMemberPayload): Promise<void> {
    await this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   */
  async propose(payload: FamilyMemberPayload): Promise<FamilyPreview> {
    const validation = this.validate(payload);
    
    const preview: FamilyMember = {
      id: `temp_${Date.now()}`,
      name: payload.name,
      relationship: payload.relationship,
      age: payload.age,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };
    
    const impacts = [`Adds 1 family member: "${payload.name}"`];
    if (payload.relationship) impacts.push(`Relationship: ${payload.relationship}`);
    if (payload.age) impacts.push(`Age: ${payload.age}`);
    
    return { preview, validation, impacts };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   */
  async execute(payload: FamilyMemberPayload): Promise<FamilyMember> {
    if (typeof window === 'undefined' || !window.localStorage) {
      logger.error('localStorage is not available. Cannot create family member.');
      throw new Error('localStorage is not available');
    }

    try {
      const stored = localStorage.getItem("family");
      const family: FamilyMember[] = stored ? JSON.parse(stored) : [];

      const familyMember: FamilyMember = {
        id: `family-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: payload.name,
        relationship: payload.relationship,
        age: payload.age,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
      };

      family.push(familyMember);
      localStorage.setItem("family", JSON.stringify(family));
      console.log('✅ Family member created and saved:', familyMember);
      return familyMember;
    } catch (error) {
      logger.error('Failed to save family member to localStorage', error);
      throw new Error('Failed to save family member');
    }
  }

  /**
   * Update an existing family member
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<FamilyMemberPayload>): Promise<FamilyMember> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Family member ID is required for update');
    }

    const stored = localStorage.getItem("family");
    const family: FamilyMember[] = stored ? JSON.parse(stored) : [];
    
    const memberIndex = family.findIndex(f => f.id === payload.id);
    if (memberIndex === -1) {
      throw new Error(`Family member with ID ${payload.id} not found`);
    }

    const updatedMember: FamilyMember = {
      ...family[memberIndex],
      ...(payload.name && { name: payload.name }),
      ...(payload.relationship !== undefined && { relationship: payload.relationship }),
      ...(payload.age !== undefined && { age: payload.age }),
      ...(payload.notes !== undefined && { notes: payload.notes }),
    };

    family[memberIndex] = updatedMember;
    localStorage.setItem("family", JSON.stringify(family));
    
    logger.info('Family member updated successfully', { memberId: updatedMember.id });
    return updatedMember;
  }

  /**
   * Delete a family member
   * SAFETY: Requires valid ID and validates existence
   */
  async delete(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Family member ID is required for delete');
    }

    const stored = localStorage.getItem("family");
    const family: FamilyMember[] = stored ? JSON.parse(stored) : [];
    
    const memberIndex = family.findIndex(f => f.id === payload.id);
    if (memberIndex === -1) {
      throw new Error(`Family member with ID ${payload.id} not found`);
    }

    family.splice(memberIndex, 1);
    localStorage.setItem("family", JSON.stringify(family));
    
    logger.info('Family member deleted successfully', { memberId: payload.id });
  }

  private validate(payload: FamilyMemberPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload.name || payload.name.trim() === '') {
      errors.push('Family member name is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const familyHandler = new FamilyHandler();
