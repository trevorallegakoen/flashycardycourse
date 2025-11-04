'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { 
  createCardSchema, 
  updateCardSchema, 
  deleteCardSchema,
  reorderCardsSchema,
  type CreateCardInput,
  type UpdateCardInput,
  type DeleteCardInput,
  type ReorderCardsInput
} from '@/lib/validations/card';
import {
  insertCard,
  updateCardById,
  deleteCardById,
  verifyCardOwnership,
  updateCardsOrder,
} from '@/db/queries/card-queries';
import { getDeckById } from '@/db/queries/deck-queries';

export async function createCard(input: CreateCardInput) {
  try {
    // 1. Validate input with Zod
    const validated = createCardSchema.parse(input);
    
    // 2. Check authentication
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // 3. Verify deck ownership
    const deck = await getDeckById(validated.deckId, userId);
    if (!deck) {
      throw new Error('Deck not found or access denied');
    }
    
    // 4. Create card using query helper function
    const newCard = await insertCard({
      deckId: validated.deckId,
      front: validated.front,
      back: validated.back,
    });
    
    // 5. Revalidate affected paths
    revalidatePath(`/deck/${validated.deckId}`);
    revalidatePath('/dashboard');
    
    return { success: true, data: newCard };
  } catch (error) {
    console.error('Error creating card:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create card' 
    };
  }
}

export async function updateCard(input: UpdateCardInput) {
  try {
    // 1. Validate input
    const validated = updateCardSchema.parse(input);
    
    // 2. Check authentication
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // 3. Verify card and deck ownership
    const ownership = await verifyCardOwnership(validated.id, userId);
    if (!ownership) {
      throw new Error('Card not found or access denied');
    }
    
    // 4. Update card using query helper function
    const updated = await updateCardById(validated.id, validated.deckId, {
      front: validated.front,
      back: validated.back,
    });
    
    if (!updated) {
      throw new Error('Card not found or access denied');
    }
    
    // 5. Revalidate affected paths
    revalidatePath(`/deck/${validated.deckId}`);
    
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating card:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update card' 
    };
  }
}

export async function deleteCard(input: DeleteCardInput) {
  try {
    // 1. Validate input
    const validated = deleteCardSchema.parse(input);
    
    // 2. Check authentication
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // 3. Verify card and deck ownership
    const ownership = await verifyCardOwnership(validated.id, userId);
    if (!ownership) {
      throw new Error('Card not found or access denied');
    }
    
    // 4. Delete card using query helper function
    const deleted = await deleteCardById(validated.id, validated.deckId);
    
    if (!deleted) {
      throw new Error('Card not found or access denied');
    }
    
    // 5. Revalidate affected paths
    revalidatePath(`/deck/${validated.deckId}`);
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting card:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete card' 
    };
  }
}

export async function reorderCards(input: ReorderCardsInput) {
  try {
    // 1. Validate input
    const validated = reorderCardsSchema.parse(input);
    
    // 2. Check authentication
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // 3. Verify deck ownership
    const deck = await getDeckById(validated.deckId, userId);
    if (!deck) {
      throw new Error('Deck not found or access denied');
    }
    
    // 4. Update card orders using query helper function
    await updateCardsOrder(validated.deckId, validated.cardOrders);
    
    // 5. Revalidate affected paths
    revalidatePath(`/deck/${validated.deckId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error reordering cards:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reorder cards' 
    };
  }
}

