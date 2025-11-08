'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { 
  createDeckSchema,
  updateDeckSchema,
  deleteDeckSchema,
  type CreateDeckInput,
  type UpdateDeckInput,
  type DeleteDeckInput
} from '@/lib/validations/deck';
import {
  insertDeck,
  updateDeckById,
  deleteDeckById,
} from '@/db/queries/deck-queries';

export async function createDeck(input: CreateDeckInput) {
  // 1. Validate input with Zod
  const validated = createDeckSchema.parse(input);
  
  // 2. Check authentication
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // 3. Call query helper function
  const newDeck = await insertDeck({
    userId,
    name: validated.name,
    description: validated.description,
  });
  
  // 4. Revalidate affected paths
  revalidatePath('/dashboard');
  
  return { success: true, data: newDeck };
}

export async function updateDeck(input: UpdateDeckInput) {
  // 1. Validate input
  const validated = updateDeckSchema.parse(input);
  
  // 2. Check authentication
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // 3. Call query helper function with ownership check
  const updated = await updateDeckById(validated.id, userId, {
    name: validated.name,
    description: validated.description,
  });
  
  if (!updated) {
    throw new Error('Deck not found or access denied');
  }
  
  // 4. Revalidate
  revalidatePath('/dashboard');
  revalidatePath(`/deck/${validated.id}`);
  
  return { success: true, data: updated };
}

export async function deleteDeck(input: DeleteDeckInput) {
  // 1. Validate input
  const validated = deleteDeckSchema.parse(input);
  
  // 2. Check authentication
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // 3. Call query helper function with ownership check
  const deleted = await deleteDeckById(validated.id, userId);
  
  if (!deleted) {
    throw new Error('Deck not found or access denied');
  }
  
  // 4. Revalidate
  revalidatePath('/dashboard');
  
  return { success: true };
}

