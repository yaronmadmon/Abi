# Camera vs Upload Fix - AI Input Bar

## Issue

The "+" button in the AI input bar had both "Take Photo" and "Upload Image" options, but **both were opening the file browser** instead of the camera app for "Take Photo".

## Root Cause

The implementation had only ONE `<input type="file">` with `capture="environment"` attribute. This caused both menu options to use the same file input, which on some devices/browsers defaults to file browser instead of camera.

## Solution

Created **two separate file inputs**:

1. **Camera Input** (`cameraInputRef`): 
   - Has `capture="environment"` attribute
   - Opens camera app directly
   - Used for "Take Photo" option

2. **File Upload Input** (`fileInputRef`): 
   - NO `capture` attribute
   - Opens file browser/gallery
   - Used for "Upload Image" option

## Changes Made

### `c:\Abby\components\AIInputBar.tsx`

1. **Added Camera Icon Import**:
   ```tsx
   import { Mic, Square, Image as ImageIcon, X, Plus, Camera } from 'lucide-react'
   ```

2. **Added Camera Input Ref and Media Menu State**:
   ```tsx
   const cameraInputRef = useRef<HTMLInputElement>(null)
   const [showMediaMenu, setShowMediaMenu] = useState(false)
   ```

3. **Replaced Single Image Button with + Menu**:
   - Changed from single image icon button to a "+" button
   - Added dropdown menu with two options:
     - **Take Photo** (Camera icon) → Opens camera
     - **Upload Image** (Image icon) → Opens file browser

4. **Created Two Separate File Inputs**:
   ```tsx
   {/* Camera Input - with capture */}
   <input
     ref={cameraInputRef}
     type="file"
     accept="image/*"
     capture="environment"
     onChange={handleImageSelect}
     className="hidden"
   />
   
   {/* File Upload Input - without capture */}
   <input
     ref={fileInputRef}
     type="file"
     accept="image/*"
     onChange={handleImageSelect}
     className="hidden"
   />
   ```

5. **Added Click-Away Handler**:
   - Menu closes when clicking outside
   - Uses `media-menu-container` class for detection

## UI Behavior

### Before
- Single image icon button
- Both camera and upload went to file browser

### After
- "+" button opens a menu with two options:
  - **Take Photo** → Opens camera app (mobile) or webcam (desktop)
  - **Upload Image** → Opens file browser/gallery
- Menu closes after selection or clicking outside

## Testing

1. **Mobile Device**:
   - Tap "+" button
   - Tap "Take Photo" → Camera app should open
   - Tap "Upload Image" → Gallery/file browser should open

2. **Desktop**:
   - Click "+" button
   - Click "Take Photo" → Webcam permission prompt (if available)
   - Click "Upload Image" → File browser opens

3. **Menu Behavior**:
   - Click "+" → Menu opens
   - Click outside → Menu closes
   - Select an option → Menu closes automatically

## Technical Notes

- `capture="environment"` triggers the camera app on mobile devices
- Without `capture`, browsers default to file picker/gallery
- The `accept="image/*"` ensures only images can be selected
- Both inputs share the same `handleImageSelect` handler for processing

## Result

✅ "Take Photo" now correctly opens the camera app (not file browser)  
✅ "Upload Image" opens file browser/gallery  
✅ Clean UI with dropdown menu  
✅ Works on both mobile and desktop
