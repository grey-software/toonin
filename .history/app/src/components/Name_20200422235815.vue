/* eslint-disable no-console */
<template>
  <q-card
    class="mx-auto"
    max-width="900px"
    :elevation="40"
  >
    <q-page-container fluid>
      <q-img
        max-height="240px"
        contain
        src="../assets/icon.png"
        style="margin-top: 1%; padding-top: 20px"
      />
      <q-card-title class="toonin-title justify-center">What's your nickname?</q-card-title>
      <q-card-actions>
        <q-input
          q-model="nameInput"
          single-line
          autofocus
          class="centered-input"
          @click:append="enterName"
          @keydown.enter="enterName"
          :error-messages="errorMessages"
        ></q-input>
      </q-card-actions>
      <q-card-actions>
        <q-spacer></q-spacer>
        <q-btn
          @click="enterName"
          color="primary"
          rounded
          outlined
        >
          Enter
        </q-btn>
        <q-spacer></q-spacer>
      </q-card-actions>
    </q-page-container>
  </q-card>
</template>

<script>
export default {
  name: 'Name',
  data: () => ({
    nameInput: '',
    errors: []
  }),
  computed: {
    errorMessages () {
      if (this.errors.length > 0) {
        return this.errors
      } else {
        return []
      }
    }
  },
  methods: {
    enterName () {
      if (this.nameInput.length > 1) {
        this.$store.dispatch(
          'UPDATE_NAME',
          this.nameInput.replace(/(^\w{1})|(\s{1}\w{1})/g, match =>
            match.toUpperCase()
          )
        )
      } else {
        this.errors.push('Nickname has to be longer')
      }
    }
  }
}
</script>

<style>
.centered-input input {
  text-align: center;
}
</style>
