<template>
  <div class="transitionView">
    <!-- What object is being used -->
    <div class="leftSide">
      <ObjectImage class="transitionObject"
                  v-if="transition.decay"
                  hover="true"
                  :decay="transition.decay" />

      <ObjectImage class="transitionObject"
                  v-else-if="transition.actorID || transition.hand"
                  :hand="transition.hand" hover="true"
                  :object="actor"
                  :uses="transition.actorUses"
                  :clickable="transition.actorID && actor?.id !== selectedObject?.id" />

      <div v-else class="placeholder"></div>

      <div v-if="twoOnLeft" class="plus">+</div>
      <div v-else class="gap"></div>

      <!-- What object is the target -->
      <ObjectImage class="transitionObject"
                  v-if="transition.targetID"
                  hover="true"
                  :object="target"
                  :uses="transition.targetUses"
                  :wildcard="wildcard"
                  :clickable="transition.targetID && target?.id !== selectedObject?.id" />

      <ObjectImage class="transitionObject"
                  v-else-if="transition.targetPlayer"
                  hover="true"
                  player="true" />

      <ObjectImage class="transitionObject"
                  v-else
                  :ground="true"
                  hover="true" />
    </div>

    <div class="arrow"></div>

    <div class="rightSide">
      <!-- What does the used object become? -->
      <ObjectImage class="transitionObject"
                  v-if="showNewActor"
                  :hand="transition.hand" hover="true"
                  :weight="transition.newActorWeight"
                  :uses="transition.newActorUses"
                  :move="transition.move"
                  :object="newActor"
                  :clickable="newActor && newActor?.id !== selectedObject?.id" />

      <div class="gap" v-if="showNewActor"></div>

      <!-- What does the target item become? -->
      <ObjectImage class="transitionObject"
                  v-if="transition.newTargetID"
                  hover="true"
                  :weight="transition.newTargetWeight"
                  :uses="transition.newTargetUses"
                  :move="transition.move"
                  :wildcard="wildcard"
                  :object="newTarget"
                  :extraObject="newExtraTarget"
                  :clickable="newTarget && newTarget?.id !== selectedObject?.id" />

      <ObjectImage class="transitionObject"
                  v-else
                  :ground="true"
                  hover="true" />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import GameObject from '../models/GameObject';
import ObjectImage from './ObjectImage';

export default defineComponent({
  props: {
    transition: Object,
    selectedObject: Object,
  },
  components: {
    ObjectImage,
  },
  setup(props) {
    const twoOnLeft = computed(() => {
      return props.transition.actorID || props.transition.decay || props.transition.hand;
    });

    const actor = computed(() => {
      return GameObject.find(props.transition.actorID);
    });

    const target = computed(() => {
      return GameObject.find(props.transition.targetID);
    });

    const newActor = computed(() => {
      return GameObject.find(props.transition.newActorID);
    });

    const newTarget = computed(() => {
      return GameObject.find(props.transition.newTargetID);
    });

    const newExtraTarget = computed(() => {
      return GameObject.find(props.transition.newExtraTargetID);
    });

    const showNewActor = computed(() => {
      return !props.transition.decay;
    });

    const wildcard = computed(() => {
      return showNewActor.value && (props.transition.targetID || 0) < 1 && (props.transition.newTargetID || 0) < 1;
    });

    return {
      twoOnLeft,
      actor,
      target,
      newActor,
      newTarget,
      newExtraTarget,
      showNewActor,
      wildcard,
    };
  },
});
</script>

<style scoped>
  .transitionView {
    overflow: hidden;

    display: flex;
    align-items: center;

    background-color: #333733;
    border-radius: 5px;
    margin-top: 10px;
  }

  .transitionView .leftSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-right: 3px;
    background-color: #2b2b2b;
  }

  .transitionView .rightSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-left: 10px;
  }

  .transitionView .transitionObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 70px;
    height: 70px;
  }
  .transitionView .transitionObject:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .transitionView .transitionObject.current {
    background-color: #444;
  }
  .transitionView .transitionObject.current:hover {
    border: 1px solid transparent;
  }

  .transitionView .placeholder {
    width: 75px;
    height: 70px;
  }

  .transitionView .plus {
    z-index: 1;
    font-size: 16pt;
    margin: 0 2px;
  }

  .transitionView .arrow {
    z-index: 0;
    height: 0;
    width: 0;
    background-color: #333733;
    border-top: 50px solid transparent;
    border-left: 25px solid #2b2b2b;
    border-bottom: 50px solid transparent;
    margin: -10px;
    margin-left: 0;
    margin-right: 0;
  }

  .transitionView .gap {
    width: 15px;
  }
</style>
