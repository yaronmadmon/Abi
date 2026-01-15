/**
 * Router Schema - Defines allowed module routes
 * This ensures routing stays predictable
 */

export type ModuleRoute =
  | "tasks"
  | "meals"
  | "shopping"
  | "reminders"
  | "appointments"
  | "family"
  | "pets"
  | "none";

export interface RouterResult {
  success: boolean;
  route: ModuleRoute;
  message?: string;
  error?: string;
  payload?: any;
}
