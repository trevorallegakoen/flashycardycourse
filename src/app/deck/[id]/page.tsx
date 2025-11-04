import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckWithCards } from "@/db/queries/deck-queries";
import { DeckPageClient } from "./deck-page-client";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const { id } = await params;
  const deckId = parseInt(id);

  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch deck with cards using query helper function
  const deckWithCards = await getDeckWithCards(deckId, userId);

  if (!deckWithCards) {
    notFound();
  }

  // Serialize data for client component to avoid hydration issues
  const serializedDeck = {
    ...deckWithCards,
    createdAt: deckWithCards.createdAt.toISOString(),
    cards: deckWithCards.cards.map(card => ({
      ...card,
      order: card.order ?? 0,
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    })),
  };

  return <DeckPageClient deckWithCards={serializedDeck} />;
}

