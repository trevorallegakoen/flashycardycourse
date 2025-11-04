'use client';

import { useState } from 'react';
import { updateDeck } from '@/app/actions/deck-actions';
import type { UpdateDeckInput } from '@/lib/validations/deck';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditDeckDialogProps {
  deckId: number;
  currentName: string;
  currentDescription: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDeckDialog({
  deckId,
  currentName,
  currentDescription,
  open,
  onOpenChange,
}: EditDeckDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const input: UpdateDeckInput = {
      id: deckId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    try {
      const result = await updateDeck(input);

      if (result.success) {
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] !bg-white dark:!bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">📝 Edit Deck</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update the name and description of your deck.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Deck Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter deck name..."
              defaultValue={currentName}
              required
              maxLength={255}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter deck description..."
              defaultValue={currentDescription || ''}
              maxLength={1000}
              rows={4}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl ring-2 ring-blue-400/50 hover:ring-blue-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '💾 Saving...' : '✅ Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

