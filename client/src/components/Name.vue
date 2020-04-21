/* eslint-disable no-console */
<template>
  <v-card class="mx-auto" max-width="900px" :elevation="40">
    <v-container fluid>
      <v-img
        max-height="240px"
        contain
        src="../assets/icon.png"
        style="margin-top: 1%; padding-top: 20px"
      />
      <v-card-title class="toonin-title justify-center"
        >What's your nickname?</v-card-title
      >
      <v-card-actions>
        <v-text-field
          v-model="nameInput"
          single-line
          autofocus
          class="centered-input"
          @click:append="enterName"
          @keydown.enter="enterName"
          :error-messages="errorMessages"
        ></v-text-field>
      </v-card-actions>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="enterName" color="primary" rounded outlined>
          Enter
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'Name',
  data: () => ({
    nameInput: '',
    errors: [],
  }),
  computed: {
    errorMessages() {
      if (this.errors.length > 0) {
        return this.errors;
      } else {
        return this.errors;
      }
    },
  },
  methods: {
    enterName() {
      if (this.nameInput.length > 1) {
        this.$store.dispatch(
          'UPDATE_NAME',
          this.nameInput.replace(/(^\w{1})|(\s{1}\w{1})/g, (match) =>
            match.toUpperCase()
          )
        );
      } else {
        this.errors.push('Nickname has to be longer');
      }
    },
  },
};
</script>

<style>
.centered-input input {
  text-align: center;
}
</style>
