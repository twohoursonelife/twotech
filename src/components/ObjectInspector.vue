<template>
  <div class="objectInspector" v-if="object">
    <div class="info">
      <h2>{{ object.baseName() }}</h2>
      <h3 v-if="object.subName()">{{ object.subName() }}</h3>
      <ObjectImage :object="object" scaleUpTo="128" />
      <h3 v-if="loading">Loading...</h3>

      <div class="sounds" v-if="!loading && object.data && object.data.sounds">
        <div
          class="sound"
          v-for="sound in object.data.sounds"
          :key="sound"
          @click="playSound(sound)"
          title="Play Sound"
          v-tippy="{theme: 'twotech', animation: 'scale'}"
        >
          <audio :id="'sound' + sound" @ended="finishSound(sound)">
            <source :src="soundPath(sound, 'mp3')" type="audio/mp3" />
            <source :src="soundPath(sound, 'ogg')" type="audio/ogg" />
          </audio>
          <img src="../assets/sound.svg" width="22" height="20" alt="Play Sound" />
        </div>
      </div>

      <ul v-if="!loading && object.data">
        <li v-if="foodWithBothBonus">
          Food: {{ foodBase }}
          <span class="details"> + {{ foodBaseBonus }} bonus</span>
        </li>
        <li v-if="object.data.heatValue">Heat: {{ object.data.heatValue }}</li>
        <li v-if="object.clothingPart()">Clothing: {{ object.clothingPart() }}</li>
        <li v-if="object.hasInsulation()">Insulation: {{ object.insulationPercent() }}%</li>
        <li v-if="moveDistanceText">
          Move Distance: {{ moveDistanceText }}
          <span class="helpTip" v-tippy="{theme: 'twotech', animation: 'scale'}" :title="moveDistanceTip" v-if="moveDistanceTip">?</span>
        </li>
        <li v-if="moveType">Move Behavior: {{ moveType }}</li>
        <li v-if="numUses">
          Number of {{ useWord }}s: {{ numUses }}
          <span class="helpTip" v-tippy="{theme: 'twotech', animation: 'scale'}" :title="numMovesTip" v-if="numMovesTip">?</span>
        </li>
        <li v-if="totalFood">Total Food: {{ totalFood }}</li>
        <li v-if="object.data.useChance">
          Chance to use: {{ object.data.useChance * 100 }}%
          <span class="details">(last use is 100%)</span>
        </li>
        <li v-if="estimatedUses">Estimated {{ useWord }}s: {{ estimatedUses }}</li>
        <li v-if="pickupText">{{ pickupText }}</li>
        <li v-if="object.data.useDistance">Use Distance: {{ object.data.useDistance }} tiles</li>
        <li v-if="speedPercent">Walking Speed: {{ speedPercent }}%</li>
        <li v-if="sizeText">{{ sizeText }}</li>
        <li v-if="containerText">{{ containerText }}</li>
        <li v-if="object.data.blocksWalking">Blocks walking</li>
        <li v-if="object.data.deadlyDistance">Deadly</li>
        <li v-if="difficultyText">
          Difficulty: {{ difficultyText }}
          <span class="helpTip" v-tippy="{theme: 'twotech', animation: 'scale'}" :title="difficultyTip">?</span>
        </li>
        <li v-if="!object.data.craftable">UNCRAFTABLE</li>
        <li>
          Object ID: {{ object.id }}
        </li>
        <li v-if="object.data.version < 20269">
          Added in One Hour One Life v{{ object.data.version }}
        </li>
        <li v-else-if="object.data.version">
          Added in Two Hours One Life v{{ object.data.version }}
        </li>
        <li v-else-if="modName">Added in {{ modName }}</li>
        <li v-else>
          <router-link to="/versions/unreleased">Unreleased</router-link>
        </li>
      </ul>
    </div>
    <div class="transitionsPanels" v-if="!loading && object.data">
      <div class="transitionsPanel" v-if="object.data.transitionsToward.length > 0 || object.data.mapChance">
        <h3>How to get</h3>
        <div class="actions" v-if="object.data && (object.data.recipe || object.data.techTree)">
          <router-link :to="object.url('tech-tree')" v-if="object.data.techTree" title="Tech Tree" v-tippy="{theme: 'twotech', animation: 'scale'}">
            <img src="../assets/techtree.png" width="38" height="36" alt="Tech Tree" />
          </router-link>
          <router-link :to="object.url('recipe')" v-if="object.data.recipe" title="Crafting Recipe" v-tippy="{theme: 'twotech', animation: 'scale'}">
            <img src="../assets/recipe.png" width="41" height="42" alt="Crafting Recipe" />
          </router-link>
          <router-link to="/letters" v-if="isLetterOrSign" title="Letters Recipe" v-tippy="{theme: 'twotech', animation: 'scale'}">
            <img src="../assets/sign.png" width="40" height="41" alt="Letters Recipe" />
          </router-link>
        </div>
        <div v-if="object.data.mapChance" class="spawn">
          <div class="spawnChance">Spawn Chance: {{ spawnText }}</div>
          <div class="biomes">
            <router-link
              v-for="biome in biomes"
              :to="biome.url()"
              :title="biomeTitle(biome)"
              v-tippy="{theme: 'twotech', animation: 'scale'}"
              class="biome"
              :key="biome.id"
            >
              <BiomeImage :biome="biome" />
            </router-link>
          </div>
        </div>
        <TransitionsList
          :limit="object.data.mapChance ? '0' : '1'"
          :transitions="object.data.transitionsToward"
          :selectedObject="object"
        />
      </div>
      <div class="transitionsPanel" v-if="object.data.transitionsTimed.length > 0">
        <h3>Changes over time</h3>
        <TransitionsList
          limit="3"
          :transitions="object.data.transitionsTimed"
          :selectedObject="object"
        />
      </div>
      <div class="transitionsPanel" v-if="object.data.transitionsAway.length > 0">
        <h3>How to use</h3>
        <TransitionsList
          limit="10"
          :transitions="object.data.transitionsAway"
          :selectedObject="object"
        />
      </div>
    </div>
  </div>
  <div v-else>Loading object...</div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameObject from '../models/GameObject';
import Biome from '../models/Biome';

import ObjectImage from './ObjectImage';
import BiomeImage from './BiomeImage';
import TransitionsList from './TransitionsList';

import '../css/tippy.css'
import 'tippy.js/animations/perspective.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/animations/shift-away.css'
import 'tippy.js/animations/shift-toward.css'

export default defineComponent({
  components: {
    ObjectImage,
    BiomeImage,
    TransitionsList,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const object = ref(null);
    const loading = ref(true);

    const loadObject = async () => {
      loading.value = true;
      object.value = await GameObject.findAndLoad(route.params.id);
      loading.value = false;
      if (!object.value) {
        router.replace("/not-found");
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

    const biomes = computed(() => {
      return object.value?.data?.biomes?.map(biomeData => Biome.find(biomeData.id.toString())) || [];
    });

    const spawnText = computed(() => object.value?.spawnText());

    const difficultyText = computed(() => {
      if (!object.value?.difficulty) return;
      const levels = [
        "Extremely Easy",
        "Very Easy",
        "Easy",
        "Moderately Easy",
        "Moderate",
        "Moderately Hard",
        "Hard",
        "Very Hard",
        "Extremely Hard",
      ];
      return levels[Math.floor(object.value.difficulty * levels.length)];
    });

    const difficultyTip = computed(() => {
      const stepWord = object.value?.data?.depth == 1 ? "step" : "steps";
      return `${object.value?.data?.depth} ${stepWord} deep`;
    });

    const moveDistanceText = computed(() => {
      if (!object.value?.data?.moveDistance) return;
      const tiles = object.value.data.moveDistance > 1 ? "tiles" : "tile";
      return object.value.data.moveDistance + " " + tiles;
    });

    const moveDistanceTip = computed(() => {
      if (!object.value?.data?.moveDistance) return;
      return "Up to +4 tiles when walking over objects";
    });

    const moveType = computed(() => {
      if (!object.value?.data?.moveType) return;
      const types = ["None", "Chase", "Flee", "Random", "North", "South", "East", "West", "Find"];
      return types[object.value.data.moveType];
    });

    const numUses = computed(() => object.value?.data?.numUses);

    const estimatedUses = computed(() => {
      if (!object.value?.data?.useChance) return;
      return Math.round((numUses.value - 1) * (1 / object.value.data.useChance)) + 1;
    });

    const useWord = computed(() => (object.value?.data?.moveDistance ? "move" : "use"));

    const sizeText = computed(() => {
      if (!object.value?.data?.size) {
        if (!object.value?.data?.minPickupAge) return;
        return "Cannot be placed in container";
      }
      return `Item size: ${object.value.size()}`;
    });

    const containerText = computed(() => {
      if (!object.value?.data?.numSlots) return;
      return `Holds ${object.value.data.numSlots} ${object.value.slotSize()} items`;
    });

    const pickupText = computed(() => {
      if (!object.value?.data?.minPickupAge) return;
      return `Pickup at Age: ${object.value.data.minPickupAge}`;
    });

    const speedPercent = computed(() => object.value?.data?.speedMult * 100);

    const modName = computed(() => process.env.ONETECH_MOD_NAME);

    const foodBase = computed(() => object.value?.data?.foodValue?.[0]);

    const foodBaseBonus = computed(() => object.value?.data?.foodValue?.[1]);

    const foodWithBothBonus = computed(() => {
      if (!foodBase.value) return;
      return foodBase.value + foodBaseBonus.value + GameObject.foodEatBonus;
    });

    const totalFood = computed(() => {
      if (!foodBase.value || !numUses.value) return;
      return foodBase.value * numUses.value;
    });

    const biomeTitle = (biome) => {
      const biomeData = object.value?.data?.biomes.find((biomeData) => biomeData.id == biome.id);
      return `${biome.name} (${object.value.toPercent(biomeData.spawnChance, 2)}%)`;
    };

    const soundPath = (id, extension) => {
      return `${global.staticPath}/sounds/${id}.${extension}`;
    };

    const playSound = (id) => {
      const sound = document.getElementById(`sound${id}`);
      if (sound.paused) {
        sound.load();
        sound.play();
        sound.parentElement.classList.add("playing");
      } else {
        sound.pause();
        sound.currentTime = 0;
        sound.parentElement.classList.remove("playing");
      }
    };

    const finishSound = (id) => {
      const sound = document.getElementById(`sound${id}`);
      sound.parentElement.classList.remove("playing");
    };

    return {
      object,
      loading,
      biomes,
      spawnText,
      difficultyText,
      difficultyTip,
      moveDistanceText,
      moveDistanceTip,
      moveType,
      numUses,
      estimatedUses,
      useWord,
      sizeText,
      containerText,
      pickupText,
      speedPercent,
      modName,
      foodBase,
      foodBaseBonus,
      foodWithBothBonus,
      totalFood,
      biomeTitle,
      soundPath,
      playSound,
      finishSound,
    };
  },
  metaInfo() {
    return { title: this.object?.name };
  },
});
</script>

<style scoped lang="scss">
  .objectInspector {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .objectInspector .info {
    flex: 1 1 0;
    background-color: #2b2b2b;
    margin: 10px 0;
    border-radius: 5px;
    padding-bottom: 30px;
  }
  .objectInspector .info > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0;
  }
  .objectInspector .info > h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin: 0;
  }
  .objectInspector .info > .imgContainer {
    width: 100%;
    height: 256px;
  }

  .objectInspector .sounds {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .objectInspector .sound {
    margin: 0 8px;
    cursor: pointer;
    width: 38px;
    height: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: solid 1px transparent;
    background-color: #505050;
    &:hover {
      background-color: #666;
      border: solid 1px #eee;
    }
    &.playing {
      background-color: #d00;
    }
  }

  .objectInspector .info > ul {
    padding: 0;
    margin: 0 30px;
    font-size: 1.2rem;
    list-style-type: none;
  }
  .objectInspector .info li {
    text-align: center;
    padding: 2px 0;
  }
  .objectInspector .info li .details {
    color: #999;
  }

  .objectInspector .actions {
    display: flex;
    justify-content: center;
    padding: 10px;
    background-color: #2b2b2b;
    border-radius: 5px;
    margin-top: 10px;
  }
  .objectInspector .actions a {
    display: block;
    margin: 0 10px;
    padding: 8px 10px;
    background-color: #505050;
    border: 1px solid transparent;
    border-radius: 5px;
    display: flex;
    align-items: center;
  }
  .objectInspector .actions a:hover {
    border: 1px solid #eee;
    background-color: #666;
  }
  .objectInspector .actions a img {
    display: block;
  }

  .objectInspector .info .helpTip {
    display: inline-block;
    width: 1.18rem;
    height: 1.18rem;
    font-size: 0.9rem;
    border: 1px solid #999;
    border-radius: 0.6rem;
    background-color: #222;
    vertical-align: 0.15rem;
    margin-left: 3px;
  }
  .objectInspector .info .helpTip:hover {
    background-color: #555;
    cursor: default;
  }

  .objectInspector .transitionsPanel {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
  }

  .objectInspector .transitionsPanel > h3 {
    font-size: 18px;
    margin: 0;
    padding: 0;
    text-align: center;
  }

  .objectInspector .spawn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background-color: #2b2b2b;
    border-radius: 5px;
    margin-top: 10px;
  }

  .objectInspector .spawnChance {
    margin-bottom: 10px;
  }

  .objectInspector .biomes {
    display: flex;
    flex-wrap: wrap;
  }

  .objectInspector .biome {
    margin: 0 5px;
    width: 54px;
    height: 54px;
  }

  .objectInspector .biomeImage {
    border-radius: 5px;
    border: solid 1px transparent;
  }

  .objectInspector .biomeImage:hover {
    border: solid 1px white;
  }

  .objectInspector .playSound {
    text-decoration: underline;
    cursor: pointer;
  }

  @media only screen and (max-width: 768px) {
    .objectInspector {
      flex-direction: column;
      align-items: center;
    }

    .objectInspector .info {
      width: 100%;
    }

    .objectInspector .info > ul {
      font-size: 1.1rem;
    }

    .objectInspector .transitionsPanel {
      margin-left: 0;
    }
  }
</style>
