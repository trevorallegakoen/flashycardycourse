'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { 
  updateDeckSchema,
  type UpdateDeckInput
} from '@/lib/validations/deck';
import {
  updateDeckById,
} from '@/db/queries/deck-queries';

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

