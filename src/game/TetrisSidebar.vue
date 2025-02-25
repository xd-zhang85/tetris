<template>
  <div id="tetris-sidebar">
    <div id="operation-panel">
      <button @click="handleLeft">←</button>
      <button @click="handleRight">→</button>
      <button @click="handleDown">↓</button>
      <button @click="handleRotate">↑</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { Container } from 'typedi'
  import { TetrisService } from './TetrisService'

  const tetrisService = Container.get(TetrisService)

  const handleLeft = () => {
    tetrisService.moveLeft()
  }

  const handleRight = () => {
    tetrisService.moveRight()
  }

  const handleDown = () => {
    tetrisService.moveDown()
  }

  const handleRotate = () => {
    tetrisService.rotatePiece()
  }

  onMounted(() => {})
</script>

<style scoped>
  #tetris-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #operation-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100px;
  }

  #operation-panel button {
    margin: 0 10px;
  }
</style>
