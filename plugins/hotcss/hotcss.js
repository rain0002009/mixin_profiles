import throttle from 'lodash/throttle'
export default {
  install(Vue, options) {
    const hotcss = {
      maxWidth: 540,
      mresize() {}
    }
    let viewportEl = null
    let hotcssEl = null
    let dpr = (process.client && options.needDpr) ? window.devicePixelRatio : 1
    dpr = dpr >= 3 ? 3 : (dpr >= 2 ? 2 : 1)
    let maxWidth = 540
    let designWidth = options.designWidth
    if (process.client) {
      viewportEl = document.querySelector('meta[name="viewport"]')
      hotcssEl = document.querySelector('meta[name="hotcss"]')
      if (hotcssEl) {
        const hotcssCon = hotcssEl.getAttribute('content');
        if (hotcssCon) {
          const initialDprMatch = hotcssCon.match(/initial\-dpr=([\d\.]+)/);
          if (initialDprMatch && options.needDpr) {
            dpr = parseFloat(initialDprMatch[1]);
          }
          const maxWidthMatch = hotcssCon.match(/max\-width=([\d\.]+)/);
          if (maxWidthMatch) {
            maxWidth = parseFloat(maxWidthMatch[1]);
          }
          const designWidthMatch = hotcssCon.match(/design\-width=([\d\.]+)/);
          if (designWidthMatch) {
            designWidth = parseFloat(designWidthMatch[1]);
          }
        }
      }
      document.documentElement.setAttribute('data-dpr', dpr)
      hotcss.dpr = dpr

      document.documentElement.setAttribute('max-width', maxWidth)
      hotcss.maxWidth = maxWidth

      if (designWidth) {
        document.documentElement.setAttribute('design-width', designWidth)
      }
      hotcss.designWidth = designWidth

      let scale = 1 / dpr
      let content = 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no'

      if (viewportEl) {
        viewportEl.setAttribute('content', content)
      } else {
        viewportEl = document.createElement('meta')
        viewportEl.setAttribute('name', 'viewport')
        viewportEl.setAttribute('content', content)
        document.head.appendChild(viewportEl)
      }

      hotcss.px2rem = function (px, designWidth) {
        //预判你将会在JS中用到尺寸，特提供一个方法助你在JS中将px转为rem。就是这么贴心。
        if (!designWidth) {
          //如果你在JS中大量用到此方法，建议直接定义 hotcss.designWidth 来定义设计图尺寸;
          //否则可以在第二个参数告诉我你的设计图是多大。
          designWidth = parseInt(hotcss.designWidth, 10)
        }

        return parseInt(px, 10) * 320 / designWidth / 20
      }

      hotcss.rem2px = function (rem, designWidth) {
        //新增一个rem2px的方法。用法和px2rem一致。
        if (!designWidth) {
          designWidth = parseInt(hotcss.designWidth, 10)
        }
        //rem可能为小数，这里不再做处理了
        return rem * 20 * designWidth / 320
      }
    }

    function getInnerWidth() {
      let innerWidth = 0
      if (process.server) {
        innerWidth = options.device.type === 'smartphone' ? 1126 : 1440
      }
      if (process.client) {
        innerWidth = document.documentElement.getBoundingClientRect().width || window.innerWidth
      }
      return innerWidth
    }

    hotcss.mresize = function () {
      //对，这个就是核心方法了，给HTML设置font-size。
      if (options.device.type === 'desktop') return false
      let innerWidth = getInnerWidth()
      if (hotcss.maxWidth && (innerWidth / hotcss.dpr > hotcss.maxWidth)) {
        innerWidth = hotcss.maxWidth * hotcss.dpr
      }
      if (!innerWidth) {
        return false;
      }
      if (process.client) document.documentElement.style.fontSize = (innerWidth * 20 / 320) + 'px'
      hotcss.callback && hotcss.callback()
    }
    process.client && hotcss.mresize()
    const handleResize = throttle(hotcss.mresize, 300)
    Vue.mixin({
      created() {
        hotcss.mresize()
      },
      mounted() {
        window.addEventListener('resize', handleResize, false)
        //绑定resize的时候调用
      },
      beforeDestroy() {
        window.removeEventListener('resize', handleResize)
      }
    })
  }
}
