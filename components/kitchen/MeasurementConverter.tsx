'use client'

import { useState } from 'react'
import { ArrowRightLeft, X } from 'lucide-react'
import { convertMeasurement, formatConversion, type ConversionResult } from '@/lib/measurementConverter'

interface MeasurementConverterProps {
  quantity: string
  ingredient?: string
}

export default function MeasurementConverter({ quantity, ingredient }: MeasurementConverterProps) {
  const [showConversions, setShowConversions] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)

  const handleConvert = () => {
    if (showConversions) {
      setShowConversions(false)
      return
    }

    const measurementText = ingredient ? `${quantity} ${ingredient}` : quantity
    const conversion = convertMeasurement(measurementText)
    
    if (conversion) {
      setResult(conversion)
      setShowConversions(true)
    }
  }

  // Check if quantity contains a convertible unit
  const hasConvertibleUnit = () => {
    const units = ['oz', 'g', 'gram', 'cup', 'tbsp', 'tsp', 'ml', 'lb']
    return units.some(unit => quantity.toLowerCase().includes(unit))
  }

  if (!hasConvertibleUnit()) return null

  return (
    <div className="relative inline-block">
      <button
        onClick={handleConvert}
        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
        title="Convert measurement"
      >
        <ArrowRightLeft className="w-3 h-3" />
        {showConversions ? 'Hide' : 'Convert'}
      </button>

      {showConversions && result && (
        <div className="absolute left-0 top-full mt-1 z-10 bg-white border-2 border-purple-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-purple-900">Conversions:</div>
            <button
              onClick={() => setShowConversions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            {result.conversions.map((conv, idx) => (
              <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="text-purple-600">•</span>
                <span>{formatConversion(conv)}</span>
                {conv.label && conv.label !== conv.unit && (
                  <span className="text-xs text-gray-500">({conv.label})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
