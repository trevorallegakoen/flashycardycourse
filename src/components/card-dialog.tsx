'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createCard, updateCard } from '@/app/actions/card-actions';
import type { CreateCardInput, UpdateCardInput } from '@/lib/validations/card';

interface CardDialogProps {
  deckId: number;
  card?: {
    id: number;
    front: string;
    back: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDialog({ deckId, card, open, onOpenChange }: CardDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');

  const isEditing = !!card;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (isEditing) {
        const input: UpdateCardInput = {
          id: card.id,
          deckId,
          front,
          back,
        };
        result = await updateCard(input);
      } else {
        const input: CreateCardInput = {
          deckId,
          front,
          back,
        };
        result = await createCard(input);
      }

      if (result.success) {
        // Reset form and close dialog
        setFront('');
        setBack('');
        onOpenChange(false);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog is closed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFront(card?.front || '');
      setBack(card?.back || '');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] !bg-white dark:!bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{isEditing ? '✏️ Edit Card' : '✨ Add New Card'}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {isEditing
              ? 'Update the front and back of your flashcard.'
              : 'Create a new flashcard for this deck. Make it memorable!'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                🎯 Front (Question/Prompt)
              </Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter the question or prompt..."
                className="min-h-[100px] border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="back" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                💡 Back (Answer)
              </Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter the answer..."
                className="min-h-[100px] border-gray-300 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                required
              />
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? '💾 Saving...' : isEditing ? '✅ Update Card' : '➕ Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

