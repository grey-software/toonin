<template>
  <v-btn @click="buttonClicked" rounded>{{ msg }}</v-btn>
</template>

<script>
export default {
  name: "Button",
  props: {
    msg: {
      type: String
    }
  },
  methods: {
      buttonClicked() {
        this.$emit('button-click')
      }
  }
};
</script>

<style></style>
