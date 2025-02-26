// 方块的形状
export const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
]

// 方块的颜色
export const COLORS = [
  0x00ffff, 0xffff00, 0xffa500, 0x00ff00, 0xff00ff, 0xff0000, 0x0000ff,
]

// 方块下落的时间间隔（毫秒）
export const FALL_INTERVAL = 500

// 游戏开始时额外生成的方块数量
export const INITIAL_BLOCK_COUNT = 5
