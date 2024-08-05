<template>
  <div class="objectBrowser">
    <div class="filterList">
      <div class="filter" v-for="filter in filters" >
        <ObjectFilter :filter="filter" :selected="filter == selectedFilter" />
      </div>
    </div>

    <div v-if="showBiomes" class="biomes">
      <div class="biomesTitle">Biomes</div>
      <BiomeList />
    </div>

    <div v-if="showClothingFilters" class="filterList">
      <div class="clothingFilter" v-for="filter in clothingFilters" >
        <ObjectFilter :filter="filter" :selected="filter == selectedFilter" />
      </div>
    </div>

    <div v-if="showContainerFilters" class="filterList">
      <div class="containerFilter" v-for="filter in containerFilters" >
        <ObjectFilter :filter="filter" :selected="filter == selectedFilter" />
      </div>
    </div>

    <div class="objectListWrapper">
      <div class="objectListHeader">
        <div class="objectListSorter">
          Sort by:
          <span @click="sort('recent', false)" :class="{selected: sortBy == 'recent'}">Recent</span>,
          <span @click="sort('difficulty', false)" :class="{selected: sortBy == 'difficulty'}">Difficulty</span>,
          <span @click="sort('name', false)" :class="{selected: sortBy == 'name'}">Name</span>
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
        <div class="object" v-for="object in shownObjects">
          <ObjectView :object="object" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  data () {
    return {
      showAmount: 24,
      selectedFilter: GameObject.findFilter(this.$route.params.filter),
      sortBy: BrowserStorage.getItem("ObjectBrowser.sortBy") || "recent",
      descending: BrowserStorage.getItem("ObjectBrowser.descending") === "true",
      hideUncraftable: BrowserStorage.getItem("ObjectBrowser.hideUncraftable") !== null
                      ? BrowserStorage.getItem("ObjectBrowser.hideUncraftable") === "true"
                      : true,
    }
  },
  created () {
    window.onscroll = () => this.handleScroll();
  },
  watch: {
    "$route"(to, from) {
      this.showAmount = 24;
      this.selectedFilter = GameObject.findFilter(to.params.filter);
    }
  },
  computed: {
    shownObjects() {
      return GameObject.objects(this.showAmount, this.selectedFilter, this.sortBy, this.descending, this.hideUncraftable);
    },
    filters() {
      return GameObject.filters;
    },
    clothingFilters() {
      return GameObject.findFilter("clothing").subfilters;
    },
    containerFilters() {
      return GameObject.findFilter("containers").subfilters;
    },
    showBiomes() {
      return this.selectedFilter && this.selectedFilter.key === "natural";
    },
    showClothingFilters() {
      return this.selectedFilter && this.selectedFilter.path.startsWith("/filter/clothing");
    },
    showContainerFilters() {
      return this.selectedFilter && this.selectedFilter.path.startsWith("/filter/containers");
    }
  },
  methods: {
    handleScroll() {
      if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
        if (!this.loadingMore) {
          this.loadingMore = true;
          this.showAmount += 24;
        }
      } else {
        this.loadingMore = false;
      }
    },
    sort(sortBy, descending) {
      this.sortBy = sortBy;
      this.descending = descending;

      BrowserStorage.setItem("ObjectBrowser.sortBy", sortBy);
      BrowserStorage.setItem("ObjectBrowser.descending", descending.toString());
    },
    toggleHideUncraftable(event) {
      this.hideUncraftable = !this.hideUncraftable;
      BrowserStorage.setItem("ObjectBrowser.hideUncraftable", this.hideUncraftable);
      eventBus.$emit('hide-uncraftable', this.hideUncraftable);
    },
  },
  metaInfo() {
    if (this.selectedFilter)
      return {title: this.selectedFilter.name};
    return {};
  }
}
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
