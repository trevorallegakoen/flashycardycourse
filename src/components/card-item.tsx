'use client';

import { useState, memo } from 'react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCard } from '@/app/actions/card-actions';
import { CardDialog } from './card-dialog';
import type { DeleteCardInput } from '@/lib/validations/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardItemProps {
  card: {
    id: number;
    deckId: number;
    front: string;
    back: string;
  };
  disabled?: boolean;
}

export const CardItem = memo(function CardItem({ card, disabled }: CardItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      const input: DeleteCardInput = {
        id: card.id,
        deckId: card.deckId,
      };

      const result = await deleteCard(input);

      if (!result.success) {
        alert(result.error || 'Failed to delete card');
      } else {
        setIsDeleteOpen(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    if (!disabled && !isDeleting) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style}
        className={`overflow-hidden border-gray-200 dark:border-gray-700 ${
          isDragging 
            ? 'opacity-50 shadow-2xl scale-105 cursor-grabbing' 
            : 'hover:shadow-xl transition-shadow duration-200'
        } ${
          isFlipped 
            ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
        }`}
        suppressHydrationWarning
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <button
              className={`p-1.5 rounded touch-none ${
                isDragging 
                  ? 'cursor-grabbing bg-white/50 dark:bg-white/10' 
                  : 'cursor-grab hover:bg-white/50 dark:hover:bg-white/10 transition-colors'
              }`}
              {...attributes}
              {...listeners}
              disabled={disabled || isDeleting}
              aria-label="Drag to reorder"
              suppressHydrationWarning
            >
              <GripVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(true)}
                disabled={disabled || isDeleting}
                className="h-8 w-8 hover:bg-white/50 dark:hover:bg-white/10"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit card</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={disabled || isDeleting}
                className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete card</span>
              </Button>
            </div>
          </div>

          <div 
            onClick={handleCardClick}
            className={`rounded-lg p-4 -m-2 min-h-[220px] flex flex-col group ${
              isDragging 
                ? 'pointer-events-none' 
                : 'cursor-pointer hover:bg-white/30 dark:hover:bg-white/5 transition-colors duration-200'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick();
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Badge 
                variant={isFlipped ? "default" : "secondary"} 
                className={`text-xs font-semibold ${
                  isFlipped 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                {isFlipped ? "ANSWER" : "QUESTION"}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to flip
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-xl font-semibold text-center whitespace-pre-wrap w-full leading-relaxed text-gray-800 dark:text-gray-100">
                {isFlipped ? card.back : card.front}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardDialog
        deckId={card.deckId}
        card={card}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[500px] !bg-white dark:!bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Delete Card
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 pt-2">
              Are you sure you want to delete this card? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="mb-2">
                <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs">
                  QUESTION
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-3 line-clamp-2">
                {card.front}
              </p>
              <div className="mb-2">
                <Badge className="bg-purple-600 text-white text-xs">
                  ANSWER
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {card.back}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl ring-2 ring-red-400/50 hover:ring-red-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

