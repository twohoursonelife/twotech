<template>
  <div class="changeLog">
    <ChangeLogVersion v-for="id in versionIds" :id="id" :key="id" />
    <div class="showMore">
      <span class="showMoreLink" @click="showMore" v-if="!singleVersion">
        Show More
      </span>
      <router-link v-else to="/versions">Show All Versions</router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import GameObject from '../models/GameObject';
import Version from '../models/Version';

import ChangeLogVersion from './ChangeLogVersion';

export default defineComponent({
  components: {
    ChangeLogVersion,
  },
  setup() {
    const route = useRoute();
    const limit = ref(3);
    const loadingMore = ref(false);

    const singleVersion = computed(() => {
      return route.params.id;
    });

    const versionIds = computed(() => {
      if (singleVersion.value) {
        return [singleVersion.value];
      }
      return GameObject.versions.slice(0, limit.value);
    });

    const handleScroll = () => {
      if (singleVersion.value) return;
      if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
        if (Version.isLoading()) return;
        if (!loadingMore.value) {
          loadingMore.value = true;
          limit.value += 1;
        }
      } else {
        loadingMore.value = false;
      }
    };

    const showMore = () => {
      limit.value += 3;
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      limit,
      versionIds,
      singleVersion,
      showMore,
    };
  },
  metaInfo() {
    if (this.singleVersion) {
      return { title: `Version ${this.singleVersion}` };
    }
    return { title: "Change Log" };
  },
});
</script>

<style scoped>
  .changeLog {
    margin-bottom: 10px;
  }

  .showMore {
    text-align: center;
    margin: 20px 0;
    font-size: 18px;
  }

  .showMoreLink {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
