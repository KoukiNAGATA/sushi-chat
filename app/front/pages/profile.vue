<template>
  <div>
    <h1>管理者プロフィールページ（テスト用）</h1>
    <p>ログイン済みでなければこのページにはアクセスできません</p>
    <ul v-if="authUser != null">
      <li>displayName: {{ authUser.displayName }}</li>
      <li>email: {{ authUser.email }}</li>
      <li>
        <img :src="authUser.photoURL" alt="" />
      </li>
      <li>uid: {{ authUser.uid }}</li>
      <li>emailVerified: {{ authUser.emailVerified }}</li>
    </ul>
    <button @click="callSampleApi">
      サーバサイドの認証必須API呼び出しテスト
    </button>
    <button @click="logout">ログアウト</button>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { AuthStore } from "~/store"
export default Vue.extend({
  middleware: "privateRoute",
  computed: {
    authUser() {
      return AuthStore.authUser
    },
  },
  methods: {
    async callSampleApi() {
      try {
        const res = await this.$axios.$get("http://localhost:7000/auth-test")
        console.log(res)
      } catch (e) {
        console.log(e)
      }
    },
    async logout() {
      try {
        await this.$fire.auth.signOut()
        this.$router.push("/login")
      } catch {
        alert("ログアウトに失敗しました")
      }
    },
  },
})
</script>
