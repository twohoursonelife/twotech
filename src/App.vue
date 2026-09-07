<template>
  <div id="app">
    <h1>
      <router-link to="/">{{ pageTitle }}</router-link>
    </h1>

    <h2 v-if="loading">Loading...</h2>

    <div v-else>
      <div v-if="onEdge">
        <div class="edgeTitle">Browsing Unreleased</div>
        <div class="subtitle">
          <span v-if="showWhatsNew">
            <router-link to="/versions">What's new in Unreleased</router-link>
            |
          </span>
          <a :href="releasedContentUrl()">See Released Content</a>
        </div>
      </div>
      <div class="subtitle" v-else-if="gameUrl">
        <a :href="gameUrl" target="_blank">Visit {{ gameName }}</a>
      </div>
      <div class="subtitle" v-else>
        <span v-if="showWhatsNew">
          <router-link to="/versions">What's new in v{{ latestVersion }}</router-link>
          |
        </span>
        <a :href="unreleasedContentUrl()">See Unreleased Content</a>
      </div>

      <ObjectSearch :hide-uncraftable="hideUncraftable"/>

      <router-view
        :hide-uncraftable="hideUncraftable"
        :toggle-hide-uncraftable="toggleHideUncraftable"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useHead } from '@vueuse/head';
import { useRouter } from 'vue-router';

import BrowserStorage from './models/BrowserStorage';
import GameObject from './models/GameObject';
import Biome from './models/Biome';

import ObjectSearch from './components/ObjectSearch';
import ObjectBrowser from './components/ObjectBrowser';
import ObjectInspector from './components/ObjectInspector';
import TechTree from './components/TechTree';
import Recipe from './components/Recipe';
import RecipeForLetters from './components/RecipeForLetters';
import BiomeInspector from './components/BiomeInspector';
import ChangeLog from './components/ChangeLog';
import NotFound from './components/NotFound';

const loading = ref(true);
const router = useRouter();

const lastDate = computed(() => {
  const months = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];
  const month = GameObject.date.getMonth();
  const day = GameObject.date.getDate();
  const year = GameObject.date.getFullYear();
  return `${months[month]} ${day}, ${year}`;
});

const hideUncraftable = ref(BrowserStorage.getItem("ObjectBrowser.hideUncraftable") !== null
  ? BrowserStorage.getItem("ObjectBrowser.hideUncraftable") === "true"
  : true);

const toggleHideUncraftable = () => {
  hideUncraftable.value = !hideUncraftable.value;
  BrowserStorage.setItem("ObjectBrowser.hideUncraftable", hideUncraftable.value);
};

const latestVersion = computed(() => GameObject.versions[0]);

const showWhatsNew = computed(() => {
  if (process.env.ONETECH_MOD_NAME) return false;
  if (router.currentRoute.value.path === '/versions') return false;
  return true;
});

const gameName = computed(() => process.env.ONETECH_MOD_NAME || 'Two Hours One Life');

const defaultTitle = computed(() => "Crafting reference for " + gameName.value);

const pageTitle = computed(() => {
  const route = router.currentRoute.value;
  if (route.meta.title) return route.meta.title;
  if (loading.value) return defaultTitle.value;

  switch (route.meta.titleFrom) {
    case 'filter':
      return GameObject.findFilter(filterParamParts(route.params.filter))?.name || defaultTitle.value;
    case 'version':
      return `Version ${route.params.id}`;
    case 'biome':
      return Biome.find(route.params.id)?.name || defaultTitle.value;
    case 'object':
      return objectTitle(route.params.id, route.meta.titleSuffix);
    default:
      return defaultTitle.value;
  }
});

useHead({
  title: pageTitle,
  titleTemplate: "%s | twotech",
});

const gameUrl = computed(() => process.env.ONETECH_MOD_URL);

const onEdge = computed(() => global.edge);

onBeforeMount(() => {
  redirectOldHash();
  GameObject.load((data) => {
    Biome.setup(data.biomeIds, data.biomeNames);
    loading.value = false;
  });
});

function redirectOldHash() {
  if (!window.location.hash) return;
  const path = window.location.hash.substr(1).split('/');
  if (parseInt(path[0]) > 0) {
    path.unshift([path.shift(), path.shift()].join('-'));
  }
  router.replace('/' + path.join('/'));
}

function filterParamParts(filter) {
  return Array.isArray(filter) ? [...filter] : filter;
}

function objectTitle(id, suffix = "") {
  const object = GameObject.find(id);
  return object ? object.name + suffix : defaultTitle.value;
}

function unreleasedContentUrl() {
  return 'https://edge.twotech.twohoursonelife.com' + window.location.pathname;
}

function releasedContentUrl() {
  return 'https://twotech.twohoursonelife.com' + window.location.pathname;
}
</script>

<style lang="scss">
  body {
    background-color: #151515;
    margin: 0 auto;
    padding: 0 10px;
    max-width: 1024px;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #d3d3d3;
    margin-top: 40px;
  }

  h1, h2 {
    font-weight: normal;
    text-align: center;
  }

  li {
    text-align: left;
  }

  a {
    color: inherit;
  }

  #app > h1 {
    margin-bottom: 0;
    a {
      text-decoration: none;
      &.router-link-exact-active {
        cursor: default;
      }
    }
  }

  .edgeTitle {
    text-align: center;
    font-size: 20px;
    color: #F63E3E;
    margin-bottom: 6px;
  }

  .subtitle {
    color: #777;
    text-align: center;
    a {
      color: #ccc;
      text-decoration: underline;
    }
  }
</style>
