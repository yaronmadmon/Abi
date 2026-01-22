import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Simple in-memory storage for demo
// In production, this would use a database
const shoppingList: Set<string> = new Set()

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items must be an array' }, { status: 400 })
    }

    // Normalize and add items
    const normalizedItems = items.map(item => 
      item.toLowerCase().trim()
    )

    // Add to shopping list (remove duplicates automatically via Set)
    normalizedItems.forEach(item => shoppingList.add(item))

    return NextResponse.json({ 
      success: true, 
      addedCount: normalizedItems.length,
      totalItems: shoppingList.size
    })

  } catch (error) {
    console.error('Error adding to shopping list:', error)
    return NextResponse.json(
      { error: 'Failed to add items to shopping list' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    items: Array.from(shoppingList)
  })
}
