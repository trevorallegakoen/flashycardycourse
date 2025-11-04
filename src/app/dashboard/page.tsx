import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserDecksWithCardCounts } from "@/db/queries/deck-queries";
import { DeckCard } from "@/components/deck-card";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  // Fetch user's decks with card counts using query helper function
  const decks = await getUserDecksWithCardCounts(userId);

  // Calculate total stats
  const totalDecks = decks.length;
  const totalCards = decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Welcome back, {user?.firstName || user?.emailAddresses[0].emailAddress}!
        </p>
        
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalDecks}
            </div>
            <h2 className="text-lg font-semibold mb-1">Total Decks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Flashcard collections
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {totalCards}
            </div>
            <h2 className="text-lg font-semibold mb-1">Total Cards</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Flashcards created
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {totalDecks > 0 ? Math.round(totalCards / totalDecks) : 0}
            </div>
            <h2 className="text-lg font-semibold mb-1">Avg Cards/Deck</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average per deck
            </p>
          </div>
        </div>

        {/* Decks List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Decks</h2>
            <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
              + Create New Deck
            </button>
          </div>

          {decks.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                You don't have any decks yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Create your first deck to start learning with flashcards
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

