<template>
  <div id="q-app">
    <router-view />
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
  created () {
    this.$q.iconMapFn = (iconName) => {
      const icon = myIcons[iconName]
      if (icon !== void 0) {
        return { icon: icon }
      }
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
