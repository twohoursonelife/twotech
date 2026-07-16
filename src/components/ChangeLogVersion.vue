<template>
  <div class="changeLogVersion">
    <h2>{{ name }}</h2>
    <div v-if="!version.data" class="loading">
      Loading...
    </div>
    <div v-else-if="isEmptyUnreleased">
      <div class="empty">Currently no unreleased content</div>
    </div>
    <div v-else>
      <div v-if="date" class="date">{{ date }}</div>
      <ChangeLogCommit v-for="commit in version.data.commits" :commit="commit" :key="commit.sha" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import Version from '../models/Version';
import ChangeLogCommit from './ChangeLogCommit';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {
    ChangeLogCommit,
  },
  setup(props) {
    // Fetch the version data based on the provided id prop
    // Do this instead of onMounted so that the data is available immediately for rendering
    // If we set this to ref(null) and then fetch in onMounted, the component will render once with null data for version,
    // which means date and isEmptyUnreleased will attempt to access properties of null and throw an error. By fetching the version data immediately, we avoid this issue.
    const version = ref(Version.fetch(props.id));

    const date = computed(() => {
      if (!version.value?.data?.date) return;
      const dateObj = new Date(version.value.data.date);
      const months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();
      return `${months[month]} ${day}, ${year}`;
    });

    const name = computed(() => {
      return props.id === "unreleased" ? "Unreleased" : `Version ${props.id}`;
    });

    const isEmptyUnreleased = computed(() => {
      return props.id === "unreleased" && version.value?.data?.commits?.length === 0;
    });

    return {
      version,
      date,
      name,
      isEmptyUnreleased,
    };
  },
});
</script>

<style scoped>
  .changeLogVersion > h2 {
    margin-top: 20px;
    margin-bottom: 0;
    padding: 0;
  }

  .changeLogVersion .date,
  .changeLogVersion .empty {
    color: #999;
    text-align: center;
    margin-bottom: 10px;
    font-style: italic;
  }
</style>
