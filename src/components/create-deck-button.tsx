'use client';

import { useState } from 'react';
import { CreateDeckDialog } from '@/components/create-deck-dialog';

export function CreateDeckButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setDialogOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
      >
        + Create New Deck
      </button>
      
      <CreateDeckDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
}

