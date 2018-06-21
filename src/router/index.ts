import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home.vue'
import Success from '@/components/Success.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/success',
      name: 'Success',
      component: Success
    }
  ]
})
