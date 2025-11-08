'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CardDialog } from '@/components/card-dialog';
import { CardItem } from '@/components/card-item';
import { EditDeckDialog } from '@/components/edit-deck-dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { reorderCards } from '@/app/actions/card-actions';
import type { ReorderCardsInput } from '@/lib/validations/card';

interface DeckPageClientProps {
  deckWithCards: {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    cards: Array<{
      id: number;
      deckId: number;
      front: string;
      back: string;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

export function DeckPageClient({ deckWithCards }: DeckPageClientProps) {
  const router = useRouter();
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);
  const [cards, setCards] = useState(deckWithCards.cards);
  const [isReordering, setIsReordering] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Update local cards state when server data changes
  useEffect(() => {
    setCards(deckWithCards.cards);
  }, [deckWithCards.cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = cards.findIndex((card) => card.id === active.id);
    const newIndex = cards.findIndex((card) => card.id === over.id);

    const newCards = arrayMove(cards, oldIndex, newIndex);
    
    // Optimistically update the UI
    setCards(newCards);
    setIsReordering(true);

    try {
      // Create the reorder input with new positions
      const cardOrders = newCards.map((card, index) => ({
        id: card.id,
        order: index,
      }));

      const input: ReorderCardsInput = {
        deckId: deckWithCards.id,
        cardOrders,
      };

      const result = await reorderCards(input);

      if (!result.success) {
        // Revert on error
        setCards(deckWithCards.cards);
        alert(result.error || 'Failed to reorder cards');
      }
    } catch (error) {
      // Revert on error
      setCards(deckWithCards.cards);
      alert(error instanceof Error ? error.message : 'Failed to reorder cards');
    } finally {
      setIsReordering(false);
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleCardSuccess() {
    // Refresh the server component data to get the latest cards
    router.refresh();
  }

  const activeCard = activeId ? cards.find((card) => card.id === activeId) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="mb-4 -ml-2"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{deckWithCards.name}</h1>
              {deckWithCards.description && (
                <p className="text-muted-foreground mb-4">
                  {deckWithCards.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                </Badge>
                <Badge variant="outline">
                  Created {new Date(deckWithCards.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 sm:flex-col md:flex-row">
              <Button 
                asChild
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={cards.length === 0}
              >
                <Link href={`/deck/${deckWithCards.id}/study`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Study
                </Link>
              </Button>
              <Button 
                onClick={() => setIsAddCardOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDeckOpen(true)}
                className="border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Deck
              </Button>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          
          {cards.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-4 mb-4">
                  <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  No cards in this deck yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm leading-relaxed">
                  Add your first card to start learning. Create flashcards with questions on the front and answers on the back.
                </p>
                <Button 
                  onClick={() => setIsAddCardOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={cards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((card) => (
                    <CardItem 
                      key={card.id} 
                      card={card} 
                      disabled={isReordering} 
                      onSuccess={handleCardSuccess}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeCard ? (
                  <div className="opacity-100 rotate-3 scale-105">
                    <CardItem card={activeCard} disabled />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      <CardDialog
        deckId={deckWithCards.id}
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
        onSuccess={handleCardSuccess}
      />

      <EditDeckDialog
        deckId={deckWithCards.id}
        currentName={deckWithCards.name}
        currentDescription={deckWithCards.description}
        open={isEditDeckOpen}
        onOpenChange={setIsEditDeckOpen}
      />
    </div>
  );
}

