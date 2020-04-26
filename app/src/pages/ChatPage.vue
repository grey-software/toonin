<template>
  <div>
    <div>
      <div style="padding-top: 30px">
        <Chat />
      </div>
    </div>
  </div>
</template>

<script>
import Chat from '../components/Chat.vue'
export default {
  name: 'chat-page',
  components: {
    Chat
  },
  data () {
    return {}
  }
}
</script>
