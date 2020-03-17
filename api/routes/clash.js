const _ = require('lodash')
const yaml = require('js-yaml')
const crypto = require('crypto')
const axios = require('axios')
const axiosInstance = axios.create({
  timeout: 5000
})
axiosInstance.interceptors.response.use(function (response) {
  return response.data
}, function (error) {
  return Promise.reject(error)
});
const {
  Router
} = require('express')
const db = require('../db')
const router = Router()


function getParams(target = '', key) {
  try {
    const url = new URL(target)
    return url.searchParams.get(key)
  } catch (e) {
    return null
  }
}

function hasCurrentUser(key, path = '') {
  return db.get(`userProfiles[${key}]${path}`)
}


//api:返回根据urlprofile文件
router.get('/profile', async ({
  query
}, res) => {
  const currentUser = hasCurrentUser(query.key, 'source')
  let fileContent = hasCurrentUser(query.key, 'fileContent')
  try {
    fileContent = await createProfile(currentUser.value())
  } catch (e) {}
  res.send(fileContent.value())
})

//api:获取用户配置列表
router.get('/getMyProfile', ({
  query
}, res) => {
  const key = getParams(query.link, 'key')
  const data = hasCurrentUser(key, 'source').value()
  return data ? res.json(data) : res.status(500).send('没有该订阅地址')
})

function mixinProxyGroup(targetGroup, sourceGroup) {
  sourceGroup.forEach(item => {
    const commonIndex = _.findIndex(targetGroup, ['name', item.name])
    if (commonIndex < 0) {
      targetGroup.push(item)
    } else {
      const targetProxies = targetGroup[commonIndex].proxies
      targetProxies.push(...item.proxies)
    }
  })
}

// 根据源数据生成profile文件
async function createProfile(list) {
  let file = ''
  let newProfile = {
    Proxy: [],
    'Proxy Group': [],
    Rule: []
  }
  try {
    const profileList = await Promise.all(list.map(item => {
      if (item.type === 'link') {
        return axiosInstance.get(item.content).then(res => yaml.safeLoad(res))
      }
      if (item.type === 'file') {
        return Promise.resolve(yaml.safeLoad(item.content))
      }
      return Promise.resolve('')
    }))
    const newProfileProxyGroup = newProfile['Proxy Group']
    Object.assign(newProfile, ...profileList.map(item => _.omit(item, ['Proxy', 'Proxy Group', 'Rile'])))
    profileList.forEach((profile, index) => {
      newProfile.Proxy = newProfile.Proxy.concat(profile.Proxy)
      const profileProxyGroup = profile['Proxy Group']
      mixinProxyGroup(newProfileProxyGroup, profileProxyGroup)
      newProfile.Rule = newProfile.Rule.concat(profile.Rule)
    })
    file = yaml.safeDump(newProfile, {
      noRefs: true
    })
    return file
  } catch (e) {
    console.error(e)
  }
}

// 获取用户key
function createNewUserKey(data) {
  data += ''
  let encrypted = ''
  const algorithm = 'aes-192-cbc'
  const password = '帅的一批'
  const key = crypto.scryptSync(password, data + Math.random() + '', 24)
  const iv = Buffer.alloc(16, 0)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  cipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = cipher.read())) {
      encrypted += chunk.toString('hex');
    }
  })
  cipher.write(data)
  cipher.end()
  return new Promise((resolve) => {
    cipher.on('end', () => {
      resolve(encrypted)
    })
  })
}

// api:用户更新配置
router.post('/updateMyProfile', async ({
  body
}, res) => {
  try {
    const {
      myProfileLink,
      profiles
    } = body
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(500).send('配置列表为空')
    }
    let key = ''
    let fileContent = ''
    key = getParams(myProfileLink, 'key')
    const user = hasCurrentUser(key)
    if (!user.value()) {
      if (key) {
        return res.status(500).send('该订阅地址不存在，请删除它并重新提交')
      }
      ([key, fileContent] = await Promise.all([createNewUserKey(+new Date()), createProfile(profiles)]))
    } else {
      fileContent = await createProfile(profiles)
    }

    db.set(`userProfiles[${key}]`, {
      source: profiles,
      fileContent
    }).write()
    return res.json({
      key,
      message: '更新成功'
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
