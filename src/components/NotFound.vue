<template>
  <div class="notFound">
    <h2>You got lost...</h2>
    <h3>but you managed to find a wild carrot!</h3>
    <ObjectImage v-if="object" :object="object" :scaleUpTo="256" />
    <div class="caption">Object ID 404</div>
    <router-link to="/" class="home">Go Back Home</router-link>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import GameObject from '../models/GameObject';
import ObjectImage from './ObjectImage';

export default defineComponent({
  components: {
    ObjectImage,
  },
  setup() {
    const object = ref(null);

    onMounted(() => {
      object.value = GameObject.find("404");
    });

    return {
      object,
    };
  },
  metaInfo() {
    return { title: "Not Found" };
  }
});
</script>

<style scoped>
  .notFound {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #2b2b2b;
    margin: 10px 0;
    border-radius: 5px;
    padding: 30px 0;
  }

  .notFound > h2 {
    font-weight: bolder;
    margin: 0;
  }

  .notFound > h3 {
    font-weight: lighter;
    font-style: italic;
    margin-top: 10px;
  }

  .notFound .imgContainer {
    margin-top: 10px;
  }

  .notFound .caption {
    margin-top: -10px;
    font-size: 16px;
  }

  .notFound .home {
    display: block;
    margin-top: 40px;
    margin-bottom: 10px;
    font-size: 24px;
    color: #ddd;
    text-decoration: none;
    padding: 10px 20px;
    background-color: #444;
    border-radius: 10px;
    border: solid 1px transparent;
  }
  .notFound .home:hover {
    background-color: #555;
    border: solid 1px #ddd;
  }
</style>
