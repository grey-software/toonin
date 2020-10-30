
/* eslint-disable no-console */
<template>

  <div class="donate-container q-mt-lg">
    <div class="row justify-center q-col-gutter-y-md">
      <div class="col-8">
        <q-btn
          label="Open Collective"
          class="full-width col-8 btn-donate"
          :class="$q.dark.isActive ? 'text-white' : ''"
          outline
          rounded
          :icon="$q.dark.isActive ? 'app:open-collective-dark' : 'app:open-collective'"
          type="a"
          href="https://opencollective.com/grey-software"
          target="_blank"

        />
      </div>
      <div class="col-8">
        <q-btn
          label="Github Sponsors"
          class="full-width col-8 btn-donate"
          :class="$q.dark.isActive ? 'text-white' : ''"
          outline
          rounded
          :icon="$q.dark.isActive ? 'app:github-dark' : 'app:github'"
          type="a"
          href="https://github.com/sponsors/grey-software"
          target="_blank"
        />
      </div>
      <div class="col-8">
        <q-btn
          label="PayPal"
          class="full-width col-8 btn-donate"
          :class="$q.dark.isActive ? 'text-white' : ''"
          outline
          rounded
          icon="mdi-paypal"
          type="a"
          href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=VEAGAZP7DHJNE&source=url"
          target="_blank"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
  }),
}
</script>

<style scoped>
.donate-container {
  width: 599px;
  height: auto;
}

.btn-donate {
  height: 56px !important;
  font-size: 16px;
  text-transform: capitalize;
  margin-right: 10px;
  color: var(--q-color-primary);
}
</style>
