/**
 * Appointments Module Handler
 * Adapter for appointments module - wraps existing module logic
 */

import type { AppointmentPayload } from "../schemas/intentSchema";

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
}

class AppointmentsHandler implements ModuleHandler {
  async create(payload: AppointmentPayload): Promise<void> {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    // Load existing appointments
    const stored = localStorage.getItem("appointments");
    const appointments: Appointment[] = stored ? JSON.parse(stored) : [];

    // Create new appointment
    const appointment: Appointment = {
      id: Date.now().toString(),
      title: payload.title,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      createdAt: new Date().toISOString(),
    };

    // Save appointments
    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }
}

export const appointmentsHandler = new AppointmentsHandler();
