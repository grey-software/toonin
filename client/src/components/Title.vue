<template>
    <v-card v-show="streamTitle.length>0" class="mx-auto" max-width="850px">
        <v-toolbar flat height=90>
            <div style="overflow: hidden; white-space: nowrap;">
                <v-card-title :class="streamTitle.length<40 ? 'v-toolbar-title title-text-no-animation' : 'v-toolbar-title title-text' " >{{streamTitle}}</v-card-title>
            </div>
        </v-toolbar>
    </v-card>
</template>

<script>
import { mapState} from 'vuex'

export default {
    name: "Title",
    computed: {
        ...mapState(['streamTitle'])
    }
}
</script>

<style>
  .title-text {
    animation: title-text 12s linear infinite;
  }

  .title-text-no-animation {
    display: inline-block;
  }

  @keyframes title-text {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-100%, 0);
    }
  }

</style>