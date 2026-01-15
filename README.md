# AI Home Assistant - Phase 1

A modern, AI-powered home assistant app designed for homemakers, housewives, busy parents, and family managers.

## Features

### Phase 1 Core Modules

- **Mandatory Onboarding Flow**: Collects home profile information (number of people, pets, home type, struggles, dietary preferences)
- **AI Task Manager**: Add tasks manually or via AI voice input. Tasks are automatically categorized (cleaning, errands, kids, home maintenance, etc.)
- **Meal Planner**: Plan meals for the week with a simple weekly grid view
- **AI Shopping List**: Add items manually or via AI. Items are automatically categorized (produce, dairy, meat, cleaning, pantry, etc.)
- **Weekly Calendar Overview**: Combined view of tasks, meals, and key reminders

### AI Classification

The app includes an AI classification endpoint that interprets user input and categorizes it into:
- Tasks
- Meals
- Shopping items
- Quick reminders
- Unknown (with clarification questions)

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Mobile-first** responsive design
- **Apple-inspired** soft, rounded UI aesthetic

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your API keys:
```env
# OpenAI API Key (for AI classification)
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key (for Rachel voice TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Voice ID (Rachel voice - verify in your ElevenLabs dashboard)
# Default: 21m00Tcm4TlvDq8ikWAM (Rachel)
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  api/ai/classify/     # AI classification endpoint
  dashboard/            # Main dashboard and module pages
  onboarding/           # Onboarding flow
  layout.tsx            # Root layout
  page.tsx              # Home page (redirects)
  globals.css           # Global styles

components/
  AIInputBar.tsx        # Reusable AI input component

types/
  home.ts               # TypeScript type definitions
```

## Usage

1. **First Time**: Complete the onboarding flow to set up your home profile
2. **Dashboard**: Access all modules from the main dashboard
3. **AI Input**: Use natural language to add tasks, meals, or shopping items
   - Examples:
     - "Add a reminder to switch laundry later"
     - "I need to clean the fridge this week"
     - "Remind me tomorrow to buy sponges"
     - "Give me a simple dinner idea for tonight"
     - "Add milk, eggs, chicken"

## Data Storage

Currently, all data is stored in browser localStorage. This will be replaced with a proper backend in future phases.

## Future Phases

The architecture is designed to easily add:
- Cleaning rotation schedules
- Kids' reminders
- Pantry tracker
- Deals finder
- Auto meal generator
- Smart home integrations
- Budget module
- Advanced AI automation
