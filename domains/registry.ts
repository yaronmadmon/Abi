/**
 * Domain Registry - Central registry for all domains
 * Used for navigation and routing
 */

export interface Domain {
  name: string
  route: string
  icon: string
  subpages: SubPage[]
  description: string
}

export interface SubPage {
  name: string
  route: string
  icon: string
  description?: string
}

export const domains: Domain[] = [
  {
    name: 'home',
    route: '/dashboard/home',
    icon: '🏠',
    description: 'Daily tasks, calendar, and home management',
    subpages: [
      { name: 'Tasks', route: '/dashboard/home/tasks', icon: '✓', description: 'Manage tasks' },
      { name: 'Weekly', route: '/dashboard/home/weekly', icon: '📅', description: 'Weekly overview' },
    ],
  },
  {
    name: 'office',
    route: '/dashboard/office',
    icon: '📁',
    description: 'Documents, bills, insurance, and fax',
    subpages: [
      { name: 'Documents', route: '/dashboard/office/documents', icon: '📄', description: 'Manage documents' },
      { name: 'Bills', route: '/dashboard/office/bills', icon: '🧾', description: 'Bill tracking' },
      { name: 'Insurance', route: '/dashboard/office/insurance', icon: '🛡️', description: 'Insurance documents' },
      { name: 'Fax', route: '/dashboard/office/fax', icon: '📠', description: 'Fax management' },
    ],
  },
  {
    name: 'kitchen',
    route: '/dashboard/kitchen',
    icon: '👨‍🍳',
    description: 'Pantry, ingredients, recipes, and meal planning',
    subpages: [
      { name: 'Pantry', route: '/dashboard/kitchen/pantry', icon: '🥫', description: 'Pantry items' },
      { name: 'Ingredients', route: '/dashboard/kitchen/ingredients', icon: '🥬', description: 'Ingredient tracking' },
      { name: 'Recipes', route: '/dashboard/kitchen/recipes', icon: '📖', description: 'Recipe collection' },
      { name: 'Meals', route: '/dashboard/kitchen/meals', icon: '🍽️', description: 'Meal planning' },
      { name: 'Shopping', route: '/dashboard/kitchen/shopping', icon: '🛒', description: 'Shopping list' },
    ],
  },
  {
    name: 'cleaning',
    route: '/dashboard/cleaning',
    icon: '🧹',
    description: 'Rooms, supplies, rotation, and deep cleaning',
    subpages: [
      { name: 'Rooms', route: '/dashboard/cleaning/rooms', icon: '🚪', description: 'Room cleaning status' },
      { name: 'Supplies', route: '/dashboard/cleaning/supplies', icon: '🧴', description: 'Cleaning supplies' },
      { name: 'Rotation', route: '/dashboard/cleaning/rotation', icon: '🔄', description: 'Cleaning rotation' },
      { name: 'Deep', route: '/dashboard/cleaning/deep', icon: '✨', description: 'Deep cleaning tasks' },
    ],
  },
  {
    name: 'family',
    route: '/dashboard/family',
    icon: '👨‍👩‍👧‍👦',
    description: 'Members, chores, routines, and calendar',
    subpages: [
      { name: 'Members', route: '/dashboard/family/members', icon: '👤', description: 'Family members' },
      { name: 'Chores', route: '/dashboard/family/chores', icon: '✅', description: 'Family chores' },
      { name: 'Routines', route: '/dashboard/family/routines', icon: '🔄', description: 'Family routines' },
      { name: 'Calendar', route: '/dashboard/family/calendar', icon: '📅', description: 'Family calendar' },
    ],
  },
  {
    name: 'kids',
    route: '/dashboard/kids',
    icon: '🧒',
    description: 'School, homework, and activities',
    subpages: [
      { name: 'School', route: '/dashboard/kids/school', icon: '🎒', description: 'School information' },
      { name: 'Homework', route: '/dashboard/kids/homework', icon: '📝', description: 'Homework tracking' },
      { name: 'Activities', route: '/dashboard/kids/activities', icon: '⚽', description: 'Activities and events' },
    ],
  },
  {
    name: 'car',
    route: '/dashboard/car',
    icon: '🚗',
    description: 'Maintenance and reminders',
    subpages: [
      { name: 'Maintenance', route: '/dashboard/car/maintenance', icon: '🔧', description: 'Car maintenance' },
      { name: 'Reminders', route: '/dashboard/car/reminders', icon: '⏰', description: 'Maintenance reminders' },
    ],
  },
]

/**
 * Get domain by route
 */
export function getDomainByRoute(route: string): Domain | undefined {
  return domains.find((domain) => route.startsWith(domain.route))
}

/**
 * Get all domain routes
 */
export function getAllDomainRoutes(): string[] {
  return domains.map((domain) => domain.route)
}
