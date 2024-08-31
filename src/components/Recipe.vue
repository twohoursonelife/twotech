<template>
  <div class="recipe">
    <div class="recipeHeadline" v-if="object">
      <ObjectImage
        class="recipeHeadlineObject"
        :hover="false"
        :clickable="true"
        :object="object"
      />
      <div class="recipeHeadlineText">
        <h2><router-link :to="objectUrl">{{ objectName }}</router-link></h2>
        <h3>Crafting Recipe</h3>
      </div>
    </div>

    <h3 v-if="loading || !objectData">Loading...</h3>
    <div v-else class="steps">
      <RecipeIngredients v-if="objectData.recipe.ingredients" :ingredients="objectData.recipe.ingredients" :rightClickObject="filterObject" />

      <RecipeIngredients v-if="objectData.recipe.uncraftables" title="UNCRAFTABLE Ingredients" :ingredients="objectData.recipe.uncraftables" :rightClickObject="filterObject" />

      <div class="filterHeadline" v-if="filteredObject">
        <h4>Filter:</h4>
        <ObjectImage
          class="filteredObject"
          hover="true"
          clickable="true"
          :object="filteredObject"
        />
        <a href="#" @click.prevent="clearFilter">Clear Filter</a>
      </div>

      <RecipeStep
        v-for="(transitions, index) in objectData.recipe.steps"
        :transitions="transitions"
        :number="index + 1"
        :key="index"
        :rightClickObject="filterObject"
        :filteredObject="filteredObject"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameObject from '../models/GameObject';
import RecipeIngredients from './RecipeIngredients';
import RecipeStep from './RecipeStep';
import ObjectImage from './ObjectImage';

const route = useRoute();
const router = useRouter();

const object = ref(null);
const filteredObject = ref(null);
const loading = ref(true);

const objectUrl = computed(() => object.value?.url() || '/not-found');
const objectName = computed(() => object.value?.name || 'Unknown');
const objectData = computed(() => object.value?.data);

async function loadObject(id) {
  loading.value = true;
  object.value = await GameObject.findAndLoad(id);
  loading.value = false;

  if (!object.value) {
    router.replace('/not-found');
  }
}

onMounted(() => {
  loadObject(route.params.id);
});

watch(() => route.params.id, (newId) => {
  loadObject(newId);
});

function filterObject(obj) {
  filteredObject.value = obj;
  if (obj) {
    setTimeout(() => {
      const scrollingElement = document.scrollingElement || document.body;
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }, 100);
  }
}

function clearFilter() {
  filteredObject.value = null;
}

function getMetaInfo() {
  return { title: `${objectName.value} Recipe` };
}

</script>

<style lang="scss" scoped>
  .recipe {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .recipeHeadline {
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .recipeHeadlineObject {
    margin-right: 10px;
    display: flex;
    align-items: center;
    z-index: 1;
    position: relative;
    display: block;
    width: 60px;
    height: 60px;
    background-color: #444;
    border: solid 1px transparent;
    border-radius: 3px;
    &:hover {
      border-color: #aaa;
      background-color: #666;
    }
  }

  .recipeHeadlineText {
    h2 {
      text-align: left;
      font-size: 20px;
      font-weight: bolder;
      margin: 0;
      a {
        color: inherit;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    h3 {
      text-align: left;
      font-size: 16px;
      font-weight: lighter;
      font-style: italic;
      margin: 0;
    }
  }

  .recipe .steps {
    display: flex;
    flex-direction: column;
  }

  .filterHeadline {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;

    h4 {
      text-align: center;
      font-size: 16px;
      margin: 0;
    }

    .filteredObject {
      margin: 0 10px;
      display: flex;
      align-items: center;
      z-index: 1;
      position: relative;
      display: block;
      width: 50px;
      height: 50px;
      background-color: #444;
      border: solid 1px transparent;
      border-radius: 3px;
      &:hover {
        border-color: #aaa;
        background-color: #666;
      }
    }
  }

  .clearFilter {
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .recipeHeadline {
      flex-direction: column;
      h2 {
        font-size: 18px;
        text-align: center;
      }
      h3 {
        font-size: 14px;
        text-align: center;
      }
    }
  }
</style>
