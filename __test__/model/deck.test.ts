import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { createInitialDeck } from '../utils/test_adapter'
import { standardShuffler } from '../../src/utils/random_utils'
import { is } from '../utils/predicates'
import * as deck from '../../src/model/deck'
import { memoizingShuffler } from '../utils/shuffling'
import {Card, Deck} from "../../src/model/deck";

describe("Initial deck", () => {
  const initialDeck = createInitialDeck()
  it("contains 19 numbered blue cards", () => {
    expect(
      initialDeck.cards
      .filter(is({type: 'NUMBERED', color: 'BLUE'}))
      .length)
    .toEqual(19)
  })
  it("contains 19 numbered green cards", () => {
    expect(
      initialDeck.cards
      .filter(is({type: 'NUMBERED', color: 'GREEN'}))
      .length)
    .toEqual(19)
  })
  it("contains 19 numbered red cards", () => {
    expect(
      initialDeck.cards
      .filter(is({type: 'NUMBERED', color: 'RED'}))
      .length)
    .toEqual(19)
  })
  it("contains 19 numbered yellow cards", () => {
    expect(
      initialDeck.cards
      .filter(is({type: 'NUMBERED', color: 'YELLOW'}))
      .length)
    .toEqual(19)
  })
  it("only contains numbered cards with numbers between 0 and 9", () => {
    const numberedDeck = initialDeck.cards.filter(is({ type: 'NUMBERED' }));
    numberedDeck.forEach(card => {
      const n = (card as { number: number }).number
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(10)
    })
  })
  it("contains numbered cards of every legal number and color", () => {
    for(let color of deck.colors) {
      expect(initialDeck.cards.filter(is({number: 0, color})).length).toBe(1)
    }
  for(let number = 1; number < 10; number++) {
      for(let color of deck.colors) {
        expect(initialDeck.cards.filter(is({number, color})).length).toBe(2)
      }
    }
  })
  it("contains 8 skip cards", () => {
    expect(initialDeck.cards.filter(is({type: 'SKIP'})).length).toEqual(8)
  })
  it("contains 2 skip cards of each color", () => {
    for(let color of deck.colors) {
      expect(initialDeck.cards.filter(is({type: 'SKIP', color})).length).toBe(2)
    }
  })
  it("contains 8 reverse cards", () => {
    expect(initialDeck.cards.filter(is({type: 'REVERSE'})).length).toEqual(8)
  })
  it("contains 2 reverse cards of each color", () => {
    for(let color of deck.colors) {
      expect(initialDeck.cards.filter(is({type: 'REVERSE', color})).length).toBe(2)
    }
  })
  it("contains 8 draw cards", () => {
    expect(initialDeck.cards.filter(is({type: 'DRAW'})).length).toEqual(8)
  })
  it("contains 2 draw cards of each color", () => {
    for(let color of deck.colors) {
      expect(initialDeck.cards.filter(is({type:'DRAW',color})).length).toBe(2)
    }
  })
  it("contains 4 wild cards", () => {
    expect(initialDeck.cards.filter(is({type:'WILD'})).length).toEqual(4)
  })
  it("contains 4 wild draw cards", () => {
    expect(initialDeck.cards.filter(is({ type:'WILD DRAW' })).length).toEqual(4)
  })
  // Blank cards skipped, since they have no gameplay
  it("contains 108 cards", () => {
    expect(initialDeck.size).toEqual(108)
  })
})

describe("Deck methods", () => {
  describe("shuffle", () => {
    const deck = createInitialDeck();  // This should return a Deck object
    it("calls the shuffler", () => {
      const mockShuffler = jest.fn();
      deck.shuffle(mockShuffler);
      expect(mockShuffler).toHaveBeenCalled();
    });
  });

  describe("deal", () => {
    let deck: Deck = createInitialDeck();
    let shuffledCards: Readonly<Card[]> = [];
    const memoShuffler = memoizingShuffler(standardShuffler);

    beforeEach(() => {
      deck = createInitialDeck();
      deck.shuffle(memoShuffler.shuffler);  // Shuffle the deck with the memoized shuffler
      shuffledCards = memoShuffler.memo;  // Track the shuffled order
    });

    it("removes a card", () => {
      const deckSize = deck.size;
      deck.deal();  // Deal one card
      expect(deck.size).toEqual(deckSize - 1);  // Ensure the deck size decreases by 1
    });

    it("returns all cards in order", () => {
      const deckSize = deck.size;
      for (let i = 0; i < deckSize; i++) {
        let deck1 = deck.cards
        let deck2 = shuffledCards
        expect(deck.deal()).toEqual(shuffledCards[i]); // Compare the dealt card with shuffled order
      }

      expect(deck.size).toEqual(0);  // After dealing all cards, the deck should be empty
    });

    it("returns undefined if the deck is empty", () => {
      while (deck.size > 0) {
        deck.deal();  // Deal all cards
      }
      expect(deck.deal()).toBeUndefined();  // Once the deck is empty, it should return undefined
    });
  });
});