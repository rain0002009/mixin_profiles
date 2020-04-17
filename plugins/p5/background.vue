<template>
  <div class="absolute left-0 right-0 top-0 bottom-0 z-0"></div>
</template>
<script>
import p5 from 'p5'
let N
let total
let counter = 0
const order = 8
const path = []
export default {
  methods: {
    hilbert(i, sk) {
      const points = [
        new p5.Vector(0, 0),
        new p5.Vector(0, 1),
        new p5.Vector(1, 1),
        new p5.Vector(1, 0)
      ]

      let index = i & 3
      let v = points[index]

      for (let j = 1; j < order; j++) {
        i = i >>> 2
        index = i & 3
        let len = sk.pow(2, j)
        if (index == 0) {
          let temp = v.x
          v.x = v.y
          v.y = temp
        } else if (index == 1) {
          v.y += len
        } else if (index == 2) {
          v.x += len
          v.y += len
        } else if (index == 3) {
          let temp = len - 1 - v.x
          v.x = len - 1 - v.y
          v.y = temp
          v.x += len
        }
      }
      return v
    },
    setup(sk) {
      const canvas = sk.createCanvas(sk.windowWidth, sk.windowHeight)
      canvas.parent(this.$el)
      sk.colorMode(sk.HSB, 360, 255, 255)

      N = sk.int(sk.pow(2, order))
      total = N * N
      let len = sk.max(sk.width, sk.height) / N

      for (let i = 0; i < total; i++) {
        path[i] = this.hilbert(i, sk)
        path[i].mult(len)
        path[i].add(len / 2, len / 2)
      }
    },
    draw(sk) {
      sk.stroke(255)
      sk.strokeWeight(1)
      sk.noFill()
      for (let i = 1; i < counter; i++) {
        if (!path[i]) {
          counter = 0
          sk.noLoop()
          break
        }
        let h = sk.map(i, 0, path.length, 0, 360)
        sk.stroke(h, 255, 255)
        sk.line(path[i].x, path[i].y, path[i - 1].x, path[i - 1].y)
      }

      counter += 1000
    },
    init() {
      new p5(sk => {
        sk.setup = this.setup.bind(this, sk)
        sk.draw = this.draw.bind(this, sk)
      })
    }
  },
  mounted() {
    this.init()
  }
}
</script>
