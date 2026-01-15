/**
 * Application Routes
 * Hierarchical route structure matching navigation configuration
 */

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '@/ui/components';
import { 
  TodayLanding, 
  Home, 
  Me, 
  Documents, 
  Timeline,
  Communication, 
  Financial, 
  SmartHome, 
  Trust,
  PeopleOverview,
  HomeOverview,
  DailyLifeOverview,
  CommunicationOverview,
  MemoriesOverview,
  FinancesOverview,
  SmartHomeOverview,
  TrustOverview,
  Adults,
  Children,
  Rooms,
  Assets,
  Pets,
  KitchenHome,
  Recipes,
  Pantry,
  GroceryList,
  KitchenNotes
} from '@/pages';
import { PagePlaceholder } from '@/pages/PagePlaceholder';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        {
          index: true,
          element: <Navigate to="/today" replace />,
        },
        {
          path: 'today',
          element: <TodayLanding />,
        },
        {
          path: 'people',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <PeopleOverview />,
            },
            {
              path: 'profile',
              element: <Me />,
            },
            {
              path: 'family',
              element: <Outlet />,
              children: [
                {
                  path: 'adults',
                  element: <Adults />,
                },
                {
                  path: 'children',
                  element: <Children />,
                },
              ],
            },
            {
              path: 'pets',
              element: <Pets />,
            },
            {
              path: 'guests',
              element: <PagePlaceholder title="Guests & Caregivers" description="Manage guests and caregivers" />,
            },
          ],
        },
        {
          path: 'home',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <HomeOverview />,
            },
            {
              path: 'rooms',
              element: <Rooms />,
            },
            {
              path: 'maintenance',
              element: <PagePlaceholder title="Maintenance" description="Track home maintenance tasks" />,
            },
            {
              path: 'assets',
              element: <Assets />,
            },
          ],
        },
        {
          path: 'kitchen',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <KitchenHome />,
            },
            {
              path: 'recipes',
              element: <Recipes />,
            },
            {
              path: 'pantry',
              element: <Pantry />,
            },
            {
              path: 'grocery-list',
              element: <GroceryList />,
            },
            {
              path: 'notes',
              element: <KitchenNotes />,
            },
          ],
        },
        {
          path: 'daily-life',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <DailyLifeOverview />,
            },
            {
              path: 'tasks',
              element: <PagePlaceholder title="Household Tasks" description="Manage household tasks" />,
            },
            {
              path: 'scheduling',
              element: <PagePlaceholder title="Scheduling" description="Schedule events and appointments" />,
            },
            {
              path: 'routines',
              element: <PagePlaceholder title="Routines" description="Manage daily and weekly routines" />,
            },
            {
              path: 'vendors',
              element: <PagePlaceholder title="Vendors & Services" description="Manage vendors and service providers" />,
            },
            {
              path: 'errands',
              element: <PagePlaceholder title="Errands" description="Track errands and to-dos" />,
            },
          ],
        },
        {
          path: 'communication',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <CommunicationOverview />,
            },
            {
              path: 'email',
              element: <Communication />,
            },
            {
              path: 'messages',
              element: <PagePlaceholder title="Messages" description="View and manage messages" />,
            },
            {
              path: 'family-notes',
              element: <PagePlaceholder title="Family Notes" description="Shared family notes" />,
            },
            {
              path: 'announcements',
              element: <PagePlaceholder title="Announcements" description="Family announcements" />,
            },
            {
              path: 'contacts',
              element: <PagePlaceholder title="External Contacts" description="Manage external contacts" />,
            },
          ],
        },
        {
          path: 'memories',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <MemoriesOverview />,
            },
            {
              path: 'documents',
              element: <Documents />,
            },
            {
              path: 'activity',
              element: <Timeline />,
            },
            {
              path: 'notes',
              element: <PagePlaceholder title="Notes" description="View and manage notes" />,
            },
            {
              path: 'uploads',
              element: <PagePlaceholder title="Uploads" description="Manage uploaded files" />,
            },
          ],
        },
        {
          path: 'finances',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <FinancesOverview />,
            },
            {
              path: 'bills',
              element: <Financial />,
            },
            {
              path: 'subscriptions',
              element: <Financial />,
            },
            {
              path: 'payments',
              element: <PagePlaceholder title="Payments" description="Manage payments" />,
            },
            {
              path: 'budgets',
              element: <PagePlaceholder title="Budgets" description="Manage budgets" />,
            },
          ],
        },
        {
          path: 'smart-home',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <SmartHomeOverview />,
            },
            {
              path: 'devices',
              element: <SmartHome />,
            },
            {
              path: 'rules',
              element: <PagePlaceholder title="Rules" description="Manage smart home rules" />,
            },
            {
              path: 'scenarios',
              element: <PagePlaceholder title="Scenarios" description="Manage smart home scenarios" />,
            },
          ],
        },
        {
          path: 'trust',
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <TrustOverview />,
            },
            {
              path: 'permissions',
              element: <PagePlaceholder title="Permissions" description="Manage permissions" />,
            },
            {
              path: 'privacy',
              element: <Trust />,
            },
            {
              path: 'emergency',
              element: <PagePlaceholder title="Emergency Access" description="Manage emergency access settings" />,
            },
            {
              path: 'history',
              element: <Trust />,
            },
          ],
        },
        // Legacy route redirects for backward compatibility
        {
          path: 'me',
          element: <Navigate to="/people/profile" replace />,
        },
        {
          path: 'home-ops',
          element: <Navigate to="/daily-life" replace />,
        },
        {
          path: 'timeline',
          element: <Navigate to="/memories/activity" replace />,
        },
        {
          path: 'financial',
          element: <Navigate to="/finances" replace />,
        },
        {
          path: 'records',
          element: <Navigate to="/memories" replace />,
        },
        {
          path: 'operations',
          element: <Navigate to="/daily-life" replace />,
        },
        {
          path: 'automation',
          element: <Navigate to="/smart-home" replace />,
        },
      ],
    },
  ]
);
