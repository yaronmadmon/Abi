/**
 * Today Page
 * Main entry point with calming message, daily cards, and input
 */

import { useState } from 'react';
import { InputArea, InputMode } from '@/ui/components/InputArea';
import { DailyCard } from '@/ui/components/DailyCard';
import { ParsedResults } from '@/ui/components/ParsedResults';
import { SmartPrompt } from '@/ui/components/SmartPrompt';
import { InputParser } from '@/ai/parser/InputParser';
import { Input, InputType } from '@/ai/types';
import { TodayItem, ParsedItem } from '@/types/today';
import { getCalmingMessage } from '@/utils/messages';
import { useEmotionalContext } from '@/context/EmotionalContext';
import { generateEncouragement } from '@/utils/mood';
import './Today.css';

const MAX_DAILY_CARDS = 5;

export function Today() {
  const [calmingMessage] = useState(getCalmingMessage());
  const [dailyItems, setDailyItems] = useState<TodayItem[]>([]);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.FREE_FORM);
  
  const { smartQuestions, dismissQuestion, currentMood, shouldSpeak, formatAIMessage } = useEmotionalContext();
  const encouragement = generateEncouragement(currentMood);
  const displayMessage = encouragement ? formatAIMessage(encouragement) : calmingMessage;

  const parser = new InputParser();

  // Handle input submission
  const handleInput = async (text: string) => {
    setIsParsing(true);
    
    try {
      const input: Input = {
        id: `input-${Date.now()}`,
        type: InputType.TEXT,
        content: text,
        timestamp: new Date().toISOString(),
      };

      let items: ParsedItem[];
      if (inputMode === InputMode.BRAIN_DUMP) {
        items = await parser.parseBrainDump(input);
      } else {
        items = await parser.parseSingle(input);
      }

      setParsedItems(items);
    } catch (error) {
      console.error('Error parsing input:', error);
    } finally {
      setIsParsing(false);
    }
  };

  // Handle confirmation of parsed items
  const handleConfirm = (items: ParsedItem[]) => {
    // Convert parsed items to today items (no actual creation yet)
    const newTodayItems: TodayItem[] = items.map((item) => ({
      id: item.id,
      type: item.type === 'event' ? 'event' : item.type === 'task' ? 'task' : 'reminder',
      title: item.title,
      description: item.description,
      time: item.startTime || item.dueDate,
      priority: item.priority,
    }));

    // Add to daily items (capped at MAX_DAILY_CARDS)
    setDailyItems((prev) => {
      const combined = [...newTodayItems, ...prev];
      return combined.slice(0, MAX_DAILY_CARDS);
    });

    // Clear parsed items
    setParsedItems([]);
  };

  // Handle cancel of parsed items
  const handleCancel = () => {
    setParsedItems([]);
  };

  // Display only items relevant today (placeholder logic)
  const displayedItems = dailyItems.slice(0, MAX_DAILY_CARDS);

  // Only show smart prompts if AI should speak
  const visibleQuestions = smartQuestions.filter(q => shouldSpeak(true));

  return (
    <div className="today">
      {/* Calming message / Encouragement */}
      {shouldSpeak(true) && (
        <div className="today__message">
          <p className="today__message-text">{displayMessage}</p>
        </div>
      )}

      {/* Smart prompts */}
      {visibleQuestions.length > 0 && (
        <div className="today__prompts">
          {visibleQuestions.slice(0, 2).map((question) => (
            <SmartPrompt
              key={question.id}
              question={question}
              onDismiss={dismissQuestion}
            />
          ))}
        </div>
      )}

      {/* Daily cards */}
      {displayedItems.length > 0 && (
        <div className="today__cards">
          {displayedItems.map((item) => (
            <DailyCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="today__input">
        <div className="today__input-mode-toggle">
          <button
            onClick={() => setInputMode(InputMode.FREE_FORM)}
            className={`today__mode-button ${inputMode === InputMode.FREE_FORM ? 'today__mode-button--active' : ''}`}
            aria-pressed={inputMode === InputMode.FREE_FORM}
          >
            Single
          </button>
          <button
            onClick={() => setInputMode(InputMode.BRAIN_DUMP)}
            className={`today__mode-button ${inputMode === InputMode.BRAIN_DUMP ? 'today__mode-button--active' : ''}`}
            aria-pressed={inputMode === InputMode.BRAIN_DUMP}
          >
            Brain Dump
          </button>
        </div>
        <InputArea
          mode={inputMode}
          onInput={handleInput}
          disabled={isParsing}
        />
      </div>

      {/* Parsed results */}
      {parsedItems.length > 0 && (
        <ParsedResults
          items={parsedItems}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
