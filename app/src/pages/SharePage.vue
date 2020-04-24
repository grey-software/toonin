/* eslint-disable no-console */
<template>
<div>
    <div>
      <q-layout
        row
        wrap
        align="center"
      >
        <div style="padding-top: 50px">
          <ScreenCap/>
        </div>
      </q-layout>
    </div>
  </div>
</template>

<script>
import ScreenCap from '../components/ScreenCap.vue'
export default {
  name: 'screen-cap',
  components: {
    ScreenCap
  },
  data () {
    return {}
  }
}
</script>
