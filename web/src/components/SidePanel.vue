<script setup>
import PlayIcon from './icons/PlayIcon.vue';
import SettingsIcon from './icons/SettingsIcon.vue';
import LogoutIcon from './icons/LogoutIcon.vue';
import HomeIcon from './icons/HomeIcon.vue';
import CardIcon from './icons/CardIcon.vue';
import MessageIcon from './icons/MessageIcon.vue';
import HeartIcon from './icons/HeartIcon.vue';
</script>

<template>
  <div class="w-20 border-r border-gray-800 flex flex-col text-gray-300 panel">
    <div class="h-20 flex justify-center items-center">
      <PlayIcon class="w-14 h-14 text-green-400" />
    </div>
    <div class="flex-1 flex flex-col items-center">
      <HomeIcon class="w-6 h-6 mt-8 text-green-300" />
      <CardIcon class="w-6 h-6 mt-12" />
      <MessageIcon class="w-6 h-6 mt-12" />
      <HeartIcon class="w-6 h-6 mt-12" />
    </div>
    <div
      class="flex flex-col justify-center items-center border-t border-gray-800"
    >
      <SettingsIcon class="w-6 h-6 mt-12" />
      <LogoutIcon class="w-6 h-6 mt-12 mb-12" />
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: none;
}

@media only screen and (min-width: 570px) {
  .panel {
    display: inherit;
  }
}
</style>
