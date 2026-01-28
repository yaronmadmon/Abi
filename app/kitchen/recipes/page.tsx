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
              className="inline-flex items-center gap-2 text-sm mb-3 transition-colors duration-250"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel Swap
            </button>
          ) : (
            <Link href="/kitchen" className="text-sm mb-3 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
              ← Back to Kitchen
            </Link>
          )}
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {swapMode?.active ? 'Swap Meal' : 'Recipe Library'}
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {swapMode?.active 
              ? `Replacing ${swapMode.mealType} for ${new Date(swapMode.day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
              : 'Browse and discover delicious recipes'}
          </p>
        </div>

        {/* Swap Mode Banner */}
        {swapMode?.active && (
          <div className="mb-6 rounded-2xl p-4 transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)', border: '2px solid var(--glass-border)' }}>
            <div className="flex items-start gap-3">
              <RefreshCw className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
              <div className="flex-1">
                <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Swap Mode Active</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Select a new recipe to replace your current {swapMode.mealType} on {new Date(swapMode.day).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Allergy Banner */}
        {householdAllergens.length > 0 && (
          <div className="mb-6 rounded-2xl p-4 transition-all duration-250" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '2px solid rgba(248, 113, 113, 0.3)' }}>
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
              <div className="flex-1">
                <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Allergy-Safe Mode Active</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Filtering out recipes containing: {formatAllergenNames(householdAllergens)}
                </p>
                <Link
                  href="/kitchen/settings/allergies"
                  className="text-sm font-medium underline transition-colors duration-250"
                  style={{ color: 'var(--error)' }}
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none transition-all duration-250"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-250"
                style={{ color: 'var(--text-muted)' }}
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
            className="flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-250"
            style={{
              backgroundColor: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: viewMode === 'grid' ? 'white' : 'var(--text-primary)',
              border: viewMode === 'grid' ? 'none' : '1px solid var(--glass-border)',
              boxShadow: viewMode === 'grid' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Browse Grid
          </button>
          <button
            onClick={() => {
              setViewMode('discover')
              setCurrentDiscoverIndex(0)
            }}
            className="flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-250"
            style={{
              backgroundColor: viewMode === 'discover' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: viewMode === 'discover' ? 'white' : 'var(--text-primary)',
              border: viewMode === 'discover' ? 'none' : '1px solid var(--glass-border)',
              boxShadow: viewMode === 'discover' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Discover Mode
          </button>
          <button
            onClick={() => setShowLikedOnly(!showLikedOnly)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-250"
            style={{
              backgroundColor: showLikedOnly ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: showLikedOnly ? 'white' : 'var(--text-primary)',
              border: showLikedOnly ? 'none' : '1px solid var(--glass-border)',
              boxShadow: showLikedOnly ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
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
                className="flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-250"
                style={{
                  backgroundColor: selectedCategory === cat.id ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: selectedCategory === cat.id ? 'white' : 'var(--text-primary)',
                  border: selectedCategory === cat.id ? 'none' : '1px solid var(--glass-border)',
                  boxShadow: selectedCategory === cat.id ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                  }
                }}
              >
                {cat.label} {cat.count > 0 && `(${cat.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine Filter */}
        <div className="mb-6 overflow-x-auto pb-2">
          <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Cuisine</p>
          <div className="flex gap-2">
            {cuisineCategories.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => setSelectedCuisine(cuisine.id)}
                className="flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-250"
                style={{
                  backgroundColor: selectedCuisine === cuisine.id ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: selectedCuisine === cuisine.id ? 'white' : 'var(--text-primary)',
                  border: selectedCuisine === cuisine.id ? 'none' : '1px solid var(--glass-border)',
                  boxShadow: selectedCuisine === cuisine.id ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCuisine !== cuisine.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCuisine !== cuisine.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                  }
                }}
              >
                {cuisine.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
              className="rounded-2xl shadow-lg overflow-hidden relative transition-all duration-250"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const recipe = filteredRecipes[currentDiscoverIndex]
                const isLiked = likedRecipes.includes(recipe.id)
                
                return (
                    <>
                    <div className="aspect-video w-full overflow-hidden relative" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
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
                        <div className="text-xs font-medium uppercase" style={{ color: 'var(--accent-primary)' }}>
                          {recipe.mealType}
                        </div>
                        <div className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                          {recipe.cuisine}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        {recipe.title}
                      </h3>
                      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.totalTime} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Serves {recipe.servings}
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full transition-all duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                          {recipe.difficulty}
                        </div>
                      </div>

                      {/* Swipe Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => handleSwipeAction('skip')}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-250"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Skip
                        </button>
                        <button
                          onClick={() => handleSwipeAction('like')}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-250"
                          style={{
                            backgroundColor: isLiked ? 'var(--accent-primary)' : 'rgba(139, 158, 255, 0.1)',
                            color: isLiked ? 'white' : 'var(--accent-primary)'
                          }}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                          {isLiked ? 'Liked' : 'Like'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleRecipeClick(recipe)}
                        className="w-full py-3 px-4 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-250 flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
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

            <div className="mt-6 p-4 rounded-xl border transition-all duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)', border: '1px solid var(--glass-border)' }}>
              <p className="text-sm text-center" style={{ color: 'var(--text-primary)' }}>
                💡 <strong>Swipe right</strong> to like recipes, <strong>swipe left</strong> to skip
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' && filteredRecipes.length === 0 ? (
          <div className="rounded-2xl p-12 text-center shadow-sm transition-all duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>No recipes found. Try searching for something delicious!</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredRecipes.map((recipe) => {
              const isLiked = likedRecipes.includes(recipe.id)
              return (
                <div
                  key={recipe.id}
                  className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-250 border-2 relative"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  {/* Liked badge */}
                  {isLiked && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10" style={{ backgroundColor: 'var(--accent-primary)' }}>
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  
                  <div 
                    onClick={swapMode?.active ? undefined : () => handleRecipeClick(recipe)}
                    className={`aspect-video w-full overflow-hidden relative ${!swapMode?.active ? 'cursor-pointer' : ''}`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
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
                      <div className="text-xs font-medium uppercase" style={{ color: 'var(--accent-primary)' }}>
                        {recipe.mealType}
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                        {recipe.cuisine}
                      </div>
                    </div>
                    <h3 
                      onClick={swapMode?.active ? undefined : () => handleRecipeClick(recipe)}
                      className={`font-semibold mb-2 line-clamp-2 transition-colors duration-250 ${!swapMode?.active ? 'cursor-pointer' : ''}`}
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => {
                        if (!swapMode?.active) {
                          e.currentTarget.style.color = 'var(--accent-primary)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!swapMode?.active) {
                          e.currentTarget.style.color = 'var(--text-primary)'
                        }
                      }}
                    >
                      {recipe.title}
                    </h3>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
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
                        className="w-full py-2.5 px-4 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-250 flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      >
                        <Check className="w-4 h-4" />
                        Use This Recipe
                      </button>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full transition-all duration-250"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
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
