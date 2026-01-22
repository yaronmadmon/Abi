/**
 * Reminders Module Handler
 * Adapter for reminders module - wraps existing module logic
 * For now, reminders are stored as tasks
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { ReminderPayload } from "../schemas/intentSchema";
import type { Task } from "@/types/home";
import { logger } from "@/lib/logger";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

export interface ReminderPreview {
  preview: Task;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class RemindersHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: ReminderPayload): Promise<void> {
    await this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   */
  async propose(payload: ReminderPayload): Promise<ReminderPreview> {
    const validation = this.validate(payload);
    
    let reminderDate = payload.date;
    if (!reminderDate) {
      reminderDate = new Date().toISOString().split('T')[0];
    }
    
    const preview: Task = {
      id: `temp_${Date.now()}`,
      title: payload.title,
      category: "other",
      dueDate: reminderDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    const impacts = [`Creates 1 reminder: "${payload.title}"`];
    if (payload.date) impacts.push(`Date: ${new Date(payload.date).toLocaleDateString()}`);
    if (payload.time) impacts.push(`Time: ${payload.time}`);
    
    return { preview, validation, impacts };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   */
  async execute(payload: ReminderPayload): Promise<Task> {
    if (typeof window === 'undefined') {
      console.error('RemindersHandler: window is undefined - cannot access localStorage');
      throw new Error('localStorage is not available (server-side)');
    }

    if (!window.localStorage) {
      logger.error('RemindersHandler: localStorage is not available');
      throw new Error('localStorage is not available');
    }

    try {
      const stored = window.localStorage.getItem("tasks");
      const tasks: Task[] = stored ? JSON.parse(stored) : [];

      let reminderDate = payload.date;
      if (!reminderDate) {
        reminderDate = new Date().toISOString().split('T')[0];
      }

      const task: Task = {
        id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: payload.title,
        category: "other",
        dueDate: reminderDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      tasks.push(task);
      window.localStorage.setItem("tasks", JSON.stringify(tasks));
      window.dispatchEvent(new Event('tasksUpdated'));
      
      console.log('✅ Reminder created successfully:', task.id, task.title);
      return task;
    } catch (error) {
      logger.error('Error creating reminder', error);
      throw error;
    }
  }

  /**
   * Update an existing reminder
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<ReminderPayload>): Promise<Task> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Reminder ID is required for update');
    }

    const stored = window.localStorage.getItem("tasks");
    const tasks: Task[] = stored ? JSON.parse(stored) : [];
    
    const taskIndex = tasks.findIndex(t => t.id === payload.id);
    if (taskIndex === -1) {
      throw new Error(`Reminder with ID ${payload.id} not found`);
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...(payload.title && { title: payload.title }),
      ...(payload.date && { dueDate: payload.date }),
    };

    tasks[taskIndex] = updatedTask;
    window.localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasksUpdated'));
    
    logger.info('Reminder updated successfully', { reminderId: updatedTask.id });
    return updatedTask;
  }

  /**
   * Delete a reminder
   * SAFETY: Requires valid ID and validates existence
   */
  async delete(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Reminder ID is required for delete');
    }

    const stored = window.localStorage.getItem("tasks");
    const tasks: Task[] = stored ? JSON.parse(stored) : [];
    
    const taskIndex = tasks.findIndex(t => t.id === payload.id);
    if (taskIndex === -1) {
      throw new Error(`Reminder with ID ${payload.id} not found`);
    }

    tasks.splice(taskIndex, 1);
    window.localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasksUpdated'));
    
    logger.info('Reminder deleted successfully', { reminderId: payload.id });
  }

  private validate(payload: ReminderPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload.title || payload.title.trim() === '') {
      errors.push('Reminder title is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const remindersHandler = new RemindersHandler();
