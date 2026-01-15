/**
 * Calendar View Component
 * Gentle, read-only calendar showing birthdays and maintenance items
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './CalendarView.css';

export interface CalendarItem {
  id: string;
  date: Date;
  type: 'birthday' | 'maintenance';
  title: string;
  personId?: string; // For birthdays
  personName?: string;
  maintenanceId?: string; // For maintenance
}

interface CalendarViewProps {
  items: CalendarItem[];
  view?: 'day' | 'week';
}

export function CalendarView({ items, view = 'week' }: CalendarViewProps) {
  const navigate = useNavigate();

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarItem[]>();
    
    items.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(item);
    });
    
    return grouped;
  }, [items]);

  // Get dates for current view
  const viewDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates: Date[] = [];
    
    if (view === 'day') {
      dates.push(today);
    } else {
      // Week view: show today + next 6 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
    }
    
    return dates;
  }, [view]);

  const handleItemClick = (item: CalendarItem) => {
    if (item.type === 'birthday' && item.personId) {
      // Navigate to person page - would need to determine if adult or child in production
      // For now, just navigate to people overview
      navigate('/people');
    } else if (item.type === 'maintenance' && item.maintenanceId) {
      navigate('/home/maintenance');
    }
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    
    if (dateCopy.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateCopy.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (items.length === 0 && view === 'week') {
    return (
      <div className="calendar-view calendar-view--empty">
        <p className="calendar-view__empty-text">
          No upcoming events this week.
        </p>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      {viewDates.map(date => {
        const dateKey = date.toISOString().split('T')[0];
        const dayItems = itemsByDate.get(dateKey) || [];
        
        if (dayItems.length === 0 && view === 'day') {
          return null;
        }
        
        return (
          <div key={dateKey} className="calendar-view__day">
            <div className="calendar-view__day-header">
              <span className="calendar-view__day-date">{formatDate(date)}</span>
            </div>
            {dayItems.length > 0 && (
              <div className="calendar-view__day-items">
                {dayItems.map(item => (
                  <div
                    key={item.id}
                    className={`calendar-view__item calendar-view__item--${item.type}`}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="calendar-view__item-icon">
                      {item.type === 'birthday' ? '🎂' : '🔧'}
                    </span>
                    <span className="calendar-view__item-title">{item.title}</span>
                    {item.personName && (
                      <span className="calendar-view__item-person">{item.personName}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
