/**
 * Reminders Module Handler
 * Adapter for reminders module - wraps existing module logic
 * For now, reminders are stored as tasks
 */

import type { ReminderPayload } from "../schemas/intentSchema";
import type { Task } from "@/types/home";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

class RemindersHandler implements ModuleHandler {
  async create(payload: ReminderPayload): Promise<void> {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      console.error('RemindersHandler: window is undefined - cannot access localStorage');
      throw new Error('localStorage is not available (server-side)');
    }

    if (!window.localStorage) {
      console.error('RemindersHandler: localStorage is not available');
      throw new Error('localStorage is not available');
    }

    try {
      // Load existing tasks (reminders are stored as tasks for now)
      const stored = window.localStorage.getItem("tasks");
      const tasks: Task[] = stored ? JSON.parse(stored) : [];

      // Apply smart defaults
      let reminderDate = payload.date;
      // If no date specified, default to today
      if (!reminderDate) {
        reminderDate = new Date().toISOString().split('T')[0];
      }

      // Create new task (reminder) with unique ID
      const task: Task = {
        id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: payload.title,
        category: "other",
        dueDate: reminderDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      // Save tasks
      tasks.push(task);
      window.localStorage.setItem("tasks", JSON.stringify(tasks));
      
      console.log('✅ Reminder created successfully:', task.id, task.title);
    } catch (error) {
      console.error('❌ Error creating reminder:', error);
      throw error;
    }
  }
}

export const remindersHandler = new RemindersHandler();
