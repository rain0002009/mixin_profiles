<template>
  <el-container class="tian-gou-page">
    <div class="canvas-body"></div>
  </el-container>
</template>
<script>
import p5 from 'p5'
let img
const detail = 6
let particles = []
let grid = []
let ctx = null
let particleImage = null

class Particle {
  constructor(x, y) {
    this.x = x || random(width)
    this.y = y || random(height)
    this.prevX = this.x
    this.speed = 0
    this.v = random(0, 0.7)
  }

  update(speed) {
    if (grid.length) {
      this.speed = grid[floor(this.y / detail)][floor(this.x / detail)] * 0.97
    }
    this.x += (1 - this.speed) * 3 + this.v

    if (this.x > width) {
      this.x = 0
    }
  }

  draw() {
    image(particleImage, this.x, this.y)
  }
}

export default {
  methods: {
    getDropFile(file) {
      console.log(file)
      const imageUrl = URL.createObjectURL(file.file)
      loadImage(imageUrl, res => {
        img = res
        this.startStep()
        URL.revokeObjectURL(imageUrl)
      })
    },
    startStep() {
      if (!img) return false
      clear()
      ctx.globalAlpha = 1
      image(img, 0, 0, width, height)
      loadPixels()
      clear()
      noStroke()
      grid = []
      for (let y = 0; y < height; y += detail) {
        let row = []
        for (let x = 0; x < width; x += detail) {
          const r = pixels[(y * width + x) * 4]
          const g = pixels[(y * width + x) * 4 + 1]
          const b = pixels[(y * width + x) * 4 + 2]
          const _color = color(r, g, b)
          const _brightness = brightness(_color) / 100
          row.push(_brightness)
        }
        grid.push(row)
      }

      particles = []
      for (let i = 0; i < 3000; i++) {
        particles.push(new Particle(null, (i / 3000) * height))
      }
    },
    windowResized() {
      if (!img) return false
      const imgRatio = img.width / img.height
      if (windowWidth / windowHeight > imgRatio) {
        resizeCanvas(floor(windowHeight * imgRatio), floor(windowHeight))
      } else {
        resizeCanvas(floor(windowWidth), floor(windowWidth / imgRatio))
      }
      noiseSeed(random(100))
      this.startStep()
    },
    draw() {
      ctx.globalAlpha = 0.05
      fill(0)
      rect(0, 0, width, height)
      ctx.globalAlpha = 0.2
      particles.forEach(p => {
        p.update()
        ctx.globalAlpha = p.speed * 0.3
        p.draw()
      })
    },
    setup(sk) {
      const canvas = sk.createCanvas(window.innerWidth, window.innerHeight)
      canvas.drop(this.getDropFile)
      for (let name in sk) {
        if (!/^_/.test(name)) {
          if (typeof sk[name] === 'function') {
            window[name] = sk[name].bind(sk)
          } else {
            Object.defineProperty(window, name, {
              get() {
                return sk[name]
              }
            })
          }
        }
      }
      canvas.parent(this.$el.querySelector('.canvas-body'))
      ctx = canvas.drawingContext
      pixelDensity(1)
      particleImage = createGraphics(4, 4)
      particleImage.fill(255)
      particleImage.noStroke()
      particleImage.circle(4, 4, 4)
      this.startStep()
      this.windowResized()
    },
    init() {
      new p5(sk => {
        window.pixels = sk.pixels
        sk.setup = this.setup.bind(this, sk)
        sk.draw = this.draw
      })
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<style lang="scss">
.tian-gou-page {
  background: black;
  margin: -20px;
  .canvas-body {
    margin: auto;
    height: 99vh;
  }
}
</style>