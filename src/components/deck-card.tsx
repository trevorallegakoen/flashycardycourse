'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { BookOpen, Eye, Trash2 } from 'lucide-react';
import { deleteDeck } from '@/app/actions/deck-actions';

type DeckCardProps = {
  deck: {
    id: number;
    name: string;
    description: string | null;
    updatedAt: Date | string;
    cardCount: number;
  };
};

export function DeckCard({ deck }: DeckCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewClick = () => {
    router.push(`/deck/${deck.id}`);
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/deck/${deck.id}/study`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteDeck({ id: deck.id });
      router.refresh();
    } catch (error) {
      console.error('Failed to delete deck:', error);
      alert('Failed to delete deck. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Format date consistently for both server and client
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="group relative p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleViewClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {deck.name}
        </h3>
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-full">
          {deck.cardCount} cards
        </span>
      </div>
      
      {deck.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {deck.description}
        </p>
      )}
      
      <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-500 mb-4">
        <span>
          Last Updated {formatDate(deck.updatedAt)}
        </span>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Button
          size="sm"
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
          disabled={deck.cardCount === 0}
          onClick={handleStudyClick}
        >
          <BookOpen className="w-3 h-3 mr-1" />
          Study
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={handleViewClick}
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDeleteClick}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent 
          onClick={(e) => e.stopPropagation()}
          className="sm:max-w-[500px] border-2 border-red-200 dark:border-red-900/50 shadow-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              🗑️ Delete Deck?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground/80">
              This will permanently delete the deck <span className="font-semibold text-foreground">&quot;{deck.name}&quot;</span> and all <span className="font-semibold text-foreground">{deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}</span> inside it. 
              <br />
              <br />
              <span className="font-semibold text-red-600 dark:text-red-400">⚠️ This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel 
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl ring-2 ring-red-400/50 hover:ring-red-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

