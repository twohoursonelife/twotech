<style>
  .v-select {
    position: relative;
    font-family: sans-serif;
  }

  .v-select,
  .v-select * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  /* Rtl support */
  .v-select.rtl .open-indicator {
    left: 10px;
    right: auto;
  }
  .v-select.rtl .selected-tag {
    float: right;
    margin-right: 3px;
    margin-left: 1px;
  }
  .v-select.rtl .dropdown-menu {
    text-align: right;
  }
  .v-select.rtl .dropdown-toggle .clear {
    left: 30px;
    right: auto;
  }
  /* Open Indicator */
  .v-select .open-indicator {
    position: absolute;
    bottom: 6px;
    right: 10px;
    display: inline-block;
    cursor: pointer;
    pointer-events: all;
    transition: all 150ms cubic-bezier(1.000, -0.115, 0.975, 0.855);
    transition-timing-function: cubic-bezier(1.000, -0.115, 0.975, 0.855);
    opacity: 1;
    height: 20px; width: 10px;
  }
  .v-select .open-indicator:before {
    border-color: rgba(60, 60, 60, .5);
    border-style: solid;
    border-width: 3px 3px 0 0;
    content: '';
    display: inline-block;
    height: 10px;
    width: 10px;
    vertical-align: top;
    transform: rotate(133deg);
    transition: all 150ms cubic-bezier(1.000, -0.115, 0.975, 0.855);
    transition-timing-function: cubic-bezier(1.000, -0.115, 0.975, 0.855);
    box-sizing: inherit;
  }
  /* Open Indicator States */
  .v-select.open .open-indicator:before {
    transform: rotate(315deg);
  }
  .v-select.loading .open-indicator {
    opacity: 0;
  }
  .v-select.open .open-indicator {
    bottom: 1px;
  }
  /* Dropdown Toggle */
  .v-select .dropdown-toggle {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: block;
    padding: 0;
    background: none;
    border: 1px solid rgba(60, 60, 60, .26);
    border-radius: 4px;
    white-space: normal;
  }
  .v-select .dropdown-toggle:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
  }

  /* Search Button */
  .v-select .dropdown-toggle .search-icon, .v-select .dropdown-toggle .spin {
    position: absolute;
    top: 9px;
    left: 10px;
    cursor: pointer;
  }

  /* Clear Button */
  .v-select .dropdown-toggle .clear {
    position: absolute;
    bottom: 9px;
    right: 30px;
    font-size: 23px;
    font-weight: 700;
    line-height: 1;
    color: rgba(60, 60, 60, .5);
    padding: 0;
    border: 0;
    background-color: transparent;
    cursor: pointer;
  }

  /* Dropdown Toggle States */
  .v-select.searchable .dropdown-toggle {
    cursor: text;
  }
  .v-select.unsearchable .dropdown-toggle {
    cursor: pointer;
  }
  .v-select.open .dropdown-toggle {
    border-bottom-color: transparent;
    border-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  /* Dropdown Menu */
  .v-select .dropdown-menu {
    display:block;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 160px;
    padding: 5px 0;
    margin: 0;
    width: 100%;
    overflow-y: scroll;
    border: 1px solid rgba(0, 0, 0, .26);
    box-shadow: 0px 3px 6px 0px rgba(0,0,0,.15);
    border-top: none;
    border-radius: 0 0 4px 4px;
    text-align: left;
    list-style: none;
    background: #fff;
  }
  .v-select .no-options {
    text-align: center;
  }
  /* Selected Tags */
  .v-select .selected-tag {
    color: #333;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    height: 26px;
    margin: 4px 1px 0px 32px;
    padding: 1px 0.25em;
    float: left;
    line-height: 24px;
  }
  .v-select.single .selected-tag {
    background-color: transparent;
    border-color: transparent;
  }
  .v-select.single.open .selected-tag {
    position: absolute;
    opacity: .5;
  }
  .v-select.single.open.searching .selected-tag,
  .v-select.single.loading .selected-tag {
    display: none;
  }
  .v-select .selected-tag .close {
    float: none;
    margin-right: 0;
    font-size: 20px;
    appearance: none;
    padding: 0;
    cursor: pointer;
    background: 0 0;
    border: 0;
    font-weight: 700;
    line-height: 1;
    color: #000;
    text-shadow: 0 1px 0 #fff;
    filter: alpha(opacity=20);
    opacity: .2;
  }
  .v-select.single.searching:not(.open):not(.loading) input[type="search"] {
    opacity: .2;
  }
  /* Search Input */
  .v-select input[type="search"]::-webkit-search-decoration,
  .v-select input[type="search"]::-webkit-search-cancel-button,
  .v-select input[type="search"]::-webkit-search-results-button,
  .v-select input[type="search"]::-webkit-search-results-decoration {
    display: none;
  }
  .v-select input[type="search"]::-ms-clear {
    display: none;
  }
  .v-select input[type="search"],
  .v-select input[type="search"]:focus {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    line-height: 1.42857143;
    font-size:1em;
    height: 34px;
    display: inline-block;
    border: none;
    outline: none;
    margin: 0;
    padding: 0 .5em;
    padding-left: 35px;
    width: 10em;
    max-width: 100%;
    background: none;
    position: relative;
    box-shadow: none;
  }
  .v-select.unsearchable input[type="search"] {
    opacity: 0;
  }
  .v-select.unsearchable input[type="search"]:hover {
    cursor: pointer;
  }
    /* List Items */
  .v-select li {
    line-height: 1.42857143; /* Normalize line height */
  }
  .v-select li > a {
    display: block;
    padding: 3px 20px;
    clear: both;
    color: #333; /* Overrides most CSS frameworks */
    white-space: nowrap;
  }
  .v-select li:hover {
    cursor: pointer;
  }
  .v-select .dropdown-menu .active > a {
    color: #333;
    background: rgba(50, 50, 50, .1);
  }
  .v-select .dropdown-menu > .highlight > a {
    /*
     * required to override bootstrap 3's
     * .dropdown-menu > li > a:hover {} styles
     */
    background: #5897fb;
    color: #fff;
  }
  .v-select .highlight:not(:last-child) {
    margin-bottom: 0; /* Fixes Bulma Margin */
  }
  /* Loading Spinner */
  .v-select .spinner {
    opacity: 0;
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 5px;
    text-indent: -9999em;
    overflow: hidden;
    border-top: .9em solid rgba(100, 100, 100, .1);
    border-right: .9em solid rgba(100, 100, 100, .1);
    border-bottom: .9em solid rgba(100, 100, 100, .1);
    border-left: .9em solid rgba(60, 60, 60, .45);
    transform: translateZ(0);
    animation: vSelectSpinner 1.1s infinite linear;
    transition: opacity .1s;
  }
  .v-select .spinner,
  .v-select .spinner:after {
    border-radius: 50%;
    width: 5em;
    height: 5em;
  }

  /* Disabled state */
  .v-select.disabled .dropdown-toggle,
  .v-select.disabled .dropdown-toggle .clear,
  .v-select.disabled .dropdown-toggle input,
  .v-select.disabled .selected-tag .close,
  .v-select.disabled .open-indicator {
    cursor: not-allowed;
    background-color: rgb(248, 248, 248);
  }

  /* Loading Spinner States */
  .v-select.loading .spinner {
    opacity: 1;
  }
  /* KeyFrames */
  @-webkit-keyframes vSelectSpinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes vSelectSpinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  /* Dropdown Default Transition */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .15s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  /* Override */

  /* Avoid mobile wrap bug */
  .v-select .selected-tag {
    position: absolute;
  }
  .spin {
     transform: rotate(0);
     animation: spin 1.1s infinite linear;
   }
   @keyframes spin {
      0% {
         transform: rotate(0deg);
      }
      100% {
         transform: rotate(360deg);
      }
   }
</style>

<template>
   <div :dir="dir" class="dropdown v-select" :class="dropdownClasses">
      <div ref="toggle" @mousedown.prevent="toggleDropdown" :class="['dropdown-toggle', 'clearfix']">
         <img v-if="!processing" src="../assets/search.svg" width="19" height="20" class="search-icon"/>
         <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-loader spin" width="19" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 6l0 -3" />
            <path d="M16.25 7.75l2.15 -2.15" />
            <path d="M18 12l3 0" />
            <path d="M16.25 16.25l2.15 2.15" />
            <path d="M12 18l0 3" />
            <path d="M7.75 16.25l-2.15 2.15" />
            <path d="M6 12l-3 0" />
            <path d="M7.75 7.75l-2.15 -2.15" />
         </svg>
      <span class="selected-tag" v-for="option in valueAsArray" v-bind:key="option.index">
        <slot name="selected-option" v-bind="option">
          {{ getOptionLabel(option) }}
        </slot>
        <button v-if="multiple" :disabled="disabled" @click="deselect(option)" type="button" class="close" aria-label="Remove option">
          <span aria-hidden="true">&times;</span>
        </button>
      </span>
      <!--
        Note: v-model does not work properly on mobile, we update search manually
        see: https://github.com/vuejs/vue/issues/9299
      -->
      <input
              ref="search"
              :value="search"
              @input="event => (search = event.target.value)"
              @keydown.delete="maybeDeleteValue"
              @keyup.esc="onEscape"
              @keydown.up.prevent="typeAheadUp"
              @keydown.down.prevent="typeAheadDown"
              @keydown.enter.prevent="typeAheadSelect"
              @blur="onSearchBlur"
              @focus="onSearchFocus"
              type="search"
              class="form-control"
              autocomplete="false"
              :disabled="disabled"
              :placeholder="searchPlaceholder"
              :tabindex="tabindex"
              :readonly="!searchable"
              :style="{ width: isValueEmpty ? '100%' : 'auto' }"
              :id="inputId"
              aria-label="Search for option"
      >

      <button
        v-show="showClearButton"
        :disabled="disabled"
        @click="clearSelection"
        type="button"
        class="clear"
        title="Clear selection"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <i v-if="!noDrop" ref="openIndicator" role="presentation" class="open-indicator"></i>

      <slot name="spinner">
        <div class="spinner" v-show="mutableLoading">Loading...</div>
      </slot>
    </div>

    <transition :name="transition">
      <ul ref="dropdownMenu" v-if="dropdownOpen && search.length > 0" class="dropdown-menu" :style="{ 'max-height': maxHeight }">
        <li v-if="!processing && maybeInaccurate" class="no-options">
          <slot name="no-options" style="display: inline-block">
            <p>Showing inaccurate results, check spelling.
              <span style="color: #5897fb;" title="Unfortunately, our conventional string search did not yield any matching results. As a result, we are displaying results generated by a predictive engine. Please be aware that these results may not be entirely accurate.">
                <svg style="margin-bottom: -4px" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </span>
            </p>
          </slot>
        </li>
        <template v-if="!processing">
          <li v-for="(option, index) in displayedOptions" :key="index" :class="{ active: isOptionSelected(option), highlight: index === typeAheadPointer }" @mouseover="typeAheadPointer = index">
            <a @mousedown.prevent="select(option)">
              <slot name="option" v-bind="option">
                {{ getOptionLabel(option) }}
              </slot>
            </a>
          </li>
        </template>
        <li v-if="processing" class="no-options">
          <slot name="no-options">Searching...</slot>
        </li>
        <li v-else-if="displayedOptions.length === 0" class="no-options">
          <slot name="no-options">Sorry, no matching options.</slot>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script type="text/babel">
  import ajax from '../mixins/ajax'

  import _ from 'lodash'

  export default {
    mixins: [ajax],

    props: {
      /**
       * Contains the currently selected value. Very similar to a
       * `value` attribute on an <input>. You can listen for changes
       * using 'change' event using v-on
       * @type {Object||String||null}
       */
      value: {
        default: null
      },

      /**
       * An array of strings or objects to be used as dropdown choices.
       * If you are using an array of objects, vue-select will look for
       * a `label` key (ex. [{label: 'This is Foo', value: 'foo'}]). A
       * custom label key can be set with the `label` prop.
       * @type {Array}
       */
      options: {
        type: Array,
        default() {
          return []
        },
      },

      /**
       * Disable the entire component.
       * @type {Boolean}
       */
      disabled: {
        type: Boolean,
        default: false
      },

      /**
       * Sets the max-height property on the dropdown list.
       * @deprecated
       * @type {String}
       */
      maxHeight: {
        type: String,
        default: '400px'
      },

      /**
       * Enable/disable filtering the options.
       * @type {Boolean}
       */
      searchable: {
        type: Boolean,
        default: true
      },

      /**
       * Equivalent to the `multiple` attribute on a `<select>` input.
       * @type {Boolean}
       */
      multiple: {
        type: Boolean,
        default: false
      },

      /**
       * Equivalent to the `placeholder` attribute on an `<input>`.
       * @type {String}
       */
      placeholder: {
        type: String,
        default: ''
      },

      /**
       * Sets a Vue transition property on the `.dropdown-menu`. vue-select
       * does not include CSS for transitions, you'll need to add them yourself.
       * @type {String}
       */
      transition: {
        type: String,
        default: 'fade'
      },

      /**
       * Enables/disables clearing the search text when an option is selected.
       * @type {Boolean}
       */
      clearSearchOnSelect: {
        type: Boolean,
        default: true
      },

      /**
       * Close a dropdown when an option is chosen. Set to false to keep the dropdown
       * open (useful when combined with multi-select, for example)
       * @type {Boolean}
       */
      closeOnSelect: {
        type: Boolean,
        default: true
      },

      /**
       * Tells vue-select what key to use when generating option
       * labels when each `option` is an object.
       * @type {String}
       */
      label: {
        type: String,
        default: 'label'
      },

      /**
       * Callback to generate the label text. If {option}
       * is an object, returns option[this.label] by default.
       * @type {Function}
       * @param  {Object || String} option
       * @return {String}
       */
      getOptionLabel: {
        type: Function,
        default(option) {
          if (typeof option === 'object') {
            if (this.label && option[this.label]) {
              return option[this.label]
            }
          }
          return option;
        }
      },

      /**
       * An optional callback function that is called each time the selected
       * value(s) change. When integrating with Vuex, use this callback to trigger
       * an action, rather than using :value.sync to retreive the selected value.
       * @type {Function}
       * @param {Object || String} val
       */
      onChange: {
        type: Function,
        default: function (val) {
          this.$emit('input', val)
        }
      },

      /**
       * Enable/disable creating options from searchInput.
       * @type {Boolean}
       */
      taggable: {
        type: Boolean,
        default: false
      },

      /**
       * Set the tabindex for the input field.
       * @type {Number}
       */
      tabindex: {
        type: Number,
        default: null
      },

      /**
       * When true, newly created tags will be added to
       * the options list.
       * @type {Boolean}
       */
      pushTags: {
        type: Boolean,
        default: false
      },

      /**
       * When true, existing options will be filtered
       * by the search text. Should not be used in conjunction
       * with taggable.
       * @type {Boolean}
       */
      filterable: {
        type: Boolean,
        default: true
      },

      /**
       * User defined function for adding Options
       * @type {Function}
       */
      createOption: {
        type: Function,
        default(newOption) {
          if (typeof this.mutableOptions[0] === 'object') {
            newOption = {[this.label]: newOption}
          }
          this.$emit('option:created', newOption)
          return newOption
        }
      },

      /**
       * When false, updating the options will not reset the select value
       * @type {Boolean}
       */
      resetOnOptionsChange: {
        type: Boolean,
        default: false
      },

      /**
       * Disable the dropdown entirely.
       * @type {Boolean}
       */
      noDrop: {
        type: Boolean,
        default: false
      },

      /**
       * Sets the id of the input element.
       * @type {String}
       * @default {null}
       */
      inputId: {
        type: String
      },

      /**
       * Sets RTL support. Accepts 'ltr', 'rtl', 'auto'.
       * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
       * @type {String}
       * @default 'auto'
       */
      dir: {
        type: String,
        default: 'auto'
      },
      /**
       * if traditional substring search found no results then try to show best similar results.
       * Should not be used in conjunction with taggable. and must be used with filterable.
       * It is suggested to make the label values lowerCase when using this option.
       * @author Eboubaker Bekkouche <eboubakkar@gmail.com>
       */
      useGuessingEngine: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        search: '',
        open: false,
        mutableValue: null,
        mutableOptions: [],
        worker: null,
        worker_promises: [], // keep track of multiple pending search requests.
        displayedOptions: [],
        processing: false,
        maybeInaccurate: false, // if results are from guessing
        typeAheadPointer: -1,
      }
    },

    watch: {
      displayedOptions() {
        this.typeAheadPointer = 0;
      },
      typeAheadPointer() {
        this.maybeAdjustScroll(); // Added from pointerScroll.js
      },

      /**
       * When the value prop changes, update
			 * the internal mutableValue.
       * @param  {mixed} val
       * @return {void}
       */
      value(val) {
				this.mutableValue = val
      },

      /**
       * Maybe run the onChange callback.
       * @param  {string|object} val
       * @param  {string|object} old
       * @return {void}
       */
			mutableValue(val, old) {
        if (this.multiple) {
          this.onChange ? this.onChange(val) : null
        } else {
          this.onChange && val !== old ? this.onChange(val) : null
        }
      },

      /**
       * When options change, update
       * the internal mutableOptions.
       * @param  {array} val
       * @return {void}
       */
      options(val) {
        this.mutableOptions = val
      },

      /**
			 * Maybe reset the mutableValue
       * when mutableOptions change.
       * @return {[type]} [description]
       */
      mutableOptions() {
        if (!this.taggable && this.resetOnOptionsChange) {
					this.mutableValue = this.multiple ? [] : null
        }
      },

      /**
			 * Always reset the mutableValue when
       * the multiple prop changes.
       * @param  {Boolean} val
       * @return {void}
       */
      multiple(val) {
				this.mutableValue = val ? [] : null
      }
    },

    /**
     * Clone props into mutable values,
     * attach any event listeners.
     */
    created() {
			this.mutableValue = this.value
      this.mutableOptions = this.options.slice(0)
			this.mutableLoading = this.loading
      if (this.useGuessingEngine && typeof Worker !== "undefined") {
         this.prepareEngine();
      } else if (this.useGuessingEngine) {
         console.error("can't use guessing engine, web worker not supported on this browser.")
      }

      this.$watch('mutableOptions', this.doSearch)
      this.$watch('taggable', this.doSearch)
      this.$watch('filterable', this.doSearch)
      // debounce will only trigger the search after user stopped typing for 250ms
      this.$watch('search', _.debounce(this.doSearch, 250))
      this.$on('option:created', this.maybePushTag)
    },
    methods: {
      async doSearch() {
         this.processing = true;
         try {
           if (!this.filterable && !this.taggable) {
             return this.mutableOptions.slice()
           }
           let options = this.mutableOptions.filter((option) => {
             if (typeof option === 'object' && option.hasOwnProperty(this.label)) {
               return option[this.label].toLowerCase().indexOf(this.search.toLowerCase()) > -1
             } else if (typeof option === 'object' && !option.hasOwnProperty(this.label)) {
               return console.warn(`[vue-select warn]: Label key "option.${this.label}" does not exist in options object.\nhttp://sagalbot.github.io/vue-select/#ex-labels`)
             }
             return option.toLowerCase().indexOf(this.search.toLowerCase()) > -1
           })
           if (this.taggable && this.search.length && !this.optionExists(this.search)) {
             options.unshift(this.search)
           }
           if (options.length === 0 && this.useGuessingEngine) {
             const query = this.search.toLowerCase()
             options = await new Promise(resolve => {
               this.worker_promises.push(resolve);
               this.worker.postMessage({
                 signal: 'search',
                 data: query,
                 meta: {limit: 30, promise_index: this.worker_promises.length - 1}
               })
             })
             this.maybeInaccurate = true;
           } else {
             this.maybeInaccurate = false;
           }
           this.displayedOptions = _.take(options, 30);
         } finally {
           this.processing = false;
         }
      },
      prepareEngine() {
        this.worker = new Worker(new URL("../search.worker.js", import.meta.url))
        this.worker.onmessageerror = this.worker.onerror = function () {
          console.error("web worker unexpected error!");
        }
        this.worker.onmessage = ({data: {signal, data, meta}}) => {
          meta = meta || {};
          if (signal === 'log') {
            console.log("WebWorkerLog: " + data)
          } else if (signal === 'search_result') {
            const result = data.map(index => this.mutableOptions[index]);
            this.worker_promises[meta.promise_index](result)
          } else {
            console.error("unknown signal from web worker: " + signal);
          }
        }
        this.$watch('mutableOptions', () => {
          this.worker.postMessage({signal: 'set_search_list', data: this.mutableOptions.map(opt => opt[this.label])})
        }, {immediate: true})
      },
      /**
       * Select a given option.
       * @param  {Object|String} option
       * @return {void}
       */
      select(option) {
        if (this.isOptionSelected(option)) {
          this.deselect(option)
        } else {
          if (this.taggable && !this.optionExists(option)) {
            option = this.createOption(option)
          }

          if (this.multiple && !this.mutableValue) {
            this.mutableValue = [option]
          } else if (this.multiple) {
            this.mutableValue.push(option)
          } else {
            this.mutableValue = option
          }
        }

        this.onAfterSelect(option)
      },

      /**
       * De-select a given option.
       * @param  {Object|String} option
       * @return {void}
       */
      deselect(option) {
        if (this.multiple) {
          let ref = -1
          this.mutableValue.forEach((val) => {
            if (val === option || typeof val === 'object' && val[this.label] === option[this.label]) {
              ref = val
            }
          })
          var index = this.mutableValue.indexOf(ref)
          this.mutableValue.splice(index, 1)
        } else {
          this.mutableValue = null
        }
      },

      /**
       * Clears the currently selected value(s)
       * @return {void}
       */
       clearSelection() {
         this.mutableValue = this.multiple ? [] : null
       },

      /**
       * Called from this.select after each selection.
       * @param  {Object|String} option
       * @return {void}
       */
      onAfterSelect(option) {
        if (this.closeOnSelect) {
          this.open = !this.open
          this.$refs.search.blur()
        }

        if (this.clearSearchOnSelect) {
          this.search = ''
        }
      },

      /**
       * Toggle the visibility of the dropdown menu.
       * @param  {Event} e
       * @return {void}
       */
      toggleDropdown(e) {
        if (e.target === this.$refs.openIndicator || e.target === this.$refs.search || e.target === this.$refs.toggle || e.target === this.$el) {
          if (this.open) {
            this.$refs.search.blur() // dropdown will close on blur
          } else {
            if (!this.disabled) {
              this.open = true
              this.search = "";
              this.$refs.search.focus()
            }
          }
        }
      },

      /**
       * Check if the given option is currently selected.
       * @param  {Object|String}  option
       * @return {Boolean}        True when selected | False otherwise
       */
      isOptionSelected(option) {
        if (this.multiple && this.mutableValue) {
          let selected = false
          this.mutableValue.forEach(opt => {
            if (typeof opt === 'object' && opt[this.label] === option[this.label]) {
              selected = true
            } else if (typeof opt === 'object' && opt[this.label] === option) {
              selected = true
            }
            else if (opt === option) {
              selected = true
            }
          })
          return selected
        }

        return this.mutableValue === option
      },

      /**
       * If there is any text in the search input, remove it.
       * Otherwise, blur the search input to close the dropdown.
       * @return {void}
       */
      onEscape() {
        if (!this.search.length) {
          this.$refs.search.blur()
        } else {
          this.search = ''
        }
      },

      /**
       * Close the dropdown on blur.
       * @emits  {search:blur}
       * @return {void}
       */
      onSearchBlur() {
        if (this.clearSearchOnBlur) {
          this.search = ''
        }
        this.open = false
        this.$emit('search:blur')
      },

      /**
       * Open the dropdown on focus.
       * @emits  {search:focus}
       * @return {void}
       */
      onSearchFocus() {
        this.open = true
        this.$emit('search:focus')
      },

      /**
       * Delete the value on Delete keypress when there is no
       * text in the search input, & there's tags to delete
       * @return {this.value}
       */
      maybeDeleteValue() {
        if (!this.$refs.search.value.length && this.mutableValue) {
          return this.multiple ? this.mutableValue.pop() : this.mutableValue = null
        }
      },

      /**
       * Determine if an option exists
       * within this.mutableOptions array.
       *
       * @param  {Object || String} option
       * @return {boolean}
       */
      optionExists(option) {
        let exists = false

        this.mutableOptions.forEach(opt => {
          if (typeof opt === 'object' && opt[this.label] === option) {
            exists = true
          } else if (opt === option) {
            exists = true
          }
        })

        return exists
      },

      /**
       * If push-tags is true, push the
       * given option to mutableOptions.
       *
       * @param  {Object || String} option
       * @return {void}
       */
      maybePushTag(option) {
        if (this.pushTags) {
          this.mutableOptions.push(option)
        }
      },
      
      /**
       * Move the typeAheadPointer visually up the list by
       * subtracting the current index by one.
       * @return {void}
       */
      typeAheadUp() {
        if (this.typeAheadPointer > 0) {
          this.typeAheadPointer--;
          if (this.maybeAdjustScroll) {
            this.maybeAdjustScroll();
          }
        }
      },

      /**
       * Move the typeAheadPointer visually down the list by
       * adding the current index by one.
       * @return {void}
       */
      typeAheadDown() {
        if (this.typeAheadPointer < this.displayedOptions.length - 1) {
          this.typeAheadPointer++;
          if (this.maybeAdjustScroll) {
            this.maybeAdjustScroll();
          }
        }
      },

      /**
       * Select the option at the current typeAheadPointer position.
       * Optionally clear the search input on selection.
       * @return {void}
       */
      typeAheadSelect() {
        if (this.displayedOptions[this.typeAheadPointer]) {
          this.select(this.displayedOptions[this.typeAheadPointer]);
        } else if (this.taggable && this.search.length) {
          this.select(this.search);
        }

        if (this.clearSearchOnSelect) {
          this.search = "";
        }
      },

      /**
       * Adjust the scroll position of the dropdown list
       * if the current pointer is outside of the
       * overflow bounds.
       * @returns {*}
       */
      maybeAdjustScroll() {
        let pixelsToPointerTop = this.pixelsToPointerTop();
        let pixelsToPointerBottom = this.pixelsToPointerBottom();

        if (pixelsToPointerTop <= this.viewport().top) {
          return this.scrollTo(pixelsToPointerTop);
        } else if (pixelsToPointerBottom >= this.viewport().bottom) {
          return this.scrollTo(this.viewport().top + this.pointerHeight());
        }
      },

      /**
       * The distance in pixels from the top of the dropdown
       * list to the top of the current pointer element.
       * @returns {number}
       */
      pixelsToPointerTop() {
        let pixelsToPointerTop = 0;
        if (this.$refs.dropdownMenu) {
          for (let i = 0; i < this.typeAheadPointer; i++) {
            pixelsToPointerTop += this.$refs.dropdownMenu.children[i].offsetHeight;
          }
        }
        return pixelsToPointerTop;
      },

      /**
       * The distance in pixels from the top of the dropdown
       * list to the bottom of the current pointer element.
       * @returns {*}
       */
      pixelsToPointerBottom() {
        return this.pixelsToPointerTop() + this.pointerHeight();
      },

      /**
       * The offsetHeight of the current pointer element.
       * @returns {number}
       */
      pointerHeight() {
        let element = this.$refs.dropdownMenu ? this.$refs.dropdownMenu.children[this.typeAheadPointer] : false;
        return element ? element.offsetHeight : 0;
      },

      /**
       * The currently viewable portion of the dropdownMenu.
       * @returns {{top: (string|*|number), bottom: *}}
       */
      viewport() {
        return {
          top: this.$refs.dropdownMenu ? this.$refs.dropdownMenu.scrollTop : 0,
          bottom: this.$refs.dropdownMenu
            ? this.$refs.dropdownMenu.offsetHeight + this.$refs.dropdownMenu.scrollTop
            : 0,
        };
      },

      /**
       * Scroll the dropdownMenu to a given position.
       * @param position
       * @returns {*}
       */
      scrollTo(position) {
        if (this.$refs.dropdownMenu) {
          this.$refs.dropdownMenu.scrollTop = position;
        }
      },
    },

    computed: {

      /**
       * Classes to be output on .dropdown
       * @return {Object}
       */
      dropdownClasses() {
        return {
          open: this.dropdownOpen,
          single: !this.multiple,
          searching: this.searching,
          searchable: this.searchable,
          unsearchable: !this.searchable,
          loading: this.mutableLoading,
          rtl: this.dir === 'rtl',
          disabled: this.disabled
        }
      },

      /**
       * If search text should clear on blur
       * @return {Boolean} True when single and clearSearchOnSelect
       */
      clearSearchOnBlur() {
        return this.clearSearchOnSelect && !this.multiple
      },

      /**
       * Return the current state of the
       * search input
       * @return {Boolean} True if non empty value
       */
      searching() {
        return !!this.search
      },

      /**
       * Return the current state of the
       * dropdown menu.
       * @return {Boolean} True if open
       */
      dropdownOpen() {
        return this.noDrop ? false : this.open && !this.mutableLoading
      },

      /**
       * Return the placeholder string if it's set
       * & there is no value selected.
       * @return {String} Placeholder text
       */
      searchPlaceholder() {
        if (this.isValueEmpty && this.placeholder) {
          return this.placeholder;
        }
      },

      /**
       * Check if there aren't any options selected.
       * @return {Boolean}
       */
      isValueEmpty() {
        if (this.mutableValue) {
          if (typeof this.mutableValue === 'object') {
            return !Object.keys(this.mutableValue).length
          }
          return !this.mutableValue.length
        }

        return true;
      },

      /**
       * Return the current value in array format.
       * @return {Array}
       */
      valueAsArray() {
        if (this.multiple) {
          return this.mutableValue
        } else if (this.mutableValue) {
          return [this.mutableValue]
        }

        return []
      },

      /**
       * Determines if the clear button should be displayed.
       * @return {Boolean}
       */
      showClearButton() {
        return !this.multiple && !this.open && this.mutableValue != null
      }
    },

  }
</script>
