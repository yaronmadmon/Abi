import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missingIngredient, recipeContext, availableIngredients = [], avoidAllergens = [] } = body

    if (!missingIngredient) {
      return NextResponse.json(
        { error: 'Missing ingredient is required' },
        { status: 400 }
      )
    }

    // Build AI prompt
    const prompt = `You are a professional chef helping someone cook at home. They are missing an ingredient and need a substitution.

MISSING INGREDIENT: ${missingIngredient}
RECIPE: ${recipeContext}
AVAILABLE INGREDIENTS: ${availableIngredients.length > 0 ? availableIngredients.join(', ') : 'common pantry staples'}

${avoidAllergens.length > 0 ? `CRITICAL ALLERGY RESTRICTIONS: Never suggest anything containing: ${avoidAllergens.join(', ')}` : ''}

Provide 1-3 practical substitution options that:
1. Use common household ingredients
2. Maintain similar flavor or function
3. Are simple to prepare
4. ${avoidAllergens.length > 0 ? 'ABSOLUTELY AVOID all listed allergens' : 'Are safe for general use'}

Return ONLY valid JSON in this exact format:
{
  "original": "${missingIngredient}",
  "alternatives": [
    {
      "name": "Substitution Name",
      "description": "Brief description",
      "ingredients": ["ingredient1", "ingredient2"],
      "steps": ["step 1", "step 2"],
      "flavorNote": "Optional note about taste difference",
      "allergens": ["allergen1"]
    }
  ],
  "safetyNote": "Optional safety message"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a culinary expert providing safe, practical ingredient substitutions. Always respect allergy restrictions. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse AI response
    let result
    try {
      result = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', content)
      // Fallback response
      result = {
        original: missingIngredient,
        alternatives: [],
        safetyNote: 'Unable to generate substitutions at this time. Please add to shopping list.',
      }
    }

    // Validate allergen compliance
    if (avoidAllergens.length > 0 && result.alternatives) {
      result.alternatives = result.alternatives.filter((alt: any) => {
        if (!alt.allergens || alt.allergens.length === 0) return true
        return !alt.allergens.some((allergen: string) => avoidAllergens.includes(allergen))
      })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Substitution API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate substitutions',
        original: request.body,
        alternatives: [],
        safetyNote: 'Service unavailable. Please add to shopping list.',
      },
      { status: 500 }
    )
  }
}
