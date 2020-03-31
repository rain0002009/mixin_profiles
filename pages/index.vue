<template>
  <el-container class="index-page">
    <el-header>
      <h2 class="text-center mt-6 text-base md:text-lg">clash 配置合并</h2>
    </el-header>
    <el-main>
      <el-card class="w-full md:w-5/12 m-auto">
        <el-form ref="form" :model="userData" :label-width="labelWidth">
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
            :rules="{ required: true, message: '不能为空', trigger: 'blur' }"
          >
            <div v-if="profile.type === 'file'">
              <client-only>
                <div class="mr-6 md:mr-12 leading-4">
                  <codemirror v-model="profile.content" :options="codemirrorOptions" />
                </div>
              </client-only>
            </div>
            <div class="mr-6 md:mr-12" v-else>
              <el-input v-model="profile.content" />
            </div>
            <el-button
              class="absolute right-0 top-0"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              circle
              @click="deleteItem(index)"
            ></el-button>
          </el-form-item>

          <el-form-item>
            <div class="flex flex-col md:flex-row button-group">
              <el-button type="primary" @click="addProfile('link')">添加一个订阅</el-button>
              <el-button type="success" @click="addProfile('file')">添加配置文件</el-button>
              <el-button type="primary" @click="submit">提交</el-button>
              <el-button type="danger" @click="deleteProfile">删除</el-button>
            </div>
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
  computed: {
    labelWidth() {
      if (process.client) {
        return window.innerWidth > 1400 ? '120px' : null
      }
      return null
    },
    key() {
      if (!this.userData.myProfileLink) return null
      return new URL(this.userData.myProfileLink).searchParams.get('key')
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
        const data = await this.$axios.get(`/clash-users/${this.key}`)
        this.userData.profiles = data.profiles
        this.saveToLocal()
      } catch (error) {
        this.$message.error(error.message)
      }
    },
    addProfile(type) {
      this.userData.profiles.push({ type, content: '' })
    },
    deleteItem(index) {
      this.userData.profiles.splice(index, 1)
    },
    async deleteProfile() {
      try {
        await this.$confirm('一旦删除将无法找回', '警告', {
          closeOnClickModal: false
        })
        await this.$axios.delete(`/clash-users/${this.key}`)
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
            const { name } = await this.$axios.post(
              '/clash-users',
              this.userData
            )
            this.userData.myProfileLink =
              location.origin + '/api/clash-users/profile?key=' + name
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

<style lang="scss">
@import '@/assets/css/tool.scss';
.index-page {
  .button-group {
    .el-button {
      margin-bottom: px2rem(10);
      & + .el-button {
        margin-left: 0;
        @include m {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
