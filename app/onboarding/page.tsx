'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { HomeProfile } from '@/types/home'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<HomeProfile>>({})

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1)
    } else {
      // Save profile and redirect to dashboard
      localStorage.setItem('homeProfile', JSON.stringify(profile))
      router.push('/today')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">
              How many people live in your home?
            </h1>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setProfile({ ...profile, numberOfPeople: num })
                    setTimeout(handleNext, 200)
                  }}
                  className="btn-primary text-2xl py-6"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">
              Do you have any pets?
            </h1>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setProfile({ ...profile, hasPets: true })
                  setTimeout(handleNext, 200)
                }}
                className="btn-primary w-full py-6 text-xl"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setProfile({ ...profile, hasPets: false })
                  setTimeout(handleNext, 200)
                }}
                className="btn-secondary w-full py-6 text-xl"
              >
                No
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">
              What type of home do you live in?
            </h1>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setProfile({ ...profile, homeType: 'apartment' })
                  setTimeout(handleNext, 200)
                }}
                className="btn-primary w-full py-6 text-xl"
              >
                Apartment
              </button>
              <button
                onClick={() => {
                  setProfile({ ...profile, homeType: 'house' })
                  setTimeout(handleNext, 200)
                }}
                className="btn-primary w-full py-6 text-xl"
              >
                House
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <StrugglesStep
            profile={profile}
            setProfile={setProfile}
            onNext={handleNext}
          />
        )

      case 5:
        return (
          <DietaryStep
            profile={profile}
            setProfile={setProfile}
            onNext={handleNext}
          />
        )

      case 6:
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">
              You're all set! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Let's get started managing your home.
            </p>
            <button onClick={handleNext} className="btn-primary w-full py-6 text-xl">
              Go to Dashboard
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-2xl w-full">
        {renderStep()}
        {step > 1 && step < 6 && (
          <button
            onClick={handleBack}
            className="mt-8 text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        )}
        <div className="mt-8 flex gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'bg-blue-500 w-8' : 'bg-gray-200 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StrugglesStep({
  profile,
  setProfile,
  onNext,
}: {
  profile: Partial<HomeProfile>
  setProfile: (p: Partial<HomeProfile>) => void
  onNext: () => void
}) {
  const [selected, setSelected] = useState<string[]>(profile.topStruggles || [])
  const options = [
    'Keeping up with cleaning',
    'Meal planning',
    'Shopping and errands',
    'Managing schedules',
    'Home maintenance',
    'Organizing',
    'Budgeting',
    'Other',
  ]

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option].slice(0, 3) // Max 3
    setSelected(newSelected)
    setProfile({ ...profile, topStruggles: newSelected })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold text-gray-900 mb-2">
        What are your top three struggles at home?
      </h1>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleToggle(option)}
            className={`w-full py-4 px-6 rounded-xl text-left transition-all ${
              selected.includes(option)
                ? 'bg-blue-500 text-white shadow-soft-lg'
                : 'bg-white/60 text-gray-700 shadow-soft hover:bg-white/80'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          onClick={onNext}
          className="btn-primary w-full py-6 text-xl mt-6"
        >
          Continue ({selected.length}/3)
        </button>
      )}
    </div>
  )
}

function DietaryStep({
  profile,
  setProfile,
  onNext,
}: {
  profile: Partial<HomeProfile>
  setProfile: (p: Partial<HomeProfile>) => void
  onNext: () => void
}) {
  const [selected, setSelected] = useState<string[]>(
    profile.dietaryPreferences || []
  )
  const options = [
    'Kosher',
    'Halal',
    'Vegan',
    'Vegetarian',
    'Gluten-free',
    'Dairy-free',
    'Nut allergies',
    'No restrictions',
  ]

  const handleToggle = (option: string) => {
    let newSelected: string[]
    if (option === 'No restrictions') {
      newSelected = ['No restrictions']
    } else {
      newSelected = selected.includes(option)
        ? selected.filter((s) => s !== option && s !== 'No restrictions')
        : [...selected.filter((s) => s !== 'No restrictions'), option]
    }
    setSelected(newSelected)
    setProfile({ ...profile, dietaryPreferences: newSelected })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold text-gray-900 mb-2">
        Any dietary preferences or restrictions?
      </h1>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleToggle(option)}
            className={`w-full py-4 px-6 rounded-xl text-left transition-all ${
              selected.includes(option)
                ? 'bg-blue-500 text-white shadow-soft-lg'
                : 'bg-white/60 text-gray-700 shadow-soft hover:bg-white/80'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button onClick={onNext} className="btn-primary w-full py-6 text-xl mt-6">
        Continue
      </button>
    </div>
  )
}
