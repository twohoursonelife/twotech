<template>
  <div class="changeLogObjectChange" v-if="object">
    <ObjectImage :object="object" :scaleUpTo="80" :clickable="true" :title="object.name" />

    <div class="attributesFrom">
      <div class="attribute" v-for="attribute in attributes" :key="attribute">
        {{ attributeName(attribute) }}:
        {{ attributeValue(attribute, "from") }}
      </div>
    </div>

    <div class="arrow">&#9660;</div>

    <div class="attributesTo">
      <div class="attribute" v-for="attribute in attributes" :key="attribute">
        {{ attributeName(attribute) }}:
        {{ attributeValue(attribute, "to") }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import GameObject from '../models/GameObject';
import ObjectImage from './ObjectImage';

export default defineComponent({
  props: {
    change: Object,
  },
  components: {
    ObjectImage,
  },
  setup(props) {
    const object = computed(() => {
      return GameObject.find(props.change.id);
    });

    const attributes = computed(() => {
      return Object.keys(props.change.attributes);
    });

    const attributeName = (attribute) => {
      return attribute.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const attributeValue = (attribute, key) => {
      return props.change.attributes[attribute][key];
    };

    return {
      object,
      attributes,
      attributeName,
      attributeValue,
    };
  },
});
</script>

<style scoped>
  .changeLogObjectChange {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #333;
    border-radius: 10px;
    padding: 10px;
    margin: 10px;
  }

  .changeLogObjectChange .arrow {
    color: #777;
    font-size: 12px;
    padding: 3px 0;
  }

  .changeLogObjectChange .attribute {
    text-align: center;
  }

  .changeLogObjectChange .imgContainer {
    width: 128px;
    height: 128px;
  }
</style>
