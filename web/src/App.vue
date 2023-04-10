<script setup>
import { ref } from 'vue';
import SidePanel from './components/SidePanel.vue';
import MainPanel from './components/MainPanel.vue';
import data from './data/videos.json';

const videos = ref(data);
</script>

<template>
  <div class="flex bg-gray-900 h-screen">
    <SidePanel />
    <MainPanel :videos="videos" />
  </div>
</template>
