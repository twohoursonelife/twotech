<template>
  <router-link v-if="clickable"
    :class="className"
    :title="title"
    v-tippy="{theme: 'twotech', animation: 'scale'}"
    :to="object.url()"
    @contextmenu="handleRightClick"
  >
    <slot />
  </router-link>
  <div v-else
    :class="[className, 'current']"
    :title="title"
    v-tippy="{theme: 'twotech', animation: 'scale'}"
  >
    <slot />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
// import 'tippy.js/themes/light.css'
import '../css/tippy.css'
import 'tippy.js/animations/perspective.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/animations/shift-away.css'
import 'tippy.js/animations/shift-toward.css'

export default defineComponent({
  props: {
    className: String,
    clickable: Boolean,
    title: String,
    object: Object,
    click: Function,
    rightClick: Function,
  },
  methods: {
    handleRightClick(event) {
      if (this.rightClick) {
        event.preventDefault();
        this.rightClick(this.object);
      }
    }
  }
});
</script>
