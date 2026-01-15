/**
 * Live Calendar Component
 * Interactive calendar view for Today page
 */

import { useState, useMemo } from 'react';
import { CalendarView, CalendarItem } from './CalendarView';
import './LiveCalendar.css';

interface LiveCalendarProps {
  items: CalendarItem[];
}

export function LiveCalendar({ items }: LiveCalendarProps) {
  const [currentDate] = useState(new Date());

  // Get today's items
  const todayItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  }, [items]);

  // Format current date
  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [currentDate]);

  return (
    <div className="live-calendar">
      <div className="live-calendar__header">
        <h3 className="live-calendar__title">Calendar</h3>
        <div className="live-calendar__date">{formattedDate}</div>
      </div>
      <div className="live-calendar__content">
        {items.length > 0 ? (
          <CalendarView items={items} view="week" />
        ) : (
          <div className="live-calendar__empty">
            <p className="live-calendar__empty-text">No upcoming events this week.</p>
          </div>
        )}
      </div>
    </div>
  );
}
