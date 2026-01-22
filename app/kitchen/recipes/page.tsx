'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ChefHat, Clock, Users, Heart, ThumbsDown, Shield, ArrowLeft, Check, RefreshCw, X } from 'lucide-react'
import { RECIPE_DATABASE, Recipe } from '@/data/recipeDatabase'
import { getAllergyPreferences, isRecipeSafe, formatAllergenNames } from '@/lib/allergyManager'
import PageContainer from '@/components/ui/PageContainer'

function RecipeLibraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(RECIPE_DATABASE)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all')
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'discover'>('grid')
  const [currentDiscoverIndex, setCurrentDiscoverIndex] = useState(0)
  const [likedRecipes, setLikedRecipes] = useState<string[]>([])
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [householdAllergens, setHouseholdAllergens] = useState<string[]>([])
  const [showExcluded, setShowExcluded] = useState(false)
  
  // Swap mode context
  const [swapMode, setSwapMode] = useState<{
    active: boolean
    day: string
    mealType: string
    mealId: string
    returnTo: string
  } | null>(null)

  // Load liked recipes, allergy preferences, and check for swap mode
  useEffect(() => {
    const stored = localStorage.getItem('likedRecipes')
    if (stored) {
      setLikedRecipes(JSON.parse(stored))
    }
    
    const allergyPrefs = getAllergyPreferences()
    setHouseholdAllergens(allergyPrefs.allergens)
    setShowExcluded(allergyPrefs.showExcluded)
    
    // Check if we're in swap mode
    if (searchParams) {
      try {
        const isSwap = searchParams.get('swap') === 'true'
        if (isSwap) {
          const day = searchParams.get('day') || ''
          const mealType = searchParams.get('mealType') || ''
          const mealId = searchParams.get('mealId') || ''
          const returnTo = searchParams.get('returnTo') || '/kitchen'
          
          setSwapMode({
            active: true,
            day,
            mealType,
            mealId,
            returnTo
          })
          
          // Auto-filter by meal type
          if (mealType && mealType !== 'all') {
            setSelectedCategory(mealType)
          }
        } else {
          setSwapMode(null)
        }
      } catch (error) {
        console.error('Error reading swap mode params:', error)
      }
    }
  }, [searchParams])
  
  // Listen for allergy updates
  useEffect(() => {
    const handleAllergyUpdate = () => {
      const allergyPrefs = getAllergyPreferences()
      setHouseholdAllergens(allergyPrefs.allergens)
      setShowExcluded(allergyPrefs.showExcluded)
    }
    
    window.addEventListener('allergiesUpdated', handleAllergyUpdate)
    return () => window.removeEventListener('allergiesUpdated', handleAllergyUpdate)
  }, [])

  // Filter recipes based on search query, category, cuisine, liked status, and allergies
  useEffect(() => {
    let recipes = RECIPE_DATABASE

    // Filter by allergies (unless showExcluded is true)
    if (householdAllergens.length > 0 && !showExcluded) {
      recipes = recipes.filter((recipe) => isRecipeSafe(recipe.allergens || [], householdAllergens))
    }

    // Filter by liked status
    if (showLikedOnly) {
      recipes = recipes.filter((recipe) => likedRecipes.includes(recipe.id))
    }

    // Filter by meal type category
    if (selectedCategory !== 'all') {
      recipes = recipes.filter((recipe) => recipe.mealType === selectedCategory)
    }

    // Filter by cuisine
    if (selectedCuisine !== 'all') {
      recipes = recipes.filter((recipe) => recipe.cuisine === selectedCuisine)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      recipes = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.cuisine.toLowerCase().includes(query) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    setFilteredRecipes(recipes)
    setCurrentDiscoverIndex(0) // Reset discover index when filters change
  }, [searchQuery, selectedCategory, selectedCuisine, showLikedOnly, likedRecipes, householdAllergens, showExcluded])

  const mealCategories = [
    { id: 'all', label: 'All', count: RECIPE_DATABASE.length },
    { id: 'breakfast', label: 'Breakfast', count: RECIPE_DATABASE.filter((r) => r.mealType === 'breakfast').length },
    { id: 'lunch', label: 'Lunch', count: RECIPE_DATABASE.filter((r) => r.mealType === 'lunch').length },
    { id: 'dinner', label: 'Dinner', count: RECIPE_DATABASE.filter((r) => r.mealType === 'dinner').length },
    { id: 'baking', label: 'Baking', count: RECIPE_DATABASE.filter((r) => r.mealType === 'baking').length },
  ]

  // Get unique cuisines from recipe database
  const allCuisines = Array.from(new Set(RECIPE_DATABASE.map(r => r.cuisine)))
  const cuisineCategories = [
    { id: 'all', label: 'All Cuisines' },
    ...allCuisines.map(cuisine => ({
      id: cuisine,
      label: cuisine,
      count: RECIPE_DATABASE.filter(r => r.cuisine === cuisine).length
    }))
  ]

  const handleRecipeClick = (recipe: Recipe) => {
    // Navigate to full-page recipe view
    if (swapMode?.active) {
      // Pass swap context to recipe page
      const params = new URLSearchParams({
        swap: 'true',
        day: swapMode.day,
        mealType: swapMode.mealType,
        mealId: swapMode.mealId,
        returnTo: swapMode.returnTo
      })
      router.push(`/kitchen/recipes/${recipe.id}?${params.toString()}`)
    } else {
      // Normal navigation with from parameter
      router.push(`/kitchen/recipes/${recipe.id}?from=/kitchen/recipes`)
    }
  }

  const handleLikeRecipe = (recipeId: string) => {
    const updated = likedRecipes.includes(recipeId)
      ? likedRecipes.filter(id => id !== recipeId)
      : [...likedRecipes, recipeId]
    
    setLikedRecipes(updated)
    localStorage.setItem('likedRecipes', JSON.stringify(updated))
  }

  const handleSwipeAction = (action: 'like' | 'skip') => {
    const currentRecipe = filteredRecipes[currentDiscoverIndex]
    
    if (action === 'like') {
      handleLikeRecipe(currentRecipe.id)
    }
    
    // Move to next recipe
    if (currentDiscoverIndex < filteredRecipes.length - 1) {
      setCurrentDiscoverIndex(prev => prev + 1)
    } else {
      // End of recipes, show message
      alert('You\'ve browsed all recipes in this category!')
      setViewMode('grid')
      setCurrentDiscoverIndex(0)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) {
      handleSwipeAction('skip')
    } else if (isRightSwipe) {
      handleSwipeAction('like')
    }
  }

  const handleReplaceMeal = (recipe: Recipe) => {
    if (!swapMode) return
    
    try {
      const stored = localStorage.getItem('weeklyMeals')
      if (!stored) return
      
      const allMeals = JSON.parse(stored)
      const updatedMeals = allMeals.map((m: any) => {
        if (m.id === swapMode.mealId) {
          // Replace with new recipe
          return {
            ...m,
            title: recipe.title,
            description: recipe.description,
            imageUrl: recipe.imageUrl,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            prepTime: recipe.prepTime,
            servings: recipe.servings
          }
        }
        return m
      })
      
      localStorage.setItem('weeklyMeals', JSON.stringify(updatedMeals))
      window.dispatchEvent(new Event('mealsUpdated'))
      
      // Navigate back
      alert(`Meal replaced successfully!`)
      router.push(swapMode.returnTo)
    } catch (error) {
      console.error('Error replacing meal:', error)
      alert('Failed to replace meal')
    }
  }

  const handleAddToShoppingList = async (recipe: Recipe) => {
    if (!confirm(`Add ${recipe.ingredients.length} ingredients from "${recipe.title}" to shopping list?`)) return

    try {
      const ingredientNames = recipe.ingredients.map((ing) => ing.name)
      
      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: ingredientNames,
          category: 'recipe-ingredients'
        })
      })
      
      alert(`Added ${ingredientNames.length} ingredients to shopping list`)
    } catch (error) {
      console.error('Error adding ingredients:', error)
      alert('Failed to add ingredients')
    }
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="4xl">
        {/* Header */}
        <div className="mb-6">
          {swapMode?.active ? (
            <button
              onClick={() => router.push(swapMode.returnTo)}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel Swap
            </button>
          ) : (
            <Link href="/kitchen" className="text-gray-500 hover:text-gray-700 text-sm mb-3 inline-block">
              ← Back to Kitchen
            </Link>
          )}
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8 text-orange-600" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-gray-900">
              {swapMode?.active ? 'Swap Meal' : 'Recipe Library'}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {swapMode?.active 
              ? `Replacing ${swapMode.mealType} for ${new Date(swapMode.day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
              : 'Browse and discover delicious recipes'}
          </p>
        </div>

        {/* Swap Mode Banner */}
        {swapMode?.active && (
          <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 mb-1">Swap Mode Active</h3>
                <p className="text-sm text-orange-800">
                  Select a new recipe to replace your current {swapMode.mealType} on {new Date(swapMode.day).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Allergy Banner */}
        {householdAllergens.length > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">Allergy-Safe Mode Active</h3>
                <p className="text-sm text-red-800 mb-2">
                  Filtering out recipes containing: {formatAllergenNames(householdAllergens)}
                </p>
                <Link
                  href="/kitchen/settings/allergies"
                  className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  Manage Allergy Settings →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Local Search Bar - ONLY searches recipes within this page */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle + Liked Filter */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'grid'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Browse Grid
          </button>
          <button
            onClick={() => {
              setViewMode('discover')
              setCurrentDiscoverIndex(0)
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'discover'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Discover Mode
          </button>
          <button
            onClick={() => setShowLikedOnly(!showLikedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              showLikedOnly
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
            title="Show only liked recipes"
          >
            <Heart className={`w-4 h-4 ${showLikedOnly ? 'fill-white' : ''}`} />
            {likedRecipes.length > 0 && `(${likedRecipes.length})`}
          </button>
        </div>

        {/* Meal Type Filter */}
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {mealCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.label} {cat.count > 0 && `(${cat.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine Filter */}
        <div className="mb-6 overflow-x-auto pb-2">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Cuisine</p>
          <div className="flex gap-2">
            {cuisineCategories.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => setSelectedCuisine(cuisine.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCuisine === cuisine.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cuisine.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          </p>
        </div>

        {/* Discover Mode - Swipeable Cards */}
        {viewMode === 'discover' && filteredRecipes.length > 0 ? (
          <div className="max-w-md mx-auto mb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {currentDiscoverIndex + 1} of {filteredRecipes.length} recipes
              </p>
              <p className="text-xs text-purple-600 font-medium">← Swipe to explore →</p>
            </div>

            <div 
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const recipe = filteredRecipes[currentDiscoverIndex]
                const isLiked = likedRecipes.includes(recipe.id)
                
                return (
                    <>
                    <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-orange-600 uppercase">
                          {recipe.mealType}
                        </div>
                        <div className="text-xs font-medium text-purple-600">
                          {recipe.cuisine}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {recipe.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.totalTime} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Serves {recipe.servings}
                        </div>
                        <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {recipe.difficulty}
                        </div>
                      </div>

                      {/* Swipe Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => handleSwipeAction('skip')}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Skip
                        </button>
                        <button
                          onClick={() => handleSwipeAction('like')}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            isLiked
                              ? 'bg-pink-500 text-white'
                              : 'bg-pink-50 hover:bg-pink-100 text-pink-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                          {isLiked ? 'Liked' : 'Like'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleRecipeClick(recipe)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {swapMode?.active ? (
                          <>
                            <Check className="w-5 h-5" />
                            View & Use Recipe
                          </>
                        ) : (
                          'View Full Recipe'
                        )}
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-900 text-center">
                💡 <strong>Swipe right</strong> to like recipes, <strong>swipe left</strong> to skip
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' && filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-2">No recipes found. Try searching for something delicious!</p>
            <p className="text-sm text-gray-400">Try a different search or category</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredRecipes.map((recipe) => {
              const isLiked = likedRecipes.includes(recipe.id)
              return (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-200 relative"
                >
                  {/* Liked badge */}
                  {isLiked && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  
                  <div 
                    onClick={swapMode?.active ? undefined : () => handleRecipeClick(recipe)}
                    className={`aspect-video w-full overflow-hidden bg-gray-100 relative ${!swapMode?.active ? 'cursor-pointer' : ''}`}
                  >
                    <Image
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-orange-600 uppercase">
                        {recipe.mealType}
                      </div>
                      <div className="text-xs font-medium text-purple-600">
                        {recipe.cuisine}
                      </div>
                    </div>
                    <h3 
                      onClick={swapMode?.active ? undefined : () => handleRecipeClick(recipe)}
                      className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${!swapMode?.active ? 'cursor-pointer hover:text-orange-600' : ''}`}
                    >
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.totalTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Serves {recipe.servings}
                      </div>
                    </div>
                    
                    {swapMode?.active ? (
                      <button
                        onClick={() => {
                          if (confirm(`Replace your ${swapMode.mealType} with "${recipe.title}"?`)) {
                            handleReplaceMeal(recipe)
                          }
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Use This Recipe
                      </button>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Clickable overlay for non-swap mode */}
                  {!swapMode?.active && (
                    <button
                      onClick={() => handleRecipeClick(recipe)}
                      className="absolute inset-0 w-full h-full"
                      aria-label={`View ${recipe.title}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : null}
      </PageContainer>
    </div>
  )
}

export default function RecipeLibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>Loading...</div>}>
      <RecipeLibraryContent />
    </Suspense>
  )
}
