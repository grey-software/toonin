<template>
  <q-card class="main-card">
    <q-card-section class="toonin-title">What's your nickname?</q-card-section>
    <q-img
      contain
      src="../assets/icon.png"
      style="margin-top: 1%; padding-top: 20px;max-height:240px"
    />
    <q-card-section class="text--primary">
      <q-input
        class="q-ml-md"
        v-model="nameInput"
        borderless
        autofocus
        standout
        input-class="text-center"
        @keydown.enter="enterName"
        :error="errorMessages.length > 0"
      >
        <template v-slot:error>
          {{ errorMessages[0] }}
        </template>
      </q-input>
    </q-card-section>
    <q-card-actions align="center">
      <q-btn
        @click="enterName"
        rounded
        outline
        :size="'xl'"
        color="primary"
        label="Enter"
      >
      </q-btn>
    </q-card-actions>
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

<style lang="stylus" scoped>
.q-input {
  height: 2.5em;
  font-size: 32px;
}
</style>
