import 'reflect-metadata'
import { Service } from 'typedi'
import { useTetrisStore } from './tetrisStore'

@Service()
export class TetrisService {
  private store = useTetrisStore()

  updateScore(newScore: number) {
    this.store.updateScore(newScore)
  }

  updateNextPiece(newNextPiece: number[][], newNextPieceColor: number) {
    this.store.updateNextPiece(newNextPiece, newNextPieceColor)
  }

  getScore() {
    return this.store.score
  }

  getNextPiece() {
    return {
      piece: this.store.nextPiece,
      color: this.store.nextPieceColor,
    }
  }
}
