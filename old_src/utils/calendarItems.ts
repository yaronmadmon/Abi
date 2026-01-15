/**
 * Calendar Items Utilities
 * Get birthdays and maintenance items for calendar display
 */

import { Person } from '@/models';
import { CalendarItem } from '@/ui/components/CalendarView';

/**
 * Get birthday calendar items from people
 */
export function getBirthdayItems(people: Person[]): CalendarItem[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  return people
    .filter(person => person.dateOfBirth)
    .map(person => {
      const birthDate = new Date(person.dateOfBirth!);
      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      
      // If birthday already passed this year, use next year
      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(currentYear + 1);
      }
      
      return {
        id: `birthday-${person.id}-${birthdayThisYear.getTime()}`,
        date: birthdayThisYear,
        type: 'birthday' as const,
        title: 'Birthday',
        personId: person.id,
        personName: `${person.firstName}${person.lastName ? ` ${person.lastName}` : ''}`,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get birthdays happening today or this week
 */
export function getUpcomingBirthdays(people: Person[], daysAhead: number = 7): CalendarItem[] {
  const allBirthdays = getBirthdayItems(people);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() + daysAhead);
  
  return allBirthdays.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= today && itemDate <= cutoffDate;
  });
}

/**
 * Get birthdays happening today
 */
export function getTodayBirthdays(people: Person[]): CalendarItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return people
    .filter(person => person.dateOfBirth)
    .map(person => {
      const birthDate = new Date(person.dateOfBirth!);
      const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (birthdayThisYear.getTime() === today.getTime()) {
        return {
          id: `birthday-today-${person.id}`,
          date: birthdayThisYear,
          type: 'birthday' as const,
          title: 'Birthday',
          personId: person.id,
          personName: `${person.firstName}${person.lastName ? ` ${person.lastName}` : ''}`,
        };
      }
      return null;
    })
    .filter((item): item is CalendarItem => item !== null);
}
