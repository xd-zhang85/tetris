<template>
  <div id="tetris-side-view">
      <p>Score: {{ score }}</p>
      <div ref="previewContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import Phaser from 'phaser';
import { useTetrisStore } from './tetrisStore';

const store = useTetrisStore();
const previewContainer = ref<HTMLDivElement | null>(null);
let previewGraphics: Phaser.GameObjects.Graphics | null = null;
const blockSize = 30;

const drawNextPiece = () => {
  if (previewGraphics && store.nextPiece.length > 0) {
      previewGraphics.clear();
      const previewX = 1;
      const previewY = 1;
      for (let y = 0; y < store.nextPiece.length; y++) {
          for (let x = 0; x < store.nextPiece[y].length; x++) {
              if (store.nextPiece[y][x]) {
                  previewGraphics.fillStyle(store.nextPieceColor);
                  previewGraphics.fillRect((previewX + x) * blockSize, (previewY + y) * blockSize, blockSize, blockSize);
                  previewGraphics.lineStyle(2, 0x000000);
                  previewGraphics.strokeRect((previewX + x) * blockSize, (previewY + y) * blockSize, blockSize, blockSize);
              }
          }
      }
  }
};

onMounted(() => {
  if (previewContainer.value) {
      const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 200,
          height: 200,
          parent: previewContainer.value,
          scene: {
              create() {
                  previewGraphics = this.add.graphics();
                  drawNextPiece();
              }
          }
      };
      new Phaser.Game(config);
  }
});

watch([() => store.nextPiece, () => store.nextPieceColor], () => {
  drawNextPiece();
});

const score = store.score;
</script>

<style scoped>
#tetris-side-view {
  margin-left: 20px;
  color: white;
  display: block;
  width: auto;
  height: auto;
}
</style>