<template>
  <div class="transitionsList">
    <div class="transitions">
      <TransitionView
        v-for="(transition, index) in visibleTransitions"
        :key="index"
        :transition="transition"
        :selectedObject="selectedObject"
      />
    </div>
    <div v-if="canShowMore" class="showMoreWrapper">
      <span class="showMore" @click="expand">
        Show more ways...
      </span>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import TransitionView from './TransitionView';

export default defineComponent({
  props: {
    title: String,
    limit: Number,
    transitions: Array,
    selectedObject: Object,
  },
  components: {
    TransitionView,
  },
  setup(props) {
    const visibleTransitions = computed(() => {
      return props.transitions.slice(0, props.limit);
    });

    const canShowMore = computed(() => {
      return props.limit && props.limit < props.transitions.length;
    });

    const expand = () => {
      props.limit = parseInt(props.limit) + 50;
    };

    return {
      visibleTransitions,
      canShowMore,
      expand,
    };
  },
});
</script>

<style scoped>
  .transitionsList .transitions {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .transitionsList .showMoreWrapper {
    text-align: center;
    margin-top: 10px;
  }
  .transitionsList .showMore {
    cursor: pointer;
  }
  .transitionsList .showMore:hover {
    text-decoration: underline;
  }
</style>
