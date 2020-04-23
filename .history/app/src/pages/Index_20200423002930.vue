<template>
  <v-app>
    <v-content>
      <v-container v-if="!name">
        <Name></Name>
      </v-container>
      <v-container v-else>
        <v-card
          class="mx-auto"
          max-width="900px"
          :elevation="20"
        >
          <v-card-title class="toonin-title justify-center">Welcome {{ name }}</v-card-title>
          <v-tabs
            centered
            slider-color="yellow"
            v-model="tab"
          >
            <v-tab>Connect</v-tab>
            <v-tab>Share Screen</v-tab>
            <v-tab>Chat</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <Home></Home>
            </v-tab-item>
            <v-tab-item>
              <ScreenCap></ScreenCap>
            </v-tab-item>
            <v-tab-item>
              <Chat></Chat>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-container>
    </v-content>
    <v-footer app>
      <v-spacer></v-spacer>
      <span>
        &copy;
        <strong>Toonin</strong>
        - {{ new Date().getFullYear() }}
      </span>
    </v-footer>
  </v-app>
</template>

<script>
import ScreenCap from '../components/ScreenCap.vue';
import Chat from '../components/Chat.vue';
import Name from '../components/Name.vue';
import Home from '../views/Home.vue';
import { mapState } from 'vuex';
export default {
  name: 'Create',
  data () {
    return {
      tab: null,
    };
  },
  components: {
    ScreenCap,
    Chat,
    Name,
    Home,
  },
  computed: {
    ...mapState(['name']),
  },
};
</script>

<style></style>
