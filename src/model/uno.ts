import * as Hand from './hand'
import {Shuffler, standardShuffler} from '../utils/random_utils'
import { Card } from './deck'
import {createHand} from "./hand";

export interface Game {
    playerCount: number
    targetScore: number //
    currentHand(): Hand | undefined //
    winner(): number | undefined //
    score(playerIndex: number): number
    player(index: number): string
    startNewHand(): void //
    endGame(): void //
    updateScores(): void
    dealer: number
    players: string[]
}

export function createGame(
    players: string[],
    targetScore: number,
    shuffler: Shuffler<Card> = standardShuffler,
    cardsPerPlayer: number = 7,
    dealer: number
): Game {
    if (players.length < 2) {
        throw new Error("Game requires at least 2 players.")
    }
    if (targetScore == undefined) {
        targetScore = 500
    }
    if (targetScore <= 0) {
        throw new Error("Target score must be greater than 0.")
    }

    let gameEnded = false
    let gameWinner: number | undefined
    let hands: Hand[] = []
    let currentHandIndex = 0
    let scores: number[] = Array(players.length).fill(0)
    if(dealer == undefined) dealer = Math.floor(Math.random() * players.length)

    // Create the initial hand
    function startNewHand() {
        let hand:Hand = createHand(players, dealer, shuffler, cardsPerPlayer)
        hands.push(hand)
        currentHandIndex = hands.length - 1
    }

    function endGame() {
        gameEnded = true
    }

    function currentHand(): Hand {
        return hands[currentHandIndex]
    }

    function winner(): number | undefined {
        if (gameEnded) {
            return gameWinner
        }

        // Check if anyone has won
        for (let i = 0; i < players.length; i++) {
            if (scores[i] >= targetScore) {
                gameWinner = i
                gameEnded = true
                break
            }
        }
        return gameWinner
    }

    function score(playerIndex: number): number {
        return scores[playerIndex]
    }

    function player(index: number): string {
        if (index < 0 || index >= players.length) {
            throw new Error("Player index out of bounds.")
        }
        return players[index]
    }

    // Start the first hand
    startNewHand()

    // After the round has been finished, this method have to be called, in order to update the scores
    function updateScores() {
        const winner = currentHand().winner();
        const handScore = currentHand().score();

        if (winner !== undefined && handScore !== undefined) {
            scores[winner] += handScore;
        }

        if (!gameEnded) {
            startNewHand();  // Start a new hand if the game is not over
        }
    }

    /* Listen for when a hand ends and update the scores
    // Observe when the hand ends and update the scores
    const endHandObserver = () => {
        const hand = currentHand();
        if (hand && hand.hasEnded()) {  // Ensure that the hand object exists and has ended
            const winner = hand.winner();
            const handScore = hand.score();

            if (winner !== undefined && handScore !== undefined) {
                scores[winner] += handScore;
            }

            if (!gameEnded) {
                startNewHand();  // Start a new hand if the game is not over
            }
        }
    };*/

    /* Safely check the end of the hand by subscribing to the hasEnded call
    const originalHasEnded = currentHand()?.hasEnded;
    if (originalHasEnded) {
        // Wrap the original hasEnded method with custom behavior
        currentHand().hasEnded = () => {
            const result = originalHasEnded.call(currentHand());  // Call the original hasEnded function
            endHandObserver();  // Observe the hand end event
            return result;  // Return the original result
        };
    }*/


    return <Game>{
        playerCount: players.length,
        targetScore,
        currentHand,
        winner,
        score,
        player,
        startNewHand,
        endGame,
        updateScores,
        dealer,
        players,
    }
}
