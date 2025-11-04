import { z } from 'zod';

export const createDeckSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

export const updateDeckSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

export const deleteDeckSchema = z.object({
  id: z.number().int().positive(),
});

// Export TypeScript types from Zod schemas
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

