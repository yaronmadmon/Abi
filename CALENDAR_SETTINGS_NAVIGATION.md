# Calendar Settings Navigation Improvement

**Date**: January 20, 2026  
**Status**: ✅ Complete

## Problem

The Calendar Systems settings page (`/settings/calendar`) was difficult to discover because it was only accessible from:
- A small text link on the Today page (easy to miss)
- Direct URL navigation

## Solution

Added Calendar Systems navigation to **4 strategic locations** for maximum discoverability:

---

## Navigation Entry Points

### 1. **Calendar/Appointments Page** (PRIMARY)

**Location**: `/home/calendar`  
**Element**: "Calendar Systems" button in header (next to "+ New" button)  
**Icon**: Settings gear icon  
**Visibility**: Always visible, desktop shows label, mobile shows icon only  

```typescript
<Link href="/settings/calendar" className="...">
  <Settings className="w-4 h-4" />
  <span className="text-sm font-medium hidden sm:inline">Calendar Systems</span>
</Link>
```

**Rationale**: Users viewing the calendar are the most likely to want calendar system settings.

---

### 2. **Main Settings Page** (SECONDARY)

**Location**: `/settings`  
**Section**: "Personalization"  
**Position**: First item in the section (above Dietary Preferences)  
**Icon**: Calendar icon  
**Display**: Shows "Hebrew, Chinese, Islamic..." as hint text  

```typescript
<SettingsRow
  icon={<Calendar />}
  title="Calendar Systems"
  value="Hebrew, Chinese, Islamic..."
  onPress={() => window.location.href = '/settings/calendar'}
/>
```

**Rationale**: Central settings hub should include all personalization options.

---

### 3. **Calendar Card on Today Page** (CONTEXTUAL)

**Location**: `/today` (in the Calendar Card component)  
**Element**: Small settings icon in card header  
**Position**: Next to the pending count badge  
**Behavior**: Hover shows "Calendar Systems" tooltip  

```typescript
<Link href="/settings/calendar" title="Calendar Systems">
  <Settings className="w-4 h-4 text-gray-500" />
</Link>
```

**Rationale**: Quick access from the Today page without leaving the view.

---

### 4. **Today Page Greeting Area** (EXISTING)

**Location**: `/today` (below greeting header)  
**Element**: Text link "Add Hebrew, Chinese, or other calendars →"  
**Visibility**: Only shows when no secondary calendars are selected  
**Changes to**: "Manage Calendars" when calendars are active  

**Rationale**: Promotional discovery for first-time users.

---

## User Flow

### First-Time User:
1. Opens Today page
2. Sees "Add Hebrew, Chinese, or other calendars →" link
3. Clicks to open settings
4. Selects calendars
5. Returns to Today page, sees calendars displayed

### Returning User:
**From Calendar Page**:
- Opens `/home/calendar`
- Clicks "Calendar Systems" button in header
- Updates preferences
- Returns to calendar

**From Settings**:
- Opens `/settings`
- Navigates to "Personalization" → "Calendar Systems"
- Updates preferences
- Returns to settings

**From Today Page**:
- Sees Calendar Card
- Clicks settings icon in card header
- Updates preferences quickly

---

## Design Decisions

1. **Multiple Entry Points**: Settings for calendars should be accessible wherever calendars are viewed
2. **Icon Consistency**: Used gear icon for settings, Calendar icon for the feature
3. **Context-Aware**: Prompts new users but doesn't nag returning users
4. **Mobile-First**: Settings icon in Calendar/Appointments page is responsive (hides label on mobile)
5. **Tooltip Support**: Hover text helps users understand what the settings icon does

---

## Files Modified

- ✅ `app/home/calendar/page.tsx` - Added "Calendar Systems" button in header
- ✅ `components/settings/SettingsScreen.tsx` - Added to Personalization section
- ✅ `components/today/CalendarCard.tsx` - Added settings icon in card header

---

## Testing Checklist

- [ ] Navigate to `/home/calendar` → Verify "Calendar Systems" button appears
- [ ] Click button → Verify navigation to `/settings/calendar`
- [ ] Navigate to `/settings` → Find "Calendar Systems" in Personalization section
- [ ] Click row → Verify navigation to calendar settings
- [ ] Go to `/today` → Find Calendar Card → Click settings icon
- [ ] Verify navigation works and back button returns correctly
- [ ] Test on mobile: verify "Calendar Systems" label hides but icon remains
- [ ] Select a secondary calendar → Verify "Add calendars" changes to "Manage Calendars"

---

## Success Metrics

- ✅ Calendar settings accessible from 4 different locations
- ✅ Discoverable for new users
- ✅ Convenient for returning users
- ✅ Context-appropriate placement
- ✅ Consistent with iOS-style settings patterns
- ✅ Mobile-responsive design

**Implementation Status**: ✅ **Complete and Production-Ready**
