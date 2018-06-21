<template>
<div class="container">
  <div class="row">
    <div class="col-md-4 col-md-offset-4">
      <div class="area">
        <div class="center-block profile-margin">
          <img th:src="${idToken.picture}" class="profile-img img-circle" />
          <h3 th:text="${idToken.name}"></h3>
          <button type="button" v-on:click="verify" class="btn btn-success btn-lg btn-block profile-button">verify</button>
          <button type="button" v-on:click="refreshToken" class="btn btn-success btn-lg btn-block profile-button">refreshToken</button>
          <button type="button" v-on:click="revoke" class="btn btn-success btn-lg btn-block profile-button">revoke</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue"
import axios from 'axios'

export default Vue.extend({
  created () {
    console.log('Success!!!')
  },
  methods: {
    verify() {
      axios.get('/api/verify')
        .then((response) => {
          console.log(response)
        })
    },
    refreshToken() {
      axios.get('/api/refreshToken')
        .then((response) => {
          console.log(response)
        })
    },
    revoke() {
      axios.get('/api/revoke')
        .then((response) => {
          console.log(response)
        })
    }
  }
})
</script>
