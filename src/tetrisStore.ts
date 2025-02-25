import { defineStore } from 'pinia';

export const useTetrisStore = defineStore('tetris', {
    state: () => ({
        score: 0,
        nextPiece: [] as number[][],
        nextPieceColor: 0
    }),
    actions: {
        updateScore(newScore: number) {
            this.score = newScore;
        },
        updateNextPiece(newNextPiece: number[][], newNextPieceColor: number) {
            this.nextPiece = newNextPiece;
            this.nextPieceColor = newNextPieceColor;
        }
    }
});