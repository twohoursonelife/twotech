<template>
  <div class="lettersRecipe">
    <h2>Recipe for Letters</h2>
    <h3>To put on a Sign</h3>

    <div class="signSizes">
      <div class="signSize" :class="{ selected: small }" @click="selectSmall">Small Sign</div>
      <div class="signSize" :class="{ selected: !small }" @click="selectBig">Big Sign</div>
    </div>

    <textarea
      class="message"
      id="messageArea"
      @keyup="update"
      :rows="rows"
      :cols="cols + 1"
      :maxLength="maxLength"
      autofocus
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    ></textarea>

    <h3 v-if="loading">Loading...</h3>
    <div v-else-if="objects.length" class="steps">
      <RecipeIngredients :ingredients="ingredients" :rightClickObject="filterObject" />

      <div class="filterHeadline" v-if="filteredObject">
        <h4>Filter:</h4>
        <ObjectImage class="filteredObject" hover clickable :object="filteredObject" />
        <a href="#" @click.prevent="filterObject(null)">Clear Filter</a>
      </div>
      <div v-else-if="objects.length" class="steps">
        <RecipeStep
          v-for="(transitions, index) in steps"
          :key="index"
          :transitions="transitions"
          :number="index + 1"
          :rightClickObject="filterObject"
          :filteredObject="filteredObject"
          :highlightObjects="objects"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import GameObject from '../models/GameObject';
import RecipeIngredients from './RecipeIngredients';
import RecipeStep from './RecipeStep';
import ObjectImage from './ObjectImage';

// State
const small = ref(true);
const objects = ref([]);
const timer = ref(null);
const filteredObject = ref(null);

// Computed properties
const rows = computed(() => (small.value ? 2 : 3));
const cols = computed(() => (small.value ? 7 : 9));
const maxLength = computed(() => rows.value * cols.value + (rows.value - 1) * 2);

const loading = computed(() => timer.value || objects.value.filter(o => !o.data).length > 0);

const ingredients = computed(() => {
  const tools = ["34", "135", "235", "730"];
  let ingredientsList = [];
  for (let object of objects.value) {
    ingredientsList = ingredientsList.concat(object.data.recipe.ingredients);
  }
  return ingredientsList.filter((id, i) => !tools.includes(id) || ingredientsList.indexOf(id) === i);
});

const steps = computed(() => {
  let transitions = [];
  for (let object of objects.value) {
    const steps = object.data.recipe.steps;
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      for (let transition of steps[steps.length - stepIndex - 1]) {
        addTransition(transition, transitions, stepIndex);
      }
    }
  }
  let stepsList = [];
  for (let transition of transitions) {
    if (!stepsList[transition.stepIndex]) stepsList[transition.stepIndex] = [];
    stepsList[transition.stepIndex].push(transition);
  }
  return stepsList.reverse();
});

// Methods
function selectBig() {
  small.value = false;
  fixMessage();
  updateObjects();
}

function selectSmall() {
  small.value = true;
  fixMessage();
  updateObjects();
}

function update(event) {
  fixMessage();
  if (timer.value) clearTimeout(timer.value);
  timer.value = setTimeout(() => updateObjects(), 500);
}

function fixMessage() {
  const textarea = document.getElementById("messageArea");
  if (!textarea.value) return;
  const rowRegex = new RegExp(`.{1,${cols.value}}`, "g");
  const length = textarea.value.length;
  let selectionStart = textarea.selectionStart;
  let selectionEnd = textarea.selectionEnd;
  textarea.value = textarea.value.toUpperCase()
    .replace(/ /g, "-")
    .replace("–", "--")
    .replace("—", "--")
    .replace(/[^A-Z-]/g, "")
    .match(rowRegex)
    .join("\r\n")
    .substring(0, maxLength.value);
  if (textarea.value.length > length) {
    selectionStart += 2;
    selectionEnd += 2;
  }
  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionEnd;
}

async function updateObjects() {
  const textarea = document.getElementById("messageArea");
  objects.value = await Promise.all(
    textarea.value.split("").map(letterToObject)
  );
  timer.value = null;
}

function addTransition(transition, transitions, stepIndex) {
  let match = transitions.find(t => t.id === transition.id);
  if (match) {
    match.count += transition.count || 1;
    match.uses = "x" + match.count;
    if (match.stepIndex < stepIndex) {
      match.stepIndex = stepIndex;
    }
  } else {
    let clone = Object.assign({ count: 1, stepIndex: stepIndex }, transition);
    transitions.push(clone);
  }
}

async function letterToObject(letter) {
  if (letter === "-") return await GameObject.findAndLoadByName("Hyphen");
  return await GameObject.findAndLoadByName(`Letter ${letter}`);
}

function filterObject(object) {
  filteredObject.value = object;
  if (object) {
    setTimeout(() => {
      const scrollingElement = document.scrollingElement || document.body;
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }, 100);
  }
}

watch(filteredObject, () => {
  if (filteredObject.value) {
    setTimeout(() => {
      const scrollingElement = document.scrollingElement || document.body;
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }, 100);
  }
});

</script>

<style lang="scss" scoped>
  .lettersRecipe {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .lettersRecipe > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }

  .lettersRecipe h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }

  .lettersRecipe .signSizes {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
  }

  .lettersRecipe .signSize {
    background-color: #333;
    padding: 4px 10px;
    border: solid 1px #555;
    cursor: pointer;
  }
  .lettersRecipe .signSize.selected {
    background-color: #555;
    cursor: default;
  }
  .lettersRecipe .signSize:first-child {
    border-right: none;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .lettersRecipe .signSize:last-child {
    border-left: none;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .lettersRecipe .message {
    resize: none;
    display: block;
    margin: 10px auto;
    padding: 10px;
    background-color: #ccc;
    border-radius: 10px;
    font-family: FreeMono, Courier, monospace;
    font-size: 30px;
  }

  .lettersRecipe .steps {
    display: flex;
    flex-direction: column;
  }

  .filterHeadline {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;

    h4 {
      text-align: center;
      font-size: 16px;
      margin: 0;
    }

    .filteredObject {
      margin: 0 10px;
      display: flex;
      align-items: center;
      z-index: 1;
      position: relative;
      display: block;
      width: 50px;
      height: 50px;
      background-color: #444;
      border: solid 1px transparent;
      border-radius: 3px;
      &:hover {
        border-color: #aaa;
        background-color: #666;
      }
    }
  }

  .clearFilter {
    text-align: center;
  }
</style>
