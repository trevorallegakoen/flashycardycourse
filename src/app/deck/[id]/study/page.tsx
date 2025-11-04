import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckWithCards } from "@/db/queries/deck-queries";
import { StudyPageClient } from "./study-page-client";

export default async function StudyPage({
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

  // Check if deck has cards
  if (deckWithCards.cards.length === 0) {
    redirect(`/deck/${deckId}`);
  }

  // Serialize data for client component to avoid hydration issues
  const serializedDeck = {
    ...deckWithCards,
    createdAt: deckWithCards.createdAt.toISOString(),
    updatedAt: deckWithCards.updatedAt.toISOString(),
    cards: deckWithCards.cards.map(card => ({
      ...card,
      order: card.order ?? 0,
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    })),
  };

  return <StudyPageClient deckWithCards={serializedDeck} />;
}

