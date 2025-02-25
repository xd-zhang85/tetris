import Phaser from 'phaser';
import { Container } from 'typedi';
import { TetrisService } from './TetrisService';

// 方块的形状
export const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
];

// 方块的颜色
export const COLORS = [
    0x00FFFF, 0xFFFF00, 0xFFA500, 0x00FF00, 0xFF00FF, 0xFF0000, 0x0000FF
];

// 方块下落的时间间隔（毫秒）
const FALL_INTERVAL = 500;

// 游戏开始时额外生成的方块数量
const INITIAL_BLOCK_COUNT = 3;

export default class TetrisScene extends Phaser.Scene {
    private board: number[][];
    private currentPiece!: typeof SHAPES[number];
    private currentX!: number;
    private currentY!: number;
    private pieceColor!: typeof COLORS[number];
    private blockSize: number = 30;
    private fallEvent: Phaser.Time.TimerEvent | null = null;
    private graphics: Phaser.GameObjects.Graphics | null = null;
    private tetrisService: TetrisService;
    private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private firstLineCleared: boolean = false; // 标记是否已经进行了第一次行消除

    constructor() {
        super('TetrisScene');
        this.tetrisService = Container.get(TetrisService);
        this.board = Array.from({ length: 20 }, () => Array(10).fill(0));
    }

    preload() {
        this.load.image('particle', 'path/to/particle.png');
    }

    create() {
        this.addInitialBlocks();
        this.newPiece();

        this.graphics = this.add.graphics();
        this.drawBoard();

        this.input.keyboard?.on('keydown', this.handleKeyDown, this);
        this.fallEvent = this.time.addEvent({
            delay: FALL_INTERVAL,
            callback: this.fallPiece,
            callbackScope: this,
            loop: true
        });

        this.particleEmitter = this.add.particles(0, 0, 'particle');
        // 确保初始化时粒子发射器不发射粒子
        if (this.particleEmitter) {
            this.particleEmitter.stop();
        }
    }

    private addInitialBlocks() {
        for (let i = 0; i < INITIAL_BLOCK_COUNT; i++) {
            const randomShapeIndex = Phaser.Math.Between(0, SHAPES.length - 1);
            const randomShape = SHAPES[randomShapeIndex];
            const randomColor = COLORS[randomShapeIndex];
            let validPosition = false;
            let randomX!: number;
            let randomY!: number;

            while (!validPosition) {
                randomX = Phaser.Math.Between(0, 10 - randomShape[0].length);
                // 确保随机方块的 Y 坐标不小于 12
                randomY = Phaser.Math.Between(12, 20 - randomShape.length);
                validPosition = this.canPlaceBlock(randomShape, randomX, randomY);
            }

            for (let y = 0; y < randomShape.length; y++) {
                for (let x = 0; x < randomShape[y].length; x++) {
                    if (randomShape[y][x]) {
                        this.board[randomY + y][randomX + x] = randomColor;
                    }
                }
            }
        }
    }

    private canPlaceBlock(shape: typeof SHAPES[number], x: number, y: number): boolean {
        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx]) {
                    const newX = x + sx;
                    const newY = y + sy;
                    if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private newPiece() {
        const randomIndex = Phaser.Math.Between(0, SHAPES.length - 1);
        this.currentPiece = SHAPES[randomIndex];
        this.pieceColor = COLORS[randomIndex];
        this.currentX = Math.floor((10 - this.currentPiece[0].length) / 2);
        this.currentY = 0;

        const nextRandomIndex = Phaser.Math.Between(0, SHAPES.length - 1);
        this.tetrisService.updateNextPiece(SHAPES[nextRandomIndex], COLORS[nextRandomIndex]);

        if (!this.canMove(0, 0)) {
            this.gameOver();
        }
    }

    private drawBoard() {
        this.graphics?.clear();

        if (this.graphics) {
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x]) {
                        this.drawBlock(x, y, this.board[y][x]);
                    }
                }
            }

            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x]) {
                        this.drawBlock(this.currentX + x, this.currentY + y, this.pieceColor);
                    }
                }
            }
        }
    }

    private drawBlock(x: number, y: number, color: typeof COLORS[number]) {
        this.graphics?.fillStyle(color);
        this.graphics?.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        this.graphics?.lineStyle(2, 0x000000);
        this.graphics?.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
    }

    private canMove(dx: number, dy: number): boolean {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const newX = this.currentX + x + dx;
                    const newY = this.currentY + y + dy;
                    if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private rotatePiece() {
        const rotatedPiece = this.currentPiece[0].map((_, index) =>
            this.currentPiece.map(row => row[index]).reverse()
        );
        if (this.canRotate(rotatedPiece as typeof SHAPES[number])) {
            this.currentPiece = rotatedPiece as unknown as typeof SHAPES[number];
        }
    }

    private canRotate(piece: typeof SHAPES[number]): boolean {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x]) {
                    const newX = this.currentX + x;
                    const newY = this.currentY + y;
                    if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private lockPiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    this.board[this.currentY + y][this.currentX + x] = this.pieceColor;
                }
            }
        }
    }

    private clearLines() {
        let linesCleared = 0;
        const clearedLines: number[] = [];

        for (let y = 0; y < this.board.length; y++) {
            if (this.board[y].every(cell => cell)) {
                clearedLines.push(y);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            if (!this.firstLineCleared) {
                this.firstLineCleared = true;
            }
            this.explodeLines(clearedLines);

            for (const line of clearedLines) {
                this.board.splice(line, 1);
                this.board.unshift(Array(10).fill(0));
            }

            const newScore = this.tetrisService.getScore() + linesCleared * 100;
            this.tetrisService.updateScore(newScore);
        }
    }

    private explodeLines(lines: number[]) {
        if (this.particleEmitter && this.firstLineCleared) {
            for (const line of lines) {
                for (let x = 0; x < 10; x++) {
                    const emitterConfig = {
                        x: x * this.blockSize + this.blockSize / 2,
                        y: line * this.blockSize + this.blockSize / 2,
                        speed: { min: -200, max: 200 },
                        angle: { min: 0, max: 360 },
                        scale: { start: 1, end: 0 },
                        lifespan: 500,
                        blendMode: 'ADD',
                        quantity: 10
                    };
                    this.particleEmitter.setConfig(emitterConfig).explode(10);
                }
            }
        }
    }

    private handleKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
                if (this.canMove(-1, 0)) {
                    this.currentX--;
                }
                break;
            case 'ArrowRight':
                if (this.canMove(1, 0)) {
                    this.currentX++;
                }
                break;
            case 'ArrowDown':
                if (this.canMove(0, 1)) {
                    this.currentY++;
                }
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
        }
        this.drawBoard();
    }

    private fallPiece() {
        if (this.canMove(0, 1)) {
            this.currentY++;
        } else {
            this.lockPiece();
            this.clearLines();
            this.newPiece();
        }
        this.drawBoard();
    }

    private gameOver() {
        this.cameras.main.shake(500, 0.05);
        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1500, () => {
            alert('Game Over');
            this.board = Array.from({ length: 20 }, () => Array(10).fill(0));
            this.tetrisService.updateScore(0);
            this.newPiece();
        });
    }
}