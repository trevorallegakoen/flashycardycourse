import { db } from '@/db/index';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, desc, sql, and, asc } from 'drizzle-orm';

// ========================================
// READ QUERIES
// ========================================

/**
 * Get all decks for a user with card counts
 * Uses LEFT JOIN to include decks even if they have no cards
 */
export async function getUserDecksWithCardCounts(userId: string) {
  return await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: sql<number>`cast(count(${cardsTable.id}) as integer)`,
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id)
    .orderBy(desc(decksTable.createdAt));
}

/**
 * Get all decks for a user without card counts
 */
export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));
}

/**
 * Get a single deck by ID with ownership verification
 */
export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
  
  return deck;
}

/**
 * Get a deck with all its cards
 */
export async function getDeckWithCards(deckId: number, userId: string) {
  const deck = await getDeckById(deckId, userId);
  
  if (!deck) {
    return null;
  }
  
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(asc(cardsTable.createdAt));
  
  return { ...deck, cards };
}

// ========================================
// WRITE QUERIES
// ========================================

/**
 * Insert a new deck
 */
export async function insertDeck(data: {
  userId: string;
  name: string;
  description?: string | null;
}) {
  const [newDeck] = await db.insert(decksTable)
    .values(data)
    .returning();
  
  return newDeck;
}

// ========================================
// UPDATE QUERIES
// ========================================

/**
 * Update a deck by ID with ownership verification
 */
export async function updateDeckById(
  deckId: number,
  userId: string,
  data: {
    name?: string;
    description?: string | null;
  }
) {
  const [updated] = await db.update(decksTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return updated;
}

// ========================================
// DELETE QUERIES
// ========================================

/**
 * Delete a deck by ID with ownership verification
 */
export async function deleteDeckById(deckId: number, userId: string) {
  const [deleted] = await db.delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return deleted;
}

