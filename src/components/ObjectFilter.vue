<template>
  <router-link class="nostyle" :to="url">
    <div class="objectFilter" :class="{ selected }">
      <h3>{{ filter.name }}</h3>
      <div v-if="selected" class="deselect">x</div>
    </div>
  </router-link>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    filter: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const url = computed(() => {
      return props.selected ? '/' : `${props.filter.path}`;
    });

    return { url };
  }
});
</script>

<style scoped>
  .objectFilter {
    position: relative;
    margin: 5px 10px;
    background-color: #444;
    border-radius: 5px;
    border: 1px solid transparent;
  }

  .objectFilter.selected {
    background-color: #777;
  }

  .objectFilter h3 {
    text-align: center;
    margin: 10px 5px;
  }

  .objectFilter .deselect {
    position: absolute;
    right: 15px;
    top: 13px;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    font-size: 16px;
    background-color: #555;
    font-weight: bold;
    line-height: 18px;
    text-align: center;
  }

  a.nostyle:link, a.nostyle:visited {
    text-decoration: inherit;
    color: inherit;
  }

  @media only screen and (min-width: 768px) {
    .objectFilter:hover {
      border: 1px solid #eee;
      background-color: #222;
    }

    .objectFilter.selected:hover {
      background-color: #777;
    }

    .objectFilter:hover .deselect {
      background-color: #222;
    }
  }

  @media only screen and (max-width: 768px) {
    .objectFilter.selected h3 {
      margin-left: 26px;
      margin-right: 26px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .objectFilter h3 {
      font-size: 16px;
    }

    .objectFilter .deselect {
      right: 8px;
      top: 11px;
    }
  }
</style>
