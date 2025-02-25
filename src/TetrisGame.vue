<template>
  <div id="tetris-game-container">
      <div id="tetris-game"></div>
      <TetrisSideView />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import Phaser from 'phaser';
import TetrisScene from './TetrisScene';
import TetrisSideView from './TetrisSideView.vue';

onMounted(() => {
  const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 300,
      height: 600,
      parent: 'tetris-game',
      scene: [TetrisScene]
  };

  new Phaser.Game(config);
});
</script>

<style scoped>
#tetris-game-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

#tetris-game {
  margin: 0;
}
</style>