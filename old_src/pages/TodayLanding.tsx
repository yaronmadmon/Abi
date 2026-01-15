/**
 * Today Landing Page
 * Daily check-in with calendar awareness and gentle entry points
 */

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarItem } from '@/ui/components/CalendarView';
import { LiveCalendar } from '@/ui/components/LiveCalendar';
import { WeatherCard } from '@/ui/components/WeatherCard';
import { QuickActionCard } from '@/ui/components/QuickActionCard';
import { ToDoModal } from '@/ui/components/ToDoModal';
import { ViewModeToggle } from '@/ui/components/ViewModeToggle';
import { Todo } from '@/ui/components/ToDoList';
import { useViewMode } from '@/context/ViewModeContext';
import { getUpcomingBirthdays, getTodayBirthdays } from '@/utils/calendarItems';
import { Person, PersonRole } from '@/models';
import './Page.css';
import './TodayLanding.css';

// Placeholder - in production, this would come from a shared data store
const placeholderAdults: Person[] = [
  {
    id: 'person-dad-1',
    householdId: 'household-1',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@email.com',
    phone: '+1 (555) 234-5678',
    role: PersonRole.ADULT,
    dateOfBirth: '1975-03-15',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    preferences: { notes: 'Loves reading and hiking on weekends' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'person-mom-1',
    householdId: 'household-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 234-5679',
    role: PersonRole.ADULT,
    dateOfBirth: '1978-07-22',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    preferences: { notes: 'Enjoys gardening and baking with the kids' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
const placeholderChildren: Person[] = [
  {
    id: 'person-brother-1',
    householdId: 'household-1',
    firstName: 'Ethan',
    lastName: 'Johnson',
    email: 'ethan.johnson@email.com',
    phone: '+1 (555) 234-5680',
    role: PersonRole.KID,
    dateOfBirth: '2010-11-08',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    preferences: { notes: 'Loves soccer and video games' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'person-sister-1',
    householdId: 'household-1',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.johnson@email.com',
    phone: '+1 (555) 234-5681',
    role: PersonRole.KID,
    dateOfBirth: '2013-05-20',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    preferences: { notes: 'Enjoys dance classes and reading' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const TODOS_STORAGE_KEY = 'today-landing-todos';

export function TodayLanding() {
  const navigate = useNavigate();
  const { isMobileView } = useViewMode();
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TODOS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  
  // In production, these would come from a shared data store
  const [adults] = useState<Person[]>(placeholderAdults);
  const [children] = useState<Person[]>(placeholderChildren);
  
  const allPeople = useMemo(() => [...adults, ...children], [adults, children]);
  
  // Get calendar items
  const todayBirthdays = useMemo(() => getTodayBirthdays(allPeople), [allPeople]);
  const upcomingBirthdays = useMemo(() => getUpcomingBirthdays(allPeople, 7), [allPeople]);
  
  // Combine all calendar items (birthdays + maintenance would go here)
  const calendarItems = useMemo<CalendarItem[]>(() => {
    return [...upcomingBirthdays];
  }, [upcomingBirthdays]);
  
  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos]);

  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: `todo-${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos([newTodo, ...todos]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const activeTodosCount = todos.filter(t => !t.completed).length;

  return (
    <div className="page">
      <div className="today-landing">
        <div className="today-landing__header">
          <div className="today-landing__header-content">
            <div>
              <h1 className="today-landing__title">{greeting}</h1>
              <p className="today-landing__welcome">
                Here's what's happening today. Everything you need is here, ready when you are.
              </p>
            </div>
            {isMobileView && (
              <div className="today-landing__header-actions">
                <ViewModeToggle compact />
              </div>
            )}
          </div>
        </div>

        <div className="today-landing__cards">
          <WeatherCard />
          <LiveCalendar items={calendarItems} />
        </div>

        <div className="today-landing__quick-actions">
          <QuickActionCard
            icon="✅"
            title="To Do"
            description={activeTodosCount > 0 ? `${activeTodosCount} active` : "Create a new task"}
            onClick={() => setShowTodoModal(true)}
          />
          <QuickActionCard
            icon="🚶"
            title="Walking"
            description="Track your walk"
            onClick={() => {
              // In production, would open walk tracking
              console.log('Start walk tracking');
            }}
          />
          <QuickActionCard
            icon="💭"
            title="Quick Thoughts"
            description="Jot down a note"
            onClick={() => {
              // In production, would open note editor
              console.log('Open note editor');
            }}
          />
          <QuickActionCard
            icon="🔔"
            title="Reminders"
            description="Set a reminder"
            onClick={() => {
              // In production, would open reminder creator
              console.log('Create reminder');
            }}
          />
          <QuickActionCard
            icon="📅"
            title="Quick Appointment"
            description="Schedule an event"
            onClick={() => navigate('/daily-life/scheduling')}
          />
        </div>

        <div className="today-landing__entry-points">
          <Link to="/people" className="today-landing__entry-point">
            <div className="today-landing__entry-icon">👥</div>
            <div className="today-landing__entry-content">
              <h2 className="today-landing__entry-title">Family</h2>
              <p className="today-landing__entry-description">
                Manage the people in your home
              </p>
            </div>
          </Link>

          <Link to="/home" className="today-landing__entry-point">
            <div className="today-landing__entry-icon">🏠</div>
            <div className="today-landing__entry-content">
              <h2 className="today-landing__entry-title">Home</h2>
              <p className="today-landing__entry-description">
                Your physical space and belongings
              </p>
            </div>
          </Link>

          <Link to="/daily-life" className="today-landing__entry-point">
            <div className="today-landing__entry-icon">✨</div>
            <div className="today-landing__entry-content">
              <h2 className="today-landing__entry-title">Daily Life</h2>
              <p className="today-landing__entry-description">
                Tasks, routines, and schedules
              </p>
            </div>
          </Link>

          <Link to="/memories/documents" className="today-landing__entry-point">
            <div className="today-landing__entry-icon">📄</div>
            <div className="today-landing__entry-content">
              <h2 className="today-landing__entry-title">Documents</h2>
              <p className="today-landing__entry-description">
                Store and organize your important files
              </p>
            </div>
          </Link>
        </div>
      </div>

      {showTodoModal && (
        <ToDoModal
          todos={todos}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onClose={() => setShowTodoModal(false)}
        />
      )}
    </div>
  );
}
