<template>
  <div id="app">
   <!-- :persons="persons"> -->
    <selector-section></selector-section>
    <grid-section :importedNumber="$store.state.someNumber"></grid-section>
    <!-- TODO object with filter settings as prop -->
  </div>
</template>

<script>
  // import Vue from 'vue';
  import SelectorSection from '@/components/SelectorSection.vue'
  import GridSection from './components/GridSection.vue';

  export default {
    name: 'App',
    components: {
      'selector-section' : SelectorSection,
      'grid-section' : GridSection
    },
    data() {
      return {

      }
    }
  }
</script>

<style>
  * {
    margin:0px;
  }
</style>
