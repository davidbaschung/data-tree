<template>
  <div id="app">
   <!-- :persons="persons"> -->
    <SelectorSection></SelectorSection>
    <GridSection :importedNumber="$store.state.someNumber"></GridSection>
  </div>
</template>

<script>
  // import Vue from 'vue';
  import SelectorSection from '@/components/SelectorSection.vue'
  import GridSection from './components/GridSection.vue';

  export default {
    name: 'App',
    components: {
      SelectorSection,
      GridSection
    },
  }
</script>

<style>
  * {
    margin:0px;
  }
</style>
