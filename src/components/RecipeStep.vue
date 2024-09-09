<template>
  <div class="stepWrapper" v-if="showStep">
    <div class="step">
      <div class="stepNumber">
        {{ number }}
      </div>
      <div class="stepTransitionsWrapper">
        <div class="stepTransitions">
          <RecipeTransition
            v-for="transition in unexpandableTransitions"
            :key="transition.id"
            :transition="transition"
            :highlight="highlightTransition(transition)"
            :rightClickObject="rightClickObject"
          />
          <RecipeTransition
            v-for="transition in expandableTransitions"
            :key="transition.id"
            :transition="transition"
            :rightClickObject="rightClickObject"
            :expanded="transition === expandedTransition"
            :highlight="highlightTransition(transition)"
            @expand="expand"
          />
        </div>
      </div>
    </div>
    <div class="subSteps" v-if="expandedTransition">
      <RecipeStep
        v-for="(transitions, index) in expandedTransition.subSteps"
        :key="index"
        :transitions="transitions"
        :number="numberToLetter(index)"
        :rightClickObject="rightClickObject"
        :filteredObject="filteredObject"
        :highlightObjects="highlightObjects"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import RecipeTransition from './RecipeTransition';
import RecipeStep from './RecipeStep';

// Props
const props = defineProps({
  transitions: Array,
  number: [String, Number],
  rightClickObject: Function,
  filteredObject: Object,
  highlightObjects: Array,
});

// State
const manuallyExpandedTransition = ref(null);

// Computed properties
const showStep = computed(() => filteredTransitions.value.length > 0);

const filteredTransitions = computed(() => {
  if (props.filteredObject) {
    return transitionsWithObject(props.transitions, props.filteredObject);
  }
  return props.transitions;
});

const unexpandableTransitions = computed(() => filteredTransitions.value.filter(t => !t.subSteps));

const expandableTransitions = computed(() => filteredTransitions.value.filter(t => t.subSteps));

const expandedTransition = computed(() => manuallyExpandedTransition.value || (props.filteredObject && expandableTransitions.value[0]));

// Methods
function numberToLetter(num) {
  return String.fromCharCode(97 + num);
}

function expand(transition) {
  if (expandedTransition.value === transition) {
    manuallyExpandedTransition.value = null;
  } else {
    manuallyExpandedTransition.value = transition;
  }
}

function transitionsWithObject(transitions, object) {
  return transitions.filter(t => transitionIncludesObject(t, object));
}

function transitionIncludesObject(transition, object) {
  if (transition.subSteps) {
    for (const subTransition of transition.subSteps) {
      if (transitionsWithObject(subTransition, object).length > 0) {
        return true;
      }
    }
    return false;
  }
  return transition.actorID === object.id || transition.targetID === object.id || transition.id === object.id;
}

function highlightTransition(transition) {
  if (!props.highlightObjects) return false;
  return props.highlightObjects.some(object => object.id === transition.id);
}
</script>

<style scoped>
  .stepWrapper {
    background-color: #3c3c3c;
    border-radius: 5px;
    margin: 10px;
    padding-top: 10px;
  }

  .subSteps {
    padding-top: 10px;
    border-top: dashed 1px #666;
  }

  .subSteps .stepWrapper {
    margin: 0;
    padding: 0;
    border-radius: 0;
    background-color: inherit;
  }

  .step {
    display: flex;
  }

  .step .stepNumber {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-left: 12px;
    font-size: 40px;
    color: #ccc;
    border-radius: 5px;
    width: 45px;
  }

  .subSteps .stepNumber {
    margin-top: 25px;
    font-size: 30px;
  }

  .stepTransitions {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
  }

  @media only screen and (max-width: 768px) {
    .step {
      flex-direction: column;
      align-items: center;
      padding-top: 5px;
    }

    .step .stepNumber::before {
      content: "Step";
      padding-right: 5px;
    }

    .step .stepNumber {
      padding: 0;
      margin: 0;
      margin-bottom: 5px;
      font-size: 16px;
      font-weight: bold;
      color: inherit;
    }

    .stepTransitions {
      align-items: center;
      justify-content: center;
    }
  }
</style>
