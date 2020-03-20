import Vue from 'vue'
import hotcss from './hotcss'
import DeviceDetector from "device-detector-js"
const deviceDetector = new DeviceDetector()
export default function ({
  req
}, inject) {
  let device = {
    device: {
      type: null
    }
  }
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent
  device = deviceDetector.parse(userAgent)
  device.designWidth = 750
  device.needDpr = false
  inject('deviceInfo', device)
  Vue.use(hotcss, device)
}
