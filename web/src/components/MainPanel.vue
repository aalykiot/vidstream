<script setup>
import { defineProps } from 'vue';
import BlocksIcon from './icons/BlocksIcon.vue';
import VideoCard from './VideoCard.vue';

const props = defineProps(['videos']);
</script>

<template>
  <div class="flex-1 overflow-y-scroll">
    <div class="h-20 flex items-center">
      <span class="text-3xl ml-8 font-semibold text-white flex items-center">
        <BlocksIcon class="w-6 h-6" />
        <span class="ml-2">Videos</span>
      </span>
    </div>
    <div class="flex-1 text-white mx-5 videos-grid">
      <VideoCard
        v-for="(video, idx) in props.videos"
        :key="idx"
        :duration="video.duration"
        :title="video.title"
        :thumbnail="video.thumbnail"
        :views="video.views"
      />
    </div>
  </div>
</template>

<style scoped>
/* For mobile phones: */
.videos-grid {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: repeat(1, 1fr);
  row-gap: 20px;
  column-gap: 20px;
}

/* For tablets: */
@media only screen and (min-width: 850px) {
  .videos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* For laptops: */
@media only screen and (min-width: 1170px) {
  .videos-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* For desktop: */
@media only screen and (min-width: 1500px) {
  .videos-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
