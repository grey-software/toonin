<template>
  <div id="q-app">
    <router-view />
    <q-dialog
      v-model="showBrowserCompatDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="bg-teal text-white"
        style="width: 300px"
      >
        <q-card-section>
          <div class="text-h6">Are you using Chrome?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          For the optimal toonin experience on desktop and mobile, we recommend using Google Chrome.
        </q-card-section>

        <q-card-actions
          align="right"
          class="bg-white text-teal"
        >
          <q-btn
            flat
            label="I understand"
            v-close-popup
            @click="showBrowserCompatDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script >
const myIcons = {
  'app:toonin': 'img:statics/toonin.svg',
  'app:toonin-dark': 'img:statics/toonin-dark.svg',
  'app:guide': 'img:statics/guide.svg',
  'app:github': 'img:statics/github.svg',
  'app:github-dark': 'img:statics/github-dark.svg',
  'app:moon': 'img:statics/moon.svg',
  'app:sun': 'img:statics/sun.svg'
}
export default {
  name: 'App',
  data () {
    return {
      showBrowserCompatDialog: false,
    }
  },
  created () {
    this.$q.iconMapFn = (iconName) => {
      const icon = myIcons[iconName]
      if (icon !== void 0) {
        return { icon: icon }
      }
    }
  },
  mounted () {
    if (!this.$q.platform.is.chrome) {
      this.showBrowserCompatDialog = true
    }
  }
}
</script>

<style>
body.body--dark {
  background: #2f3136;
}
.text-toonin {
  color: #4296bd;
}

.bg-toonin {
  background: #4296bd;
}
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s ease-out;
  transition-property: opacity;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
