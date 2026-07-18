<template>
  <div class="objectSearch">
    <VueSelect
      ref="VueSelectElem"
      label="lowerCaseName"
      :use-guessing-engine="true"
      :options="objects"
      :value="selectedObject"
      @change="selectObject"
      :placeholder="placeholderVal"
    >
      <template v-slot:option="option">
        <ObjectImage :object="option"/>
        {{option.name}}
      </template>
    </VueSelect>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameObject from '../models/GameObject';

import VueSelect from './Select';
import ObjectImage from './ObjectImage';
import BrowserStorage from '../models/BrowserStorage';

export default {
  components: {
    VueSelect,
    ObjectImage,
  },
  props: {
    hideUncraftable: Boolean,
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const VueSelectElem = ref(null);
    const placeholderVal = ref("Search");

    const selectedObject = ref(GameObject.find(route.params.id));
    const objects = computed(() => GameObject.byNameLength(props.hideUncraftable));

    watch(() => route.params.id, (id) => {
      if (VueSelectElem.value) VueSelectElem.value.search = "";
      selectedObject.value = id ? GameObject.find(id.split('-')[0]) : null;
      placeholderVal.value = "Search";
    });

    const selectObject = (object) => {
      let newSelectedObject = null;
      if (typeof(object) === 'string') {
        newSelectedObject = GameObject.findByName(object);
      } else {
        newSelectedObject = object;
      }
      if (newSelectedObject === selectedObject.value) return;
      if (newSelectedObject) {
        selectedObject.value = newSelectedObject;
        router.push(newSelectedObject.url());
      }
    };

    return {
      selectedObject,
      selectObject,
      VueSelectElem,
      placeholderVal,
      objects,
    };
  },
};
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
