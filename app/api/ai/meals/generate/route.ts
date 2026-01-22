import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getOpenAIApiKey } from '@/ai/serverEnv'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

interface MealGenerationRequest {
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'baker')[]
  days: string[]
  cuisines: string[]
  preferences: {
    options: string[]
    familyFriendly: boolean
    quick: boolean
  }
}

interface MealItem {
  id: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'baker'
  title: string
  description: string
  imageUrl: string
  ingredients: { name: string; quantity: string }[]
  instructions: string[]
  prepTime: number
  tags: string[]
}

const getOpenAIClient = () => {
  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({ apiKey })
}

const dayToDate = (day: string): string => {
  const dayMap: Record<string, number> = {
    mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
  }
  
  const today = new Date()
  const todayDay = today.getDay()
  const targetDay = dayMap[day]
  
  let daysToAdd = targetDay - todayDay
  if (daysToAdd < 0) daysToAdd += 7
  
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + daysToAdd)
  
  return targetDate.toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  try {
    const body: MealGenerationRequest = await request.json()
    const { mealTypes, days, cuisines, preferences } = body

    if (!mealTypes || mealTypes.length === 0) {
      return NextResponse.json({ error: 'At least one meal type required' }, { status: 400 })
    }

    if (!days || days.length === 0) {
      return NextResponse.json({ error: 'At least one day required' }, { status: 400 })
    }

    const openai = getOpenAIClient()

    // Build contextual prompt
    const isBaker = mealTypes.includes('baker')
    const mealTypesStr = mealTypes.join(', ')
    const daysStr = days.map(d => d.toUpperCase()).join(', ')
    const cuisinesStr = cuisines.length > 0 ? cuisines.join(', ') : 'any'
    const preferencesStr = preferences.options.length > 0 ? preferences.options.join(', ') : 'none'

    const systemPrompt = `You are a calm, helpful meal planning assistant for busy families.

STRICT OUTPUT RULES:
1. Return ONLY a valid JSON array
2. NO markdown, NO code blocks, NO explanations
3. NO emojis in any field
4. Each meal must follow this exact structure

TONE:
- Warm and cozy (especially for Baker Corner)
- Simple and clear
- Family-friendly
- Reduce mental load

${isBaker ? `
BAKER CORNER SPECIAL:
- Weekend-leaning recipes
- Warm, comforting tone in descriptions
- Great for making with kids
- Realistic baking times
` : ''}

REQUIRED JSON STRUCTURE:
[
  {
    "id": "unique-id",
    "date": "YYYY-MM-DD",
    "mealType": "breakfast|lunch|dinner|baker",
    "title": "Simple meal name",
    "description": "One warm sentence about the meal",
    "imageUrl": "https://images.unsplash.com/photo-[relevant-food-photo]?w=400",
    "ingredients": [
      { "name": "ingredient", "quantity": "amount" }
    ],
    "instructions": [
      "Step 1 description",
      "Step 2 description",
      "Step 3 description"
    ],
    "prepTime": 30,
    "tags": ["quick", "family-friendly"]
  }
]

IMPORTANT: For imageUrl, use appropriate Unsplash food photos based on the meal type and cuisine.`

    const userPrompt = `Generate meals for:
- Meal types: ${mealTypesStr}
- Days: ${daysStr}
- Cuisines: ${cuisinesStr}
- Preferences: ${preferencesStr}
- Family friendly: ${preferences.familyFriendly}
- Quick meals: ${preferences.quick}

Create one meal per combination of meal type and day.
${preferences.quick ? 'Keep prep times under 45 minutes.' : ''}
${preferences.familyFriendly ? 'Make sure meals appeal to kids and adults.' : ''}

Return ONLY the JSON array, no other text.`

    logger.debug('Generating meals with OpenAI')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 3000
    })

    const responseText = completion.choices[0]?.message?.content?.trim() || '[]'
    
    // Clean up response (remove markdown if present)
    let cleanedResponse = responseText
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
    }

    let meals: any[]
    try {
      meals = JSON.parse(cleanedResponse)
    } catch (parseError) {
      logger.error('Failed to parse AI response', parseError as Error, { cleanedResponse })
      throw new Error('AI returned invalid JSON')
    }

    // Validate and enrich meals
    const enrichedMeals: MealItem[] = meals.map((meal, index) => {
      // Calculate date from day
      const dayIndex = index % days.length
      const date = dayToDate(days[dayIndex])

      return {
        id: meal.id || `meal-${Date.now()}-${index}`,
        date: meal.date || date,
        mealType: meal.mealType || mealTypes[0],
        title: meal.title || 'Untitled Meal',
        description: meal.description || '',
        imageUrl: meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: meal.ingredients || [],
        instructions: meal.instructions || ['Prepare ingredients', 'Cook meal', 'Serve hot'],
        prepTime: meal.prepTime || 30,
        tags: meal.tags || []
      }
    })

    logger.info(`Generated ${enrichedMeals.length} meals`)

    return NextResponse.json({ meals: enrichedMeals })

  } catch (error) {
    logger.error('Error generating meals', error as Error)
    return NextResponse.json(
      { error: 'Failed to generate meals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
