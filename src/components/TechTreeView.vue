<template>
  <div class="techTreeView">
    <h3 v-if="!object.data">Loading...</h3>

    <div v-else class="tree">
      <TechTreeNode
        :object="object"
        :nodes="object.data.techTree"
        :selectedObject="selectedObject"
        @expand="expand"
      />
    </div>

    <div v-if="selectedObject" class="subtree">
      <TechTreeView :object="selectedObject" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import TechTreeView from './TechTreeView';
import TechTreeNode from './TechTreeNode';

export default defineComponent({
  name: 'TechTreeView',
  components: {
    TechTreeView,
    TechTreeNode,
  },
  props: {
    object: Object,
  },
  setup(props) {
    const selectedObject = ref(null);

    watch(
      () => props.object,
      () => {
        selectedObject.value = null;
      }
    );

    const expand = (object) => {
      selectedObject.value = object;
      selectedObject.value.loadData();
    };

    return {
      selectedObject,
      expand,
    };
  },
});
</script>

<style scoped>
  .tree {
    text-align: center;
    overflow-x: auto;
    overflow-y: hidden;
    box-sizing: border-box;
  }

  .subtree {
    border-top: dashed 1px #777;
    margin-top: 15px;
    padding-top: 10px;
  }
</style>
