/**
 * Navigation Configuration
 * Human-friendly, warm, home-oriented navigation structure
 */

import { NavItem } from '@/ui/components/CollapsibleNav';

export const navigationConfig: NavItem[] = [
  { 
    path: '/today', 
    label: 'Today', 
    icon: '📅' 
  },
  {
    path: '/people',
    label: 'People',
    icon: '👥',
    children: [
      { path: '/people', label: 'At a Glance', icon: '👥' },
      { path: '/people/profile', label: 'My Profile', icon: '👤' },
      {
        path: '/people/family',
        label: 'Family',
        icon: '👨‍👩‍👧‍👦',
        children: [
          { path: '/people/family/adults', label: 'Adults', icon: '👨‍👩' },
          { path: '/people/family/children', label: 'Children', icon: '🧒' },
        ],
      },
      { path: '/people/pets', label: 'Pets', icon: '🐾' },
      { path: '/people/guests', label: 'Guests & Caregivers', icon: '🏠' },
    ],
  },
  {
    path: '/home',
    label: 'Home',
    icon: '🏠',
    children: [
      { path: '/home', label: 'At a Glance', icon: '🏠' },
      { path: '/home/rooms', label: 'Rooms & Areas', icon: '🚪' },
      { path: '/home/maintenance', label: 'Maintenance', icon: '🔧' },
      { path: '/home/assets', label: 'Assets', icon: '📦' },
    ],
  },
  {
    path: '/kitchen',
    label: 'Kitchen',
    icon: '👨‍🍳',
    children: [
      { path: '/kitchen', label: 'Kitchen Home', icon: '👨‍🍳' },
      { path: '/kitchen/recipes', label: 'Recipes', icon: '📖' },
      { path: '/kitchen/pantry', label: 'Pantry', icon: '🥫' },
      { path: '/kitchen/grocery-list', label: 'Grocery List', icon: '🛒' },
      { path: '/kitchen/notes', label: 'Kitchen Notes', icon: '📝' },
    ],
  },
  {
    path: '/daily-life',
    label: 'Daily Life',
    icon: '✨',
    children: [
      { path: '/daily-life', label: 'At a Glance', icon: '✨' },
      { path: '/daily-life/tasks', label: 'Household Tasks', icon: '✅' },
      { path: '/daily-life/scheduling', label: 'Scheduling', icon: '📅' },
      { path: '/daily-life/routines', label: 'Routines', icon: '🔄' },
      { path: '/daily-life/vendors', label: 'Vendors & Services', icon: '🏢' },
      { path: '/daily-life/errands', label: 'Errands', icon: '🛒' },
    ],
  },
  {
    path: '/communication',
    label: 'Communication',
    icon: '✉️',
    children: [
      { path: '/communication', label: 'At a Glance', icon: '✉️' },
      { path: '/communication/email', label: 'Email', icon: '📧' },
      { path: '/communication/messages', label: 'Messages', icon: '💬' },
      { path: '/communication/family-notes', label: 'Family Notes', icon: '📝' },
      { path: '/communication/announcements', label: 'Announcements', icon: '📢' },
      { path: '/communication/contacts', label: 'External Contacts', icon: '👤' },
    ],
  },
  {
    path: '/memories',
    label: 'Memories',
    icon: '📚',
    children: [
      { path: '/memories', label: 'At a Glance', icon: '📚' },
      { path: '/memories/documents', label: 'Documents', icon: '📄' },
      { path: '/memories/activity', label: 'Activity', icon: '⏱️' },
      { path: '/memories/notes', label: 'Notes', icon: '📝' },
      { path: '/memories/uploads', label: 'Uploads', icon: '📤' },
    ],
  },
  {
    path: '/finances',
    label: 'Finances',
    icon: '💳',
    children: [
      { path: '/finances', label: 'At a Glance', icon: '💳' },
      { path: '/finances/bills', label: 'Bills', icon: '🧾' },
      { path: '/finances/subscriptions', label: 'Subscriptions', icon: '🔄' },
      { path: '/finances/payments', label: 'Payments', icon: '💸' },
      { path: '/finances/budgets', label: 'Budgets', icon: '💰' },
    ],
  },
  {
    path: '/smart-home',
    label: 'Smart Home',
    icon: '🏠',
    children: [
      { path: '/smart-home', label: 'At a Glance', icon: '🏠' },
      { path: '/smart-home/devices', label: 'Devices', icon: '🔌' },
      { path: '/smart-home/rules', label: 'Rules', icon: '📋' },
      { path: '/smart-home/scenarios', label: 'Scenarios', icon: '🎬' },
    ],
  },
  {
    path: '/trust',
    label: 'Trust & Safety',
    icon: '🔒',
    children: [
      { path: '/trust', label: 'At a Glance', icon: '🔒' },
      { path: '/trust/permissions', label: 'Permissions', icon: '👮' },
      { path: '/trust/privacy', label: 'Privacy', icon: '🔐' },
      { path: '/trust/emergency', label: 'Emergency Access', icon: '🚨' },
      { path: '/trust/history', label: 'History', icon: '📋' },
    ],
  },
];
