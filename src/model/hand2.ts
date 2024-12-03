import { Card, Deck, createInitialDeck } from './deck';
import { Shuffler, standardShuffler } from '../utils/random_utils';

export interface Hand {
    playerCount: number;
    dealer: number;
    drawPile: Deck;
    discardPile: Deck;
    playerInTurn(): number;
    player(index: number): string;
    playerHand(index: number): Card[];
}

export function createHand(
    players: string[],
    dealer: number,
    shuffler: Shuffler<Card> = standardShuffler,
    cardsPerPlayer: number = 7
): Hand {
    if (players.length < 2 || players.length > 10) {
        throw new Error("Player count must be between 2 and 10.");
    }
    if (dealer < 0 || dealer >= players.length) {
        throw new Error("Dealer index out of bounds.");
    }

    const deck = createInitialDeck();
    deck.shuffle(shuffler);

    const playerHands: Card[][] = [];
    for (let i = 0; i < players.length; i++) {
        playerHands.push([]);
        for (let j = 0; j < cardsPerPlayer; j++) {
            const card = deck.deal();
            if (card) {
                playerHands[i].push(card);
            }
        }
    }

    // Create discard pile and ensure the top card is not a wild card
    const discardPile = createInitialDeck();
    let topDiscard = deck.deal();
    discardPile.cards = [topDiscard!];
    discardPile.size = discardPile.cards.length;

    // Reshuffle the deck if the top card is a WILD or WILD DRAW
    while (topDiscard && (topDiscard.type === 'WILD' || topDiscard.type === 'WILD DRAW')) {
        deck.shuffle(shuffler); // Reshuffle until the top card is not a wild card
        topDiscard = deck.deal();
        discardPile.cards[0] = topDiscard!;
    }

    // Remaining cards form the draw pile
    const drawPile = createInitialDeck();
    drawPile.cards = [...deck.cards];
    drawPile.size = drawPile.cards.length;

    let currentTurn = (dealer + 1) % players.length;
    if (topDiscard && topDiscard.type === 'REVERSE') {
        currentTurn = (dealer - 1 + players.length) % players.length;
    } else if (topDiscard && topDiscard.type === 'SKIP') {
        currentTurn = (dealer + 2) % players.length;
    } else if (topDiscard && topDiscard.type === 'DRAW') {
        playerHands[currentTurn].push(drawPile.deal()!, drawPile.deal()!);
    }

    return {
        playerCount: players.length,
        dealer: dealer,
        drawPile: drawPile,
        discardPile: discardPile,
        playerInTurn: () => currentTurn,
        player: (index: number) => {
            if (index < 0 || index >= players.length) {
                throw new Error("Player index out of bounds.");
            }
            return players[index];
        },
        playerHand: (index: number) => {
            if (index < 0 || index >= playerHands.length) {
                throw new Error("Player index out of bounds.");
            }
            return playerHands[index];
        }
    };
}
