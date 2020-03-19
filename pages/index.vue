<template>
  <el-container class="index-page">
    <el-header>
      <h4 class="text-center mt-6">clash 配置合并</h4>
    </el-header>
    <el-main>
      <el-card class="w-5/12 m-auto">
        <el-form ref="form" :model="userData" label-width="120px">
          <el-form-item label="本站订阅地址">
            <el-input v-model="userData.myProfileLink" placeholder="请输入本站生成的订阅链接，若无将自动生成">
              <el-button slot="append" @click="getMyProfile">确定</el-button>
            </el-input>
          </el-form-item>

          <el-form-item
            class="relative"
            v-for="(profile, index) in userData.profiles"
            :key="index"
            :prop="`profiles.${index}.content`"
            :rules="{required: true, message: '不能为空', trigger: 'blur'}"
          >
            <div v-if="profile.type === 'file'">
              <client-only>
                <div class="mr-12 leading-4">
                  <codemirror v-model="profile.content" :options="codemirrorOptions" />
                </div>
              </client-only>
            </div>
            <div class="mr-12" v-else>
              <el-input v-model="profile.content" />
            </div>
            <el-button
              class="absolute right-0 top-0"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              circle
              @click="deleteProfile(index)"
            ></el-button>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="addProfile('link')">添加一个订阅</el-button>
            <el-button type="success" @click="addProfile('file')">添加配置文件</el-button>
            <el-button type="primary" @click="submit">提交</el-button>
            <el-button type="danger" @click="deleteProfile">删除</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import localforage from 'localforage'

export default {
  head: {
    title: 'clash配置合并'
  },
  data() {
    return {
      codemirrorOptions: {
        mode: 'text/x-yaml',
        theme: 'vscode-dark'
      },
      userData: {
        myProfileLink: '',
        profiles: []
      }
    }
  },
  methods: {
    saveToLocal() {
      this.$message.success('已保存本地')
      localforage.setItem('userData', this.userData)
    },
    async getLocalData() {
      const userData = await localforage.getItem('userData')
      Object.assign(this.userData, userData)
    },
    async getMyProfile() {
      try {
        const data = await this.$axios.get('/getMyProfile', {
          params: { link: encodeURI(this.userData.myProfileLink) }
        })
        this.userData.profiles = data
        this.saveToLocal()
      } catch (error) {
        this.$message.error(error.message)
      }
    },
    addProfile(type) {
      this.userData.profiles.push({ type, content: '' })
    },
    deleteProfile(index) {
      this.userData.profiles.splice(index, 1)
    },
    async deleteProfile() {
      try {
        await this.$confirm('一旦删除将无法找回', '警告')
        const { message } = await this.$axios.delete('/deleteProfile', {
          params: { link: encodeURI(this.userData.myProfileLink) }
        })
        this.$message.success(message)
        localforage.removeItem('userData')
        this.userData = { myProfileLink: '', profiles: [] }
        this.$message.success('已清楚本地缓存')
      } catch (e) {
        typeof e === 'object' && this.$message.error(e.message)
      }
    },
    submit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            this.$message.info('请耐心等待')
            const { message, key } = await this.$axios.post(
              '/updateMyProfile',
              this.userData
            )
            this.userData.myProfileLink =
              location.origin + '/api/profile?key=' + key
            this.saveToLocal()
          } catch (e) {
            this.$message.error(e.message)
          }
        }
      })
    }
  },
  beforeMount() {
    this.getLocalData()
  }
}
</script>
