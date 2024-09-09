<template>
  <div class="biomeImage" :style="{ backgroundImage: `url('${imageUrl}')` }">
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    biome: Object,
  },
  setup(props) {
    const imageUrl = computed(() => {
      return `${global.staticPath}/ground/ground_${props.biome.id}.png`;
    });

    return {
      imageUrl,
    };
  },
});
</script>

<style scoped>
  .biomeImage {
    width: 100%;
    height: 100%;
  }
</style>
