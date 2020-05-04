<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script >
export default {
  name: 'App'
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
