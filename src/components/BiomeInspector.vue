<template>
  <div class="biomeInspector" v-if="biome">
    <div v-if="loading" class="loading">Loading biome...</div>
    <div v-else>
      <div class="biomes">
        <div class="biomesTitle">Biomes</div>
        <BiomeList :selectedBiome="biome" />
      </div>
      <div class="info">
        <h2 class="title">{{ biome.name }} Biome</h2>
        <div class="biomeImgContainer">
          <BiomeImage :biome="biome" />
        </div>
        <ul>
          <li>
            Temperature: {{ temperatureText }}
            <span v-if="biome.data" class="details">(ground heat: {{ biome.data.groundHeat }})</span>
          </li>
        </ul>
        <div class="objects">
          <div class="object" v-for="object in objects" :key="object.id">
            <ObjectView :object="object" :spawnChance="biome.spawnChance(object)" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Loading biome...</div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Biome from '../models/Biome';

import ObjectView from './ObjectView';
import BiomeImage from './BiomeImage';
import BiomeList from './BiomeList';

export default defineComponent({
  components: {
    ObjectView,
    BiomeList,
    BiomeImage,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const biome = ref(null);
    const loading = ref(true);

    const loadBiome = async () => {
      loading.value = true;
      biome.value = await Biome.findAndLoad(route.params.id);
      loading.value = false;
      if (!biome.value) {
        router.replace("/not-found");
      }
    };

    watch(
      () => route.params.id,
      () => {
        loadBiome();
      }
    );

    onMounted(() => {
      loadBiome();
    });

    const objects = computed(() => {
      return biome.value?.objects() || [];
    });

    const temperatureText = computed(() => {
      const heat = biome.value?.data?.groundHeat;
      if (heat < 0.0) return "Very Cold";
      if (heat < 0.5) return "Cold";
      if (heat < 1.0) return "Cool";
      if (heat < 1.1) return "Mild";
      if (heat < 1.9) return "Warm";
      if (heat < 2.1) return "Hot";
      return "Very Hot";
    });

    return {
      biome,
      loading,
      objects,
      temperatureText,
    };
  },
  metaInfo() {
    return { title: `${this.biome?.name || "Biome"} Biome` };
  },
});
</script>

<style lang="scss">
.biomeInspector {
  .loading {
    text-align: center;
    padding: 20px;
    font-size: 18px;
    color: #aaa;
  }
  .biomes {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;
  }
  .biomesTitle {
    font-weight: bold;
    text-align: center;
  }

  .info {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0px;
  }
  .info .title {
    text-align: center;
    font-weight: bolder;
    margin: 0;
  }
  .info .subtitle {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin: 0;
  }
  .info ul {
    padding: 0;
    margin: 0 30px;
    font-size: 1.2rem;
    list-style-type: none;
  }
  .info li {
    text-align: center;
    padding: 2px 0;
  }
  .info li .details {
    color: #999;
  }

  .info .biomeImgContainer {
    width: 128px;
    height: 128px;
    display: block;
    margin: 5px auto;
  }

  .info .biomeImage {
    border-radius: 12px;
  }

  .info .objects {
    display: flex;
    flex-wrap: wrap;
  }

  .info .object {
    min-width: 200px;
    width: 33.3333%;
  }

  .info .objectView {
    /* TODO: Figure out how to override scoped CSS better */
    height: 220px !important;
  }

  .info .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  @media only screen and (max-width: 768px) {
    .info .object {
      min-width: 150px;
      width: 50%;
    }
  }
}
</style>
