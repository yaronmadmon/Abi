/**
 * Appointments Module Handler
 * Adapter for appointments module - wraps existing module logic
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { AppointmentPayload } from "../schemas/intentSchema";
import { logger } from "@/lib/logger";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

interface Appointment {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  createdAt: string;
  sharedTo?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface AppointmentPreview {
  preview: Appointment;
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class AppointmentsHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: AppointmentPayload): Promise<void> {
    return this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   */
  async propose(payload: AppointmentPayload): Promise<AppointmentPreview> {
    const validation = this.validate(payload);
    
    const preview: Appointment = {
      id: `temp_${Date.now()}`,
      title: payload.title,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      createdAt: new Date().toISOString(),
    };
    
    const impacts = [`Creates 1 appointment: "${payload.title}"`];
    if (payload.date) impacts.push(`Date: ${new Date(payload.date).toLocaleDateString()}`);
    if (payload.time) impacts.push(`Time: ${payload.time}`);
    if (payload.location) impacts.push(`Location: ${payload.location}`);
    
    return { preview, validation, impacts };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   */
  async execute(payload: AppointmentPayload): Promise<Appointment> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    const stored = localStorage.getItem("appointments");
    const appointments: Appointment[] = stored ? JSON.parse(stored) : [];

    const appointment: Appointment = {
      id: Date.now().toString(),
      title: payload.title,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      createdAt: new Date().toISOString(),
    };

    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('appointmentsUpdated'));
    }
    
    logger.info('Appointment created successfully', { appointmentId: appointment.id, title: appointment.title });
    return appointment;
  }

  /**
   * Update an existing appointment
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string } & Partial<AppointmentPayload>): Promise<Appointment> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Appointment ID is required for update');
    }

    const stored = localStorage.getItem("appointments");
    const appointments: Appointment[] = stored ? JSON.parse(stored) : [];
    
    const appointmentIndex = appointments.findIndex(a => a.id === payload.id);
    if (appointmentIndex === -1) {
      throw new Error(`Appointment with ID ${payload.id} not found`);
    }

    const updatedAppointment: Appointment = {
      ...appointments[appointmentIndex],
      ...(payload.title && { title: payload.title }),
      ...(payload.date !== undefined && { date: payload.date }),
      ...(payload.time !== undefined && { time: payload.time }),
      ...(payload.location !== undefined && { location: payload.location }),
    };

    appointments[appointmentIndex] = updatedAppointment;
    localStorage.setItem("appointments", JSON.stringify(appointments));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    logger.info('Appointment updated successfully', { appointmentId: updatedAppointment.id });
    return updatedAppointment;
  }

  /**
   * Delete an appointment
   * SAFETY: Requires valid ID and validates existence
   */
  async delete(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Appointment ID is required for delete');
    }

    const stored = localStorage.getItem("appointments");
    const appointments: Appointment[] = stored ? JSON.parse(stored) : [];
    
    const appointmentIndex = appointments.findIndex(a => a.id === payload.id);
    if (appointmentIndex === -1) {
      throw new Error(`Appointment with ID ${payload.id} not found`);
    }

    appointments.splice(appointmentIndex, 1);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    logger.info('Appointment deleted successfully', { appointmentId: payload.id });
  }

  private validate(payload: AppointmentPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!payload.title || payload.title.trim() === '') {
      errors.push('Appointment title is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const appointmentsHandler = new AppointmentsHandler();
