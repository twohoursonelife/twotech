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

import GameObject from '../models/GameObject'

import VueSelect from './Select';
import ObjectImage from './ObjectImage';

export default {
  components: {
    VueSelect,
    ObjectImage
  },
  data() {
    return {
      selectedObject: GameObject.find(this.$route.params.id),
    };
  },
  watch: {
    '$route' (to, from) {
      this.selectedObject = GameObject.find(this.$route.params.id);
    }
  },
  computed: {
    objects () {
      return GameObject.byNameLength();
    }
  },
  methods: {
    selectObject (object) {
      if (object == this.selectedObject) return;
      this.$router.push(object ? object.url() : "/");
    }
  }
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
