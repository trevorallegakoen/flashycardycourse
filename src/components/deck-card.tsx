'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye } from 'lucide-react';

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

  const handleViewClick = () => {
    router.push(`/deck/${deck.id}`);
  };

  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/deck/${deck.id}/study`);
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
      </div>
    </div>
  );
}

