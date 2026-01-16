/**
 * Tasks Module Handler
 * Adapter for tasks module - wraps existing module logic
 */

import type { TaskPayload } from "../schemas/intentSchema";
import type { Task } from "@/types/home";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

class TasksHandler implements ModuleHandler {
  async create(payload: TaskPayload): Promise<void> {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      console.error('TasksHandler: window is undefined - cannot access localStorage');
      throw new Error('localStorage is not available (server-side)');
    }

    if (!window.localStorage) {
      console.error('TasksHandler: localStorage is not available');
      throw new Error('localStorage is not available');
    }

    try {
      // Load existing tasks
      const stored = window.localStorage.getItem("tasks");
      const tasks: Task[] = stored ? JSON.parse(stored) : [];

      // Create new task with unique ID
      const task: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: payload.title,
        category: payload.category || "other",
        dueDate: payload.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      // Save tasks
      tasks.push(task);
      window.localStorage.setItem("tasks", JSON.stringify(tasks));
      
      // Trigger custom event for badge updates
      window.dispatchEvent(new Event('tasksUpdated'));
      
      console.log('✅ Task created successfully:', task.id, task.title);
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  }
}

export const tasksHandler = new TasksHandler();
