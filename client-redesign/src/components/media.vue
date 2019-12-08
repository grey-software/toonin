<template>
    <v-card class="mx-auto" max-width="400px">
        <v-toolbar flat height=90>

        <div style="width: 75%; padding-top: 2%">
            <v-slider
            v-model="volume"
            prepend-icon="volume_up"
            @change="volChange"
            @click:prepend="mute"
            ></v-slider>
        </div>
        <div style="padding: 5px">
        <v-btn v-show="playing==false" :disabled="stream? false : true" outlined fab color="light-blue" @click="playTrack()">
            <v-icon large>play_arrow</v-icon>
        </v-btn>
         <v-btn v-show="connectedStatus=='connected' && playing==true" outlined fab color="light-blue" @click="pauseTrack()">
            <v-icon large>pause</v-icon>
        </v-btn>
        </div>
        </v-toolbar>
        <div>
            <audio :srcObject.prop="playing? stream : null" style="display: none;" preload="auto" autoplay ref="audio" />
        </div>
    </v-card>
    
</template>

<script>
import { mapState} from 'vuex'

export default {
    name: "PlayerControls",
    data() {
        return { audio : undefined}
    },
    methods: {
        pauseTrack() {
            this.$store.dispatch("UPDATE_PLAYING", false);
            this.audio.pause();
        },
        playTrack() {
            this.$store.dispatch("UPDATE_PLAYING", true);
            this.audio.play();
        },
        volChange(value) {
            this.audio.volume = value / 100;
        },
        mute() {
            this.audio.volume = 0;
            this.$store.dispatch("UPDATE_VOLUME", 0);
        }
    },
    computed: {
        ...mapState(['streamTitle', 'connectedStatus', 'stream', 'playing']),
        volume: {
            get: function(){return this.$store.getters.VOLUME},
            set: function(value){this.$store.dispatch('UPDATE_VOLUME', value )}
        }
    },
    mounted() {
		this.audio = this.$refs.audio;
	}
}
</script>

<style>


</style>