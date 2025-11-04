'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

type SerializedCard = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type SerializedDeck = {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  cards: SerializedCard[];
};

interface StudyPageClientProps {
  deckWithCards: SerializedDeck;
}

export function StudyPageClient({ deckWithCards }: StudyPageClientProps) {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<SerializedCard[]>(deckWithCards.cards);

  const currentCard = shuffledCards[currentCardIndex];
  const totalCards = shuffledCards.length;
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === totalCards - 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (!isLastCard) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Show completion celebration
      setShowConfetti(true);
    }
  };

  const handlePrevious = () => {
    if (!isFirstCard) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowConfetti(false);
  };

  const handleShuffle = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...shuffledCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleBackToDeck = () => {
    router.push(`/deck/${deckWithCards.id}`);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          handleBackToDeck();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, isFlipped, showConfetti]);

  if (showConfetti) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="mb-4 -ml-2"
            >
              <Link href={`/deck/${deckWithCards.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Deck
              </Link>
            </Button>
          </div>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-8 mb-6">
                <div className="text-6xl">🎉</div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Congratulations!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                You've completed all <Badge variant="secondary" className="inline-flex mx-1">{totalCards}</Badge> cards in
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
                "{deckWithCards.name}"
              </p>
              <div className="flex gap-4 mt-4">
                <Button 
                  onClick={handleRestart} 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Study Again
                </Button>
                <Button 
                  onClick={handleBackToDeck} 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-200 dark:border-gray-700"
                >
                  Back to Deck
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="ghost"
            asChild
            className="mb-3"
          >
            <Link href={`/deck/${deckWithCards.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deck
            </Link>
          </Button>
          
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {deckWithCards.name}
            </h1>
            
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Card {currentCardIndex + 1} / {totalCards}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {Math.round(((currentCardIndex + 1) / totalCards) * 100)}% Complete
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                className="border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Progress</span>
            <span className="font-semibold">{currentCardIndex + 1} / {totalCards} Cards Viewed</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-500 ease-out shadow-md"
              style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-6">
          <Card
            className={`relative w-full cursor-pointer transition-all duration-500 transform-style-3d border-2 ${
              isFlipped 
                ? 'border-purple-200 dark:border-purple-800 shadow-2xl shadow-purple-500/20' 
                : 'border-blue-200 dark:border-blue-800 shadow-2xl shadow-blue-500/20'
            }`}
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              minHeight: 'min(70vh, 600px)',
            }}
            onClick={handleFlip}
          >
            {/* Front of card */}
            <CardContent
              className="absolute inset-0 backface-hidden p-8 md:p-16 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <Badge 
                className="mb-8 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-4 py-1.5"
              >
                QUESTION
              </Badge>
              <div className="text-3xl md:text-5xl font-bold mb-8 whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed max-w-4xl px-4">
                {currentCard.front}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full mt-auto">
                Click or press Space to reveal answer
              </div>
            </CardContent>

            {/* Back of card */}
            <CardContent
              className="absolute inset-0 backface-hidden p-8 md:p-16 flex flex-col items-center justify-center text-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <Badge 
                className="mb-8 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-1.5"
              >
                ANSWER
              </Badge>
              <div className="text-3xl md:text-5xl font-bold mb-8 whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed max-w-4xl px-4">
                {currentCard.back}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full mt-auto">
                Click or press Space to see question
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Controls */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={isFirstCard}
            className="border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 w-full text-xs md:text-base"
          >
            <ChevronLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Previous</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleFlip}
            className={`border-2 transition-all duration-300 font-semibold w-full text-xs md:text-base ${
              isFlipped
                ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/50'
                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50'
            }`}
          >
            <span className="hidden md:inline">{isFlipped ? 'Show Question' : 'Show Answer'}</span>
            <span className="md:hidden">Flip</span>
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full text-xs md:text-base"
          >
            <span className="hidden md:inline">{isLastCard ? 'Finish' : 'Next'}</span>
            <span className="md:hidden">{isLastCard ? '✓' : '→'}</span>
            {!isLastCard && <ChevronRight className="w-4 h-4 md:ml-2 hidden md:inline" />}
          </Button>
        </div>

        {/* Keyboard Shortcuts Hint - Hidden on mobile */}
        <div className="hidden md:block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-center text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts:</span>{' '}
            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs font-mono">Space</kbd> to flip,{' '}
            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs font-mono">←</kbd>{' '}
            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs font-mono">→</kbd> to navigate,{' '}
            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-xs font-mono">ESC</kbd> to exit
          </p>
        </div>
      </div>

      {/* Global styles for 3D flip effect */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}

