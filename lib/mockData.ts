// Mock data for initial app state
// This data is automatically removed once real user data exists

import type { Task, Appointment, FamilyMember, Pet } from '@/types/home'

interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export const initializeMockData = () => {
  // Only initialize if no real data exists
  if (typeof window === 'undefined') return

  // Mock To-Dos
  const existingTasks = localStorage.getItem('tasks')
  if (!existingTasks || JSON.parse(existingTasks).length === 0) {
    const mockTasks: Task[] = [
      {
        id: 'mock-task-1',
        title: 'Review monthly budget',
        category: 'errands',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        completed: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-task-2',
        title: 'Schedule dentist appointment',
        category: 'errands',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        completed: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-task-3',
        title: 'Organize garage',
        category: 'home-maintenance',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('tasks', JSON.stringify(mockTasks))
  }

  // Mock Meals
  const existingMeals = localStorage.getItem('meals')
  if (!existingMeals || JSON.parse(existingMeals).length === 0) {
    const mockMeals: any[] = [
      {
        id: 'mock-meal-1',
        name: 'Pasta Carbonara',
        day: 'monday',
        mealType: 'dinner',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-meal-2',
        name: 'Grilled Chicken Salad',
        day: 'tuesday',
        mealType: 'dinner',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-meal-3',
        name: 'Oatmeal with Berries',
        day: 'wednesday',
        mealType: 'breakfast',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('meals', JSON.stringify(mockMeals))
  }

  // Mock Shopping Items
  const existingShopping = localStorage.getItem('shoppingItems')
  if (!existingShopping || JSON.parse(existingShopping).length === 0) {
    const mockShopping: any[] = [
      {
        id: 'mock-shopping-1',
        name: 'Milk',
        category: 'dairy',
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-shopping-2',
        name: 'Bananas',
        category: 'produce',
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-shopping-3',
        name: 'Bread',
        category: 'pantry',
        completed: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-shopping-4',
        name: 'Eggs',
        category: 'dairy',
        completed: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('shoppingItems', JSON.stringify(mockShopping))
  }

  // Mock Appointments
  const existingAppointments = localStorage.getItem('appointments')
  if (!existingAppointments || JSON.parse(existingAppointments).length === 0) {
    const mockAppointments: Appointment[] = [
      {
        id: 'mock-appt-1',
        title: 'Team Meeting',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        time: '10:00',
        location: 'Conference Room A',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-appt-2',
        title: 'Lunch with Sarah',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        time: '12:30',
        location: 'Downtown Cafe',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('appointments', JSON.stringify(mockAppointments))
  }

  // Mock Notes
  const existingNotes = localStorage.getItem('notes')
  if (!existingNotes || JSON.parse(existingNotes).length === 0) {
    const mockNotes: Note[] = [
      {
        id: 'mock-note-1',
        title: 'Weekend Plans',
        body: 'Saturday: Grocery shopping, family time\nSunday: Relax and prepare for the week ahead',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-note-2',
        title: 'Recipe Ideas',
        body: 'Try making homemade pasta this week\nLook up vegetarian lasagna recipe',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('notes', JSON.stringify(mockNotes))
  }

  // Mock Family Members
  const existingFamily = localStorage.getItem('family')
  if (!existingFamily || JSON.parse(existingFamily).length === 0) {
    // Generate placeholder profile images (simple colored circles with initials)
    const emmaPhoto = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#4F46E5"/>
        <text x="100" y="140" font-size="80" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">E</text>
      </svg>
    `)
    
    const alexPhoto = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#10B981"/>
        <text x="100" y="140" font-size="80" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">A</text>
      </svg>
    `)

    const mockFamily: FamilyMember[] = [
      {
        id: 'mock-family-1',
        name: 'Emma',
        relationship: 'spouse',
        age: 32,
        phone: '5551234567',
        email: 'emma@example.com',
        notes: 'Loves gardening and morning walks. Works as a teacher.',
        photo: emmaPhoto,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-family-2',
        name: 'Alex',
        relationship: 'child',
        age: 8,
        phone: '5551234568',
        email: 'alex@example.com',
        notes: 'School pickup at 3pm. Loves soccer and reading.',
        photo: alexPhoto,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('family', JSON.stringify(mockFamily))
  }

  // Mock Pets
  const existingPets = localStorage.getItem('pets')
  if (!existingPets || JSON.parse(existingPets).length === 0) {
    // Generate placeholder pet images
    const maxPhoto = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#F59E0B"/>
        <text x="100" y="140" font-size="60" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">🐕</text>
      </svg>
    `)

    const mockPets: Pet[] = [
      {
        id: 'mock-pet-1',
        name: 'Max',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 5,
        birthday: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vetName: 'Dr. Sarah Johnson',
        vetPhone: '5552345678',
        notes: 'Annual checkup due next month. Very friendly and loves playing fetch.',
        photo: maxPhoto,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem('pets', JSON.stringify(mockPets))
  }
}
