'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Shuffle, CheckCircle2, XCircle } from 'lucide-react';

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
  const [cardResults, setCardResults] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentCard = shuffledCards[currentCardIndex];
  const totalCards = shuffledCards.length;
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === totalCards - 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCorrect = () => {
    setCardResults(prev => ({
      ...prev,
      [currentCard.id]: 'correct'
    }));
    setHasAnswered(true);
  };

  const handleIncorrect = () => {
    setCardResults(prev => ({
      ...prev,
      [currentCard.id]: 'incorrect'
    }));
    setHasAnswered(true);
  };

  const handleNext = () => {
    if (!isLastCard) {
      // Flip to front first, then change card after animation completes (300ms)
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
        setHasAnswered(false);
      }, 300);
    } else {
      // Show completion celebration
      setShowConfetti(true);
    }
  };

  const handlePrevious = () => {
    if (!isFirstCard) {
      const previousCardIndex = currentCardIndex - 1;
      const previousCard = shuffledCards[previousCardIndex];
      // Flip to front first, then change card after animation completes (300ms)
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCardIndex(previousCardIndex);
        // Restore answered state if the previous card was already answered
        setHasAnswered(!!cardResults[previousCard.id]);
      }, 300);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowConfetti(false);
    setCardResults({});
    setHasAnswered(false);
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
    setCardResults({});
    setHasAnswered(false);
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
    // Calculate statistics
    const correctCount = Object.values(cardResults).filter(r => r === 'correct').length;
    const incorrectCount = Object.values(cardResults).filter(r => r === 'incorrect').length;
    const answeredCount = correctCount + incorrectCount;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated gradient background matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                asChild
                className="mb-4 -ml-2 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={`/deck/${deckWithCards.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Deck
                </Link>
              </Button>
            </div>

            {/* Main Content Card with Glass Morphism */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 sm:p-12 shadow-2xl">
              <div className="flex flex-col items-center justify-center text-center">
                {/* Celebration Icon */}
                <div className="rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm p-8 mb-6 border border-white/30">
                  <div className="text-6xl">🎉</div>
                </div>

                {/* Title */}
                <h1 className="text-5xl font-bold mb-4 text-white">
                  Congratulations!
                </h1>
                <p className="text-lg text-gray-200 mb-2">
                  You've completed all <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white font-semibold mx-1">{totalCards}</span> cards in
                </p>
                <p className="text-xl font-semibold text-white mb-12">
                  "{deckWithCards.name}"
                </p>

                {/* Statistics */}
                <div className="w-full max-w-2xl mb-8">
                  {/* Accuracy Score - Large Display */}
                  <div className="mb-8 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="text-7xl font-bold mb-3 bg-gradient-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                      {accuracy}%
                    </div>
                    <p className="text-base text-gray-200 font-medium uppercase tracking-wide">Accuracy</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {/* Total Answered */}
                    <div className="group bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="text-5xl font-bold text-white mb-3">{answeredCount}</div>
                      <p className="text-xs text-gray-200 uppercase tracking-wide">Cards Answered</p>
                    </div>

                    {/* Correct */}
                    <div className="group bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-green-300 mb-1">{correctCount}</div>
                        <CheckCircle2 className="w-6 h-6 text-green-300 mb-2" />
                      </div>
                      <p className="text-xs text-gray-200 uppercase tracking-wide">Correct</p>
                    </div>

                    {/* Incorrect */}
                    <div className="group bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-red-300 mb-1">{incorrectCount}</div>
                        <XCircle className="w-6 h-6 text-red-300 mb-2" />
                      </div>
                      <p className="text-xs text-gray-200 uppercase tracking-wide">Incorrect</p>
                    </div>
                  </div>

                  {/* Performance message */}
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-base font-medium text-white">
                      {accuracy >= 90 && '🌟 Outstanding! You know this deck very well!'}
                      {accuracy >= 70 && accuracy < 90 && '✨ Great job! You have a solid understanding!'}
                      {accuracy >= 50 && accuracy < 70 && '💪 Good effort! A bit more practice will help!'}
                      {accuracy < 50 && '📚 Keep practicing! You\'re building your knowledge!'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Button 
                    onClick={handleRestart} 
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Study Again
                  </Button>
                  <Button 
                    onClick={handleBackToDeck} 
                    variant="outline" 
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300"
                  >
                    Back to Deck
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animation styles */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
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
            <div className="flex items-center gap-3">
              <span className="font-semibold">{currentCardIndex + 1} / {totalCards} Cards Viewed</span>
              {Object.keys(cardResults).length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {Object.values(cardResults).filter(r => r === 'correct').length}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">|</span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    {Object.values(cardResults).filter(r => r === 'incorrect').length}
                  </span>
                </div>
              )}
            </div>
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

        {/* Answer Buttons - Show after flipping */}
        {isFlipped && !hasAnswered && (
          <div className="mb-6">
            <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Did you get it right?
            </p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Button
                size="lg"
                onClick={handleIncorrect}
                variant="outline"
                className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Incorrect
              </Button>
              <Button
                size="lg"
                onClick={handleCorrect}
                className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Correct
              </Button>
            </div>
          </div>
        )}

        {/* Answer Status - Show after answering */}
        {hasAnswered && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border-2 text-center font-semibold flex items-center justify-center gap-2 ${
              cardResults[currentCard.id] === 'correct'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              {cardResults[currentCard.id] === 'correct' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Marked as Correct</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Marked as Incorrect</span>
                </>
              )}
            </div>
          </div>
        )}

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
            disabled={hasAnswered}
            className={`border-2 transition-all duration-300 font-semibold w-full text-xs md:text-base disabled:opacity-50 ${
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
            disabled={!hasAnswered}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full text-xs md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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

