import { z } from 'zod';

export const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, 'Front text is required').max(5000, 'Front text too long'),
  back: z.string().min(1, 'Back text is required').max(5000, 'Back text too long'),
}).refine(data => data.front.trim() !== data.back.trim(), {
  message: "Front and back cannot be identical",
  path: ["back"],
});

export const updateCardSchema = z.object({
  id: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, 'Front text is required').max(5000, 'Front text too long'),
  back: z.string().min(1, 'Back text is required').max(5000, 'Back text too long'),
}).refine(data => data.front.trim() !== data.back.trim(), {
  message: "Front and back cannot be identical",
  path: ["back"],
});

export const deleteCardSchema = z.object({
  id: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

export const reorderCardsSchema = z.object({
  deckId: z.number().int().positive(),
  cardOrders: z.array(z.object({
    id: z.number().int().positive(),
    order: z.number().int().min(0),
  })).min(1, 'At least one card order is required'),
});

// Export TypeScript types from Zod schemas
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
export type ReorderCardsInput = z.infer<typeof reorderCardsSchema>;

