/**
 * AI Router
 * Routes interpreted intents to appropriate module handlers
 * Clean separation between AI understanding and app behavior
 */

import type { AIIntent, TaskPayload, MealPayload, ShoppingPayload, ReminderPayload, AppointmentPayload, FamilyPayload, PetPayload } from "./schemas/intentSchema";
import type { ModuleRoute, RouterResult } from "./schemas/routerSchema";
import { tasksHandler } from "./handlers/tasksHandler";
import { mealsHandler } from "./handlers/mealsHandler";
import { shoppingHandler } from "./handlers/shoppingHandler";
import { remindersHandler } from "./handlers/remindersHandler";
import { appointmentsHandler } from "./handlers/appointmentsHandler";
import { familyHandler } from "./handlers/familyHandler";
import { petsHandler } from "./handlers/petsHandler";

/**
 * Route intent to appropriate module
 * Returns routing result with action and payload
 */
export async function routeIntent(intent: AIIntent): Promise<RouterResult> {
  switch (intent.type) {
    case "task":
      return routeTask(intent.payload as TaskPayload);

    case "meal":
      return routeMeal(intent.payload as MealPayload);

    case "shopping":
      return routeShopping(intent.payload as ShoppingPayload);

    case "reminder":
      return routeReminder(intent.payload as ReminderPayload);

    case "appointment":
      return routeAppointment(intent.payload as AppointmentPayload);

    case "family":
      return routeFamily(intent.payload as FamilyPayload);

    case "pet":
      return routePet(intent.payload as PetPayload);

    case "clarification":
      // Return the clarification question naturally
      return {
        success: true,
        route: "none",
        message: intent.followUpQuestion || "I need a bit more information to help you.",
        payload: {
          question: intent.followUpQuestion,
        },
      };

    case "unknown":
      // Keep this specific (no generic "I'm here to help" fallbacks)
      return {
        success: true,
        route: "none",
        message:
          intent.followUpQuestion ||
          `I’m not sure what you want me to do with “${intent.raw || 'that'}”. Do you want to add a task, appointment, reminder, meal, or shopping item?`,
        payload: {},
      };

    default:
      return {
        success: false,
        route: "none",
        error: "Unknown intent type",
      };
  }
}

/**
 * Route task intent
 * Proactive: applies defaults, executes immediately
 */
async function routeTask(payload: TaskPayload): Promise<RouterResult> {
  // Apply defaults if missing
  const taskPayload: TaskPayload = {
    title: payload?.title || 'New task',
    category: payload?.category || 'other',
    dueDate: payload?.dueDate,
    priority: payload?.priority || 'medium',
  };

  if (!taskPayload.title || taskPayload.title.trim() === '') {
    return {
      success: false,
      route: "tasks",
      error: "What task would you like to add?",
    };
  }

  try {
    console.log('🔄 Creating task:', taskPayload);
    await tasksHandler.create(taskPayload);
    console.log('✅ Task created successfully');
    
    // Natural, ChatGPT-like confirmation
    let message = `I've added "${taskPayload.title}" to your to-do list`;
    if (taskPayload.dueDate) {
      const date = new Date(taskPayload.dueDate);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      message += ` for ${dateStr}`;
    }
    message += '.';
    
    return {
      success: true,
      route: "tasks",
      message,
      payload: taskPayload,
    };
  } catch (error) {
    console.error('❌ Error in routeTask:', error);
    return {
      success: false,
      route: "tasks",
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

/**
 * Route meal intent
 */
async function routeMeal(payload: MealPayload): Promise<RouterResult> {
  if (!payload || !payload.name) {
    return {
      success: false,
      route: "meals",
      error: "Meal name is required",
    };
  }

  try {
    await mealsHandler.create(payload);
    const dayInfo = payload.day 
      ? ` for ${payload.day.charAt(0).toUpperCase() + payload.day.slice(1)}`
      : '';
    return {
      success: true,
      route: "meals",
      message: `"${payload.name}" has been added to your meal plan${dayInfo}.`,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      route: "meals",
      error: error instanceof Error ? error.message : "Failed to create meal",
    };
  }
}

/**
 * Route shopping intent
 */
async function routeShopping(payload: ShoppingPayload): Promise<RouterResult> {
  if (!payload || !payload.items || payload.items.length === 0) {
    return {
      success: false,
      route: "shopping",
      error: "Shopping items are required",
    };
  }

  try {
    await shoppingHandler.create(payload);
    const itemsList = payload.items.length === 1 
      ? payload.items[0]
      : payload.items.length === 2
      ? `${payload.items[0]} and ${payload.items[1]}`
      : `${payload.items.slice(0, -1).join(', ')}, and ${payload.items[payload.items.length - 1]}`;
    return {
      success: true,
      route: "shopping",
      message: `${itemsList} ${payload.items.length === 1 ? 'has' : 'have'} been added to your shopping list.`,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      route: "shopping",
      error: error instanceof Error ? error.message : "Failed to add shopping items",
    };
  }
}

/**
 * Route reminder intent
 */
async function routeReminder(payload: ReminderPayload): Promise<RouterResult> {
  if (!payload || !payload.title) {
    return {
      success: false,
      route: "reminders",
      error: "Reminder title is required",
    };
  }

  try {
    console.log('🔄 Creating reminder:', payload);
    // For now, reminders are treated as tasks
    await remindersHandler.create(payload);
    console.log('✅ Reminder created successfully');
    
    const timeInfo = payload.time ? ` at ${payload.time}` : '';
    const dateInfo = payload.date ? ` on ${new Date(payload.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : '';
    return {
      success: true,
      route: "reminders",
      message: `Reminder "${payload.title}"${dateInfo}${timeInfo} has been added.`,
      payload,
    };
  } catch (error) {
    console.error('❌ Error in routeReminder:', error);
    return {
      success: false,
      route: "reminders",
      error: error instanceof Error ? error.message : "Failed to create reminder",
    };
  }
}

/**
 * Route appointment intent
 * Proactive: applies defaults (30 min duration, reasonable times), executes immediately
 */
async function routeAppointment(payload: AppointmentPayload): Promise<RouterResult> {
  // Apply defaults if missing
  const appointmentPayload: AppointmentPayload = {
    title: payload?.title || 'Appointment',
    date: payload?.date,
    time: payload?.time,
    location: payload?.location,
  };

  if (!appointmentPayload.title || appointmentPayload.title.trim() === '') {
    return {
      success: false,
      route: "appointments",
      error: "What appointment would you like to schedule?",
    };
  }

  try {
    await appointmentsHandler.create(appointmentPayload);
    
    // Natural, ChatGPT-like confirmation
    let message = `I've scheduled your ${appointmentPayload.title} appointment`;
    if (appointmentPayload.date) {
      const date = new Date(appointmentPayload.date);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      message += ` for ${dateStr}`;
    }
    if (appointmentPayload.time) {
      // Format time nicely (e.g., "3:00 PM")
      const [hours, minutes] = appointmentPayload.time.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      message += ` at ${displayHour}:${min} ${period}`;
    }
    message += '.';
    
    // Add helpful follow-up if time/date missing
    if (!appointmentPayload.time || !appointmentPayload.date) {
      message += ' Want to adjust the time or date?';
    }
    
    return {
      success: true,
      route: "appointments",
      message,
      payload: appointmentPayload,
    };
  } catch (error) {
    return {
      success: false,
      route: "appointments",
      error: error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
}

/**
 * Route family intent
 */
async function routeFamily(payload: FamilyPayload): Promise<RouterResult> {
  if (!payload || !payload.name) {
    return {
      success: false,
      route: "none",
      error: "Family member name is required",
    };
  }

  try {
    await familyHandler.create(payload);
    
    let message = `"${payload.name}" has been added to your family`;
    if (payload.relationship) {
      message += ` as your ${payload.relationship}`;
    }
    message += '.';
    
    return {
      success: true,
      route: "family",
      message,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      route: "family",
      error: error instanceof Error ? error.message : "Failed to add family member",
    };
  }
}

/**
 * Route pet intent
 */
async function routePet(payload: PetPayload): Promise<RouterResult> {
  if (!payload || !payload.name) {
    return {
      success: false,
      route: "none",
      error: "Pet name is required",
    };
  }

  if (!payload.type) {
    return {
      success: false,
      route: "none",
      error: "Pet type is required",
    };
  }

  try {
    await petsHandler.create(payload);
    
    let message = `"${payload.name}" has been added to your pets`;
    if (payload.type) {
      message += ` as a ${payload.type}`;
    }
    message += '.';
    
    return {
      success: true,
      route: "pets",
      message,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      route: "pets",
      error: error instanceof Error ? error.message : "Failed to add pet",
    };
  }
}
