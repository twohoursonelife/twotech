<template>
  <div class="changeLogCommit">
    <div class="message">
      <div class="messageContent">{{ commit.message }}</div>
      <div class="messageDate">{{ date }}</div>
      <div v-if="hasChanges" class="collapse" @click="toggleCollapse">
        <span v-if="collapsed">&#x25C0;</span>
        <span v-else>&#x25BC;</span>
      </div>
    </div>

    <div v-if="!collapsed && commit.removedObjectIDs" class="objectsList">
      <h3>Removed Objects</h3>
      <div class="objects">
        <div v-for="object in removedObjects" class="objectWrapper" :key="object.id">
          <div class="object">
            <ObjectImage :object="object" :scaleUpTo="80" />
            <div class="name">{{ object.name }}</div>
          </div>
        </div>
      </div>
      <div v-if="commit.removedObjectIDs.length > objectLimit" class="showMore">
        <span class="link" @click="showMoreObjects">Show more...</span>
      </div>
    </div>

    <div v-if="!collapsed && commit.addedObjectIDs" class="objectsList">
      <h3>Added Objects</h3>
      <div class="objects">
        <div v-for="object in addedObjects" class="objectWrapper" :key="object.id">
          <router-link class="object"
              :to="object.url()"
              :class="{ disabled: object.legacy }"
              :event="object.legacy ? '' : 'click'">
            <ObjectImage :object="object" :scaleUpTo="80" />
            <div class="name">{{ object.name }}</div>
          </router-link>
        </div>
      </div>
      <div v-if="commit.addedObjectIDs.length > objectLimit" class="showMore">
        <span class="link" @click="showMoreObjects">Show more...</span>
      </div>
    </div>

    <div v-if="!collapsed && commit.removedTransitions">
      <h3>Removed Transitions</h3>
      <div class="transitions">
        <div v-for="(transition, index) in removedTransitions" class="transition" :key="index">
          <TransitionView :transition="transition" />
        </div>
        <div v-if="commit.removedTransitions.length > 1" class="transitionSpacer"></div>
      </div>
      <div v-if="commit.removedTransitions.length > transitionLimit" class="showMore">
        <span class="link" @click="showMoreTransitions">Show more...</span>
      </div>
    </div>

    <div v-if="!collapsed && commit.addedTransitions">
      <h3>Added Transitions</h3>
      <div class="transitions">
        <div v-for="(transition, index) in addedTransitions" class="transition" :key="index">
          <TransitionView :transition="transition" />
        </div>
        <div v-if="commit.addedTransitions.length > 1" class="transitionSpacer"></div>
      </div>
      <div v-if="commit.addedTransitions.length > transitionLimit" class="showMore">
        <span class="link" @click="showMoreTransitions">Show more...</span>
      </div>
    </div>

    <div v-if="!collapsed && commit.objectChanges" class="objectChanges">
      <h3>Changed Objects</h3>
      <div class="objects">
        <div v-for="change in objectChanges" class="changedObject" :key="change.id">
          <ChangeLogObjectChange :change="change" />
        </div>
      </div>
      <div v-if="commit.objectChanges.length > objectChangeLimit" class="showMore">
        <span class="link" @click="showMoreObjectChanges">Show more...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import GameObject from '../models/GameObject';
import ObjectImage from './ObjectImage';
import TransitionView from './TransitionView';
import ChangeLogObjectChange from './ChangeLogObjectChange';

export default defineComponent({
  props: {
    commit: Object,
  },
  components: {
    ObjectImage,
    TransitionView,
    ChangeLogObjectChange,
  },
  setup(props) {
    const objectLimit = ref(8);
    const transitionLimit = ref(6);
    const objectChangeLimit = ref(6);
    const collapsed = ref(false);

    const addedObjects = computed(() => {
      // Filter out any null or undefined objects
      return props.commit.addedObjectIDs
        .map(id => GameObject.find(id))
        .filter(object => object !== null && object !== undefined)
        .slice(0, objectLimit.value);
    });

    const removedObjects = computed(() => {
      return props.commit.removedObjectIDs.slice(0, objectLimit.value).map(id => GameObject.find(id));
    });

    const addedTransitions = computed(() => {
      return props.commit.addedTransitions.slice(0, transitionLimit.value);
    });

    const removedTransitions = computed(() => {
      return props.commit.removedTransitions.slice(0, transitionLimit.value);
    });

    const objectChanges = computed(() => {
      return props.commit.objectChanges.slice(0, objectChangeLimit.value);
    });

    const hasChanges = computed(() => {
      return props.commit.addedObjectIDs
        || props.commit.removedObjectIDs
        || props.commit.addedTransitions
        || props.commit.removedTransitions
        || props.commit.objectChanges;
    });

    const date = computed(() => {
      const date = new Date(props.commit.date);
      const months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      return `${months[month]} ${day}, ${year}`;
    });

    const showMoreObjects = () => {
      objectLimit.value += 24;
    };

    const showMoreTransitions = () => {
      transitionLimit.value += 24;
    };

    const showMoreObjectChanges = () => {
      objectChangeLimit.value += 24;
    };

    const toggleCollapse = () => {
      collapsed.value = !collapsed.value;
    };

    return {
      objectLimit,
      transitionLimit,
      objectChangeLimit,
      collapsed,
      addedObjects,
      removedObjects,
      addedTransitions,
      removedTransitions,
      objectChanges,
      hasChanges,
      date,
      showMoreObjects,
      showMoreTransitions,
      showMoreObjectChanges,
      toggleCollapse,
    };
  },
  created() {
    if (this.commit.legacyObjects) {
      for (let object of this.commit.legacyObjects) {
        GameObject.addLegacyObject(object);
      }
    }
  }
});
</script>

<style scoped>
  .changeLogCommit {
    display: flex;
    flex-direction: column;
    background-color: #222;
    border-radius: 10px;
    margin: 10px 0;
  }

  .changeLogCommit .message {
    display: flex;
    background-color: #333;
    border-radius: 10px;
    margin: 10px;
    padding: 10px 20px;
    align-items: flex-start;
  }

  .changeLogCommit .messageContent {
    flex: 1;
  }

  .changeLogCommit .messageDate {
    padding-left: 20px;
    color: #999;
  }

  .changeLogCommit .collapse {
    color: #ccc;
    padding-left: 10px;
    cursor: pointer;
  }

  .changeLogCommit h3 {
    font-size: 16px;
    color: #ccc;
    margin-top: 5px;
    margin-bottom: 0;
    text-align: center;
  }

  .changeLogCommit .objects {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
    padding-bottom: 10px;
    justify-content: center;
  }

  .changeLogCommit .objectWrapper {
    display: flex;
    align-items: stretch;
    min-width: 150px;
    width: 25%;
  }

  .changeLogCommit .object {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #333;
    border-radius: 10px;
    padding: 10px;
    margin: 10px;
    border: 1px solid transparent;
    text-decoration: inherit;
    color: inherit;
  }
  .changeLogCommit a.object:hover {
    border: 1px solid #eee;
    background-color: #222;
  }
  .changeLogCommit a.object.disabled {
    cursor: default;
  }
  .changeLogCommit a.object.disabled:hover {
    border: 1px solid transparent;
    background-color: #333;
  }

  .changeLogCommit .object .name {
    text-align: center;
  }

  .changeLogCommit .object .imgContainer {
    width: 128px;
    height: 128px;
    border: solid 1px transparent;
  }

  .changeLogCommit .changedObject {
    display: flex;
    align-items: stretch;
    min-width: 200px;
    width: 33.3333%;
  }

  .changeLogCommit .transitions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding-bottom: 10px;
  }

  .changeLogCommit .transition {
    width: 380px;
    margin: 0 10px;
  }

  .changeLogCommit .transitionSpacer {
    height: 0;
    width: 380px;
    margin: 0 10px;
  }

  .changeLogCommit .showMore {
    margin-bottom: 10px;
    text-align: center;
  }

  .changeLogCommit .showMore .link {
    text-decoration: none;
    font-style: italic;
    cursor: pointer;
  }

  .changeLogCommit .showMore .link:hover {
    text-decoration: underline;
  }

  @media only screen and (max-width: 768px) {
    .changeLogCommit .messageDate {
      display: none;
    }
    .changeLogCommit .objectWrapper {
      min-width: 150px;
      width: 50%;
    }
    .changeLogCommit .changedObject {
      min-width: 150px;
      width: 50%;
    }
    .changeLogCommit .transition {
      margin: 0;
    }
  }
</style>
