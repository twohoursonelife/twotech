<template>
  <div class="techTree" v-if="object && object.data">
    <h2><router-link :to="object.url()">{{ object.name }}</router-link></h2>
    <h3>Tech Tree</h3>

    <TechTreeView :object="object" />
  </div>
  <div v-else>
    Loading or object not found...
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameObject from '../models/GameObject';
import TechTreeView from './TechTreeView';

export default defineComponent({
  components: {
    TechTreeView,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const object = ref(null);

    const loadObject = async () => {
      object.value = await GameObject.findAndLoad(route.params.id);
      if (!object.value) {
        router.replace('/not-found');
      }
    };

    watch(
      () => route.params.id,
      () => {
        loadObject();
      }
    );

    onMounted(() => {
      loadObject();
    });

    return {
      object,
    };
  },
  metaInfo() {
    return { title: `${this.object?.name || 'Tech Tree'} Tech Tree` };
  },
});
</script>

<style scoped>
  .techTree {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .techTree > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }
  .techTree > h2 a {
    color: inherit;
    text-decoration: none;
  }
  .techTree > h2 a:hover {
    text-decoration: underline;
  }

  .techTree h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }
</style>
