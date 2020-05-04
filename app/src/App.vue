<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script >
const myIcons = {
  'app:toonin': 'img:statics/toonin.svg',
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

<style >
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
