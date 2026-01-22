/**
 * Tasks Module Handler
 * Adapter for tasks module - wraps existing module logic
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { TaskPayload } from "../schemas/intentSchema";
import type { Task } from "@/types/home";
import { logger } from "@/lib/logger";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

export interface TaskPreview {
  preview: Task;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class TasksHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * Will be removed after full migration
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: TaskPayload): Promise<void> {
    return this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   * This method is safe for AI to call - it only generates a preview
   */
  async propose(payload: TaskPayload): Promise<TaskPreview> {
    // Validate payload
    const validation = this.validate(payload);
    
    // Generate preview
    const preview: Task = {
      id: `temp_${Date.now()}`,
      title: payload.title,
      category: payload.category || "other",
      dueDate: payload.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    // Generate impacts
    const impacts = [`Creates 1 task: "${payload.title}"`];
    if (payload.category) impacts.push(`Category: ${payload.category}`);
    if (payload.priority) impacts.push(`Priority: ${payload.priority}`);
    if (payload.dueDate) impacts.push(`Due: ${new Date(payload.dueDate).toLocaleDateString()}`);
    
    return {
      preview,
      validation,
      impacts,
    };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   * This is the ONLY method that can mutate state
   */
  async execute(payload: TaskPayload): Promise<Task> {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      logger.error('TasksHandler: window is undefined - cannot access localStorage');
      throw new Error('localStorage is not available (server-side)');
    }

    if (!window.localStorage) {
      logger.error('TasksHandler: localStorage is not available');
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
      
      logger.info('Task created successfully', { taskId: task.id, title: task.title });
      
      return task;
    } catch (error) {
      logger.error('Error creating task', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<TaskPayload>): Promise<Task> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Task ID is required for update');
    }

    const stored = window.localStorage.getItem("tasks");
    const tasks: Task[] = stored ? JSON.parse(stored) : [];
    
    const taskIndex = tasks.findIndex(t => t.id === payload.id);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${payload.id} not found`);
    }

    // Update task with new data
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...(payload.title && { title: payload.title }),
      ...(payload.category && { category: payload.category }),
      ...(payload.dueDate !== undefined && { dueDate: payload.dueDate }),
    };

    tasks[taskIndex] = updatedTask;
    window.localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasksUpdated'));
    
    logger.info('Task updated successfully', { taskId: updatedTask.id });
    return updatedTask;
  }

  /**
   * Delete a task
   * SAFETY: Requires valid ID and validates existence
   */
  async delete(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Task ID is required for delete');
    }

    const stored = window.localStorage.getItem("tasks");
    const tasks: Task[] = stored ? JSON.parse(stored) : [];
    
    const taskIndex = tasks.findIndex(t => t.id === payload.id);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${payload.id} not found`);
    }

    tasks.splice(taskIndex, 1);
    window.localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasksUpdated'));
    
    logger.info('Task deleted successfully', { taskId: payload.id });
  }

  /**
   * Validate task payload
   */
  private validate(payload: TaskPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!payload.title || payload.title.trim() === '') {
      errors.push('Task title is required');
    }
    
    if (payload.title && payload.title.length > 200) {
      errors.push('Task title must be less than 200 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const tasksHandler = new TasksHandler();
