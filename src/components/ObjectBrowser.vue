<template>
  <div class="objectBrowser">
    <div class="filterList">
      <div class="filter" v-for="filter in filters" :key="filter.key">
        <ObjectFilter :filter="filter" :selected="filter?.path === selectedFilter?.path" />
      </div>
    </div>

    <div v-if="showBiomes" class="biomes">
      <div class="biomesTitle">Biomes</div>
      <BiomeList />
    </div>

    <div v-if="showClothingFilters" class="filterList">
      <div class="clothingFilter" v-for="filter in clothingFilters" :key="filter.key">
        <ObjectFilter :filter="filter" :selected="filter?.path === selectedFilter?.path" />
      </div>
    </div>

    <div v-if="showContainerFilters" class="filterList">
      <div class="containerFilter" v-for="filter in containerFilters" :key="filter.key">
        <ObjectFilter :filter="filter" :selected="filter?.path === selectedFilter?.path" />
      </div>
    </div>

    <div class="objectListWrapper">
      <div class="objectListHeader">
        <div class="objectListSorter">
          Sort by:
          <span @click="sort('recent', false)" :class="{selected: sortBy === 'recent'}">Recent</span>,
          <span @click="sort('difficulty', false)" :class="{selected: sortBy === 'difficulty'}">Difficulty</span>,
          <span @click="sort('name', false)" :class="{selected: sortBy === 'name'}">Name</span>,
          <span @click="sort('numSlots', false)" :class="{selected: sortBy === 'numSlots'}">Slots</span>
        </div>
        <div class="objectListSorter">
          Order:
          <span @click="sort(sortBy, false)" :class="{selected: !descending}">Asc</span>,
          <span @click="sort(sortBy, true)" :class="{selected: descending}">Desc</span>
        </div>
        <div class="objectCraftableSelection">
          Only craftable:
          <input type="checkbox" :checked="hideUncraftable" @change="toggleHideUncraftable" />
        </div>
      </div>
      <div class="objectList">
        <div class="object" v-for="object in shownObjects" :key="object.id">
          <ObjectView :object="object" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import eventBus from '../eventBus';
import GameObject from '../models/GameObject';
import BrowserStorage from '../models/BrowserStorage';

import ObjectFilter from './ObjectFilter';
import ObjectView from './ObjectView';
import BiomeList from './BiomeList';

export default {
  components: {
    ObjectFilter,
    ObjectView,
    BiomeList,
  },
  props: {
    hideUncraftable: Boolean,
    toggleHideUncraftable: Function,
  },
  setup(props) {
    const route = useRoute();
    const showAmount = ref(24);
    let filter;
    if (typeof route.params.filter === "string") {
      filter = route.params.filter;
    } else if (route.params.filter && route.params.filter.length > 0 && typeof route.params.filter[0] === "string") {
      filter = route.params.filter[0];
    }
    const selectedFilter = ref(route.params.filter ? GameObject.findFilter(route.params.filter) : null);
    const sortBy = ref(BrowserStorage.getItem("ObjectBrowser.sortBy") || "recent");
    const descending = ref(BrowserStorage.getItem("ObjectBrowser.descending") === "true");
    const loadingMore = ref(false);
    const filters = computed(() => GameObject.filters);
    const clothingFilters = computed(() => GameObject.findFilter("clothing")?.subfilters || []);
    const containerFilters = computed(() => GameObject.findFilter("containers")?.subfilters || []);
    const shownObjects = computed(() => GameObject.objects(showAmount.value, selectedFilter.value, sortBy.value, descending.value, props.hideUncraftable));
    const showBiomes = computed(() => selectedFilter.value && selectedFilter.value.key === "natural");
    const showClothingFilters = computed(() => selectedFilter.value && selectedFilter.value.path.startsWith("/filter/clothing"));
    const showContainerFilters = computed(() => selectedFilter.value && selectedFilter.value.path.startsWith("/filter/containers"));

    const handleScroll = () => {
      if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
        if (!loadingMore.value) {
          loadingMore.value = true;
          showAmount.value += 24;
        }
      } else {
        loadingMore.value = false;
      }
    };

    const sort = (sortByValue, descendingValue) => {
      sortBy.value = sortByValue;
      descending.value = descendingValue;
      BrowserStorage.setItem("ObjectBrowser.sortBy", sortByValue);
      BrowserStorage.setItem("ObjectBrowser.descending", descendingValue.toString());
    };

    watch(route, (to) => {
      showAmount.value = 24;
      selectedFilter.value = to.params.filter ? GameObject.findFilter(to.params.filter) : null;
    });

    onMounted(() => {
      window.onscroll = handleScroll;
    });

    return {
      shownObjects,
      filters,
      clothingFilters,
      containerFilters,
      showBiomes,
      showClothingFilters,
      showContainerFilters,
      sortBy,
      descending,
      showAmount,
      selectedFilter,
      sort,
    };
  },
  metaInfo() {
    return { title: this.selectedFilter.value ? this.selectedFilter.value.name : "Object Browser" };
  },
};
</script>

<style lang="scss">
  .objectBrowser .filterList {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
  }

  .objectBrowser .objectListWrapper {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;
  }

  .objectBrowser .objectListHeader {
    margin: 0 15px;
    padding: 0;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .objectBrowser .objectListSorter {
    padding: 0 10px;
  }
  .objectBrowser .objectListSorter span {
    cursor: pointer;
    text-decoration: underline;
  }
  .objectBrowser .objectListSorter .selected {
    color: inherit;
    font-weight: bold;
    cursor: normal;
    text-decoration: none;
  }

  .objectBrowser .objectList {
    display: flex;
    flex-wrap: wrap;
  }

  .objectBrowser .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  .objectBrowser .filterList > .filter {
    min-width: 200px;
    width: 33.3333%;
  }

  .objectBrowser .objectList > .object {
    min-width: 200px;
    width: 33.3333%;
  }

  .objectBrowser .biomes {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;
  }
  .objectBrowser .biomesTitle {
    font-weight: bold;
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .objectBrowser .filterList > .filter {
      min-width: 150px;
      width: 50%;
    }
    .objectBrowser .objectList > .object {
      min-width: 150px;
      width: 50%;
    }
    .objectBrowser .objectListHeader {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
