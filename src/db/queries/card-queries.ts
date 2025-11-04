import { db } from '@/db/index';
import { cardsTable, decksTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ========================================
// READ QUERIES
// ========================================

/**
 * Get all cards for a specific deck ordered by their position
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.order, cardsTable.createdAt);
}

/**
 * Get a single card by ID with deck ownership verification
 */
export async function getCardById(cardId: number, deckId: number) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ));
  
  return card;
}

/**
 * Verify that a card belongs to a deck owned by the user
 */
export async function verifyCardOwnership(cardId: number, userId: string) {
  const [result] = await db
    .select({
      cardId: cardsTable.id,
      deckId: decksTable.id,
      userId: decksTable.userId,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
  
  return result;
}

// ========================================
// WRITE QUERIES
// ========================================

/**
 * Insert a new card into a deck
 */
export async function insertCard(data: {
  deckId: number;
  front: string;
  back: string;
}) {
  // Get the max order for cards in this deck
  const cards = await getCardsByDeckId(data.deckId);
  const maxOrder = cards.length > 0 ? Math.max(...cards.map(c => c.order || 0)) : -1;
  
  const [newCard] = await db
    .insert(cardsTable)
    .values({
      ...data,
      order: maxOrder + 1,
    })
    .returning();
  
  return newCard;
}

// ========================================
// UPDATE QUERIES
// ========================================

/**
 * Update an existing card
 */
export async function updateCardById(
  cardId: number,
  deckId: number,
  data: {
    front?: string;
    back?: string;
  }
) {
  const [updated] = await db
    .update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .returning();
  
  return updated;
}

/**
 * Update the order of multiple cards in a deck
 */
export async function updateCardsOrder(
  deckId: number,
  cardOrders: Array<{ id: number; order: number }>
) {
  // Update all cards in parallel
  const updates = await Promise.all(
    cardOrders.map(({ id, order }) =>
      db
        .update(cardsTable)
        .set({ order, updatedAt: new Date() })
        .where(and(
          eq(cardsTable.id, id),
          eq(cardsTable.deckId, deckId)
        ))
        .returning()
    )
  );
  
  return updates.map(u => u[0]).filter(Boolean);
}

// ========================================
// DELETE QUERIES
// ========================================

/**
 * Delete a card by ID
 */
export async function deleteCardById(cardId: number, deckId: number) {
  const [deleted] = await db
    .delete(cardsTable)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .returning();
  
  return deleted;
}

