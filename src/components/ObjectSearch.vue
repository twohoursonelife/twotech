<template>
  <div class="objectSearch">
    <VueSelect label="lowerCaseName" use-guessing-engine :options="objects" v-model="selectedObject" :on-change="selectObject" placeholder="Search">
      <template slot="option" slot-scope="option">
        <ObjectImage :object="option" />
        {{option.name}}
      </template>
    </VueSelect>
  </div>
</template>

<script>
import _ from 'lodash';

import eventBus from '../eventBus'
import GameObject from '../models/GameObject'

import VueSelect from './Select';
import ObjectImage from './ObjectImage';
import BrowserStorage from '../models/BrowserStorage';

export default {
  components: {
    VueSelect,
    ObjectImage
  },
  data() {
    let hideUncraftable = BrowserStorage.getItem("ObjectBrowser.hideUncraftable") !== null 
                      ? BrowserStorage.getItem("ObjectBrowser.hideUncraftable") === "true" 
                      : true;
    return {
      selectedObject: GameObject.find(this.$route.params.id),
      objects: GameObject.byNameLength(hideUncraftable),
    };
  },
  watch: {
    '$route' (to, from) {
      this.selectedObject = GameObject.find(this.$route.params.id);
    }
  },
  methods: {
    selectObject: function(object) {
      if (object == this.selectedObject) return;
      this.$router.push(object ? object.url() : "/");
    }
  },
  mounted() {
    // Listen for the hide-uncraftable checkbox even from ObjectBrowser, adjust objects accordingly
    eventBus.$on('hide-uncraftable', (val) => {
      console.log('hide-uncraftable event triggered! val = ' + val);
      this.objects = GameObject.byNameLength(val);
    })
  },
  beforeDestroy() {
    // removing eventBus listener
    eventBus.$off('hide-uncraftable')
  },
}
</script>

<style>
  .objectSearch {
    margin-top: 20px;
  }
  .objectSearch .v-select .dropdown-toggle {
    background-color: #222;
    border: 2px solid #777;
  }

  .objectSearch .dropdown.v-select .dropdown-toggle * {
    color: #dcdcdc;
  }

  .objectSearch .dropdown.v-select .dropdown-menu {
    border: solid #777;
    background-color: #222;
    border-width: 0px 2px 2px 2px;
  }

  .objectSearch .dropdown.v-select .dropdown-menu li a {
    color: #dcdcdc;
  }

  .objectSearch .dropdown.v-select .dropdown-menu li.highlight > a {
    background-color: #333;
  }

  .objectSearch .dropdown.v-select .image {
    width: 35px;
    height: 35px;
  }
</style>
