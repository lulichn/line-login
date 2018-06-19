<template>
  <div class="container">
    <div class="row">
      <div class="col-md-4 col-md-offset-4">
        <div class="area">
          <h4 class="text-center area-margin">LINE Web Login</h4>
          <div id="web-login-button" class="center-block area-margin">
            <!-- <a v-on:click="goToAuthPage" class="center-block"></a> -->
            <a class="center-block" href="/goToAuthPage"></a>
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
  methods: {
    goToAuthPage() {
      axios.get('/api/goToAuthPage')
        .then((response) => {
          console.log(response)
        })
    }
  }
})
</script>

<style>
.area {
  background-color: #f5f8fa;
  border: 1px solid #edeeee;
  border-radius: 6px;
  margin: 10px 0;
  padding: 30px 0;
  word-break: break-all;
}
.area-margin {
  text-align: center;
  margin: 30px 10px;
}


#web-login-button a {
  width: 151px;
  height: 44px;
  background: url("../../static/btn_login_base.png") no-repeat;
  display: block;
}

.profile-img {
  width: 100px;
  height: 100px;
  max-width: 100%;
}
.profile-margin {
  text-align: center;
  margin: 10px;
}

.profile-button {
  margin: 20px 0
}
</style>
