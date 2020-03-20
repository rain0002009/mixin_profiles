const path = require('path')
const _ = require('lodash')
const yaml = require('js-yaml')
const crypto = require('crypto')
const axios = require('axios')
const axiosInstance = axios.create({
  timeout: 100000
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
  if (!target) {
    return null
  }
  const url = new URL(target)
  return url.searchParams.get(key)
}

function hasCurrentUser(key, path = '') {
  return db.get(`userProfiles[${key}]${path}`)
}


//api:返回根据urlprofile文件
router.get('/profile', async ({
  query
}, res) => {
  const currentUser = hasCurrentUser(query.key, 'source')
  let fileContent = hasCurrentUser(query.key, 'fileContent').value()
  try {
    fileContent = await createProfile(currentUser.value())
  } catch (e) {
    res.sendStatus(500)
  }
  res.send(fileContent)
})

router.get('/getDB', (req, res) => {
  res.sendFile(path.resolve(__dirname, '.', '../../storage/db.json'))
})

//api:获取用户配置列表
router.get('/getMyProfile', ({
  query
}, res) => {
  try {
    const key = getParams(query.link, 'key')
    const data = hasCurrentUser(key, 'source').value()
    return data ? res.json(data) : res.status(500).send('没有该订阅地址')
  } catch (e) {
    res.status(500).send(e.message)
  }
})

//api: 用户删除配置
router.delete('/deleteProfile', ({
  query
}, res) => {
  const key = getParams(query.link, 'key')
  const data = hasCurrentUser(key).value()
  if (key && data) {
    db.unset(`userProfiles[${key}]`).write()
    return res.json({
      message: '已成功删除'
    })
  }
  res.status(500).send('删除失败')
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

function getRuleKey(rule) {
  return (rule.match(/[\w\-,\./]+(?=,\w+)/g) || [])[0]
}

function changeRuleToMap(source) {
  const rules = new Map()
  source.forEach(item => {
    const key = getRuleKey(item)
    rules.set(key, item)
  })
  return rules
}

// 根据源数据生成profile文件
async function createProfile(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('list 为空')
  }
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
    Object.assign(newProfile, ...profileList.map(item => _.omit(item, ['Proxy', 'Proxy Group', 'Rule'])))
    const rules = changeRuleToMap(newProfile.Rule)
    profileList.forEach((profile, index) => {
      newProfile.Proxy = newProfile.Proxy.concat(profile.Proxy)
      mixinProxyGroup(newProfileProxyGroup, profile['Proxy Group'])
      profile.Rule.forEach(item => rules.set(getRuleKey(item), item))
    })
    // 对规则排序确保MATCH在最后
    newProfile.Rule = [...rules.values()].sort((a, b) => {
      const ruleTypes = ['DOMAIN-SUFFIX', 'DOMAIN', 'DOMAIN-KEYWORD', 'IP-CIDR', 'SRC-IP-CIDR', 'GEOIP', 'DST-PORT', 'SRC-PORT', 'MATCH']
      const getRuleTypeIndex = (key) => ruleTypes.indexOf(key.slice(0, key.indexOf(',')))
      return getRuleTypeIndex(a) - getRuleTypeIndex(b)
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
    const myProfileLink = body.myProfileLink
    const profiles = body.profiles
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
    const newData = db.get(`userProfiles[${key}]`).value()
    if (!newData) {
      return res.status(500).send('写入数据失败')
    }
    return res.json({
      key,
      message: '更新成功'
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
