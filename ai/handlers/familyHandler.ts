/**
 * Family Handler
 * Handles creation and management of family members
 */

import type { FamilyMember } from "@/types/home";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

interface FamilyMemberPayload {
  name: string;
  relationship?: string;
  age?: number;
  notes?: string;
}

class FamilyHandler implements ModuleHandler {
  async create(payload: FamilyMemberPayload): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('❌ localStorage is not available. Cannot create family member.');
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
    } catch (error) {
      console.error('❌ Failed to save family member to localStorage:', error);
      throw new Error('Failed to save family member');
    }
  }
}

export const familyHandler = new FamilyHandler();
