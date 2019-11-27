<template>
    <v-card>
    <v-bottom-nav fixed>
        <v-toolbar flat height=90>
        <v-spacer></v-spacer>
        <div style="padding-left: 50px; padding-top: 1%; width: 20%">
        <v-slider
          v-model="volume"
          prepend-icon="volume_up"
          label="Volume"
          @change="updateVolume($event)"
        ></v-slider>
        </div>
        <div style="overflow: hidden; white-space: nowrap;">
            <v-card-title class="headline" style="animation: title-text 12s linear infinite; display:inline-block">{{streamTitle}}</v-card-title>
        </div>
        <div style="padding: 5px; padding-left: 20px;">
            <v-btn outline fab small color="light-blue" @click="stopTrack">
                <v-icon>stop</v-icon>
            </v-btn>
        </div>
        <div style="padding: 5px">
        <v-btn outline fab color="light-blue" @click="playTrack()">
            <v-icon large>play_arrow</v-icon>
        </v-btn>
        </div>
        <div style="padding: 5px">
        <v-btn outline fab small color="light-blue" @click="pauseTrack">
            <v-icon>pause</v-icon>
        </v-btn>
        </div>
        <v-spacer></v-spacer>
        </v-toolbar>
    </v-bottom-nav>
    </v-card>
    
</template>

<script>
// import { mapFields } from 'vuex-map-fields';
import { mapState} from 'vuex'

export default {
    name: "PlayerControls",
    // data: () => ({
    //     vol: 50
    // }),
    methods: {
        playTrack() {
            this.$emit('playtrack')
        },
        pauseTrack() {
            this.$emit('pausetrack')
        },
        stopTrack() {
            this.$emit('stoptrack')
        },
        updateVolume(value) {
        //   this.$emit('volume-change', this.volume)
          this.$store.dispatch("UPDATE_VOLUME", value);
        }
    },
    computed: {
        ...mapState(['volume', 'streamTitle'])
    }
}
</script>

<style>

</style>