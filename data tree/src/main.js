import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import json from './persons10.json'

Vue.config.productionTip = false
Vue.use(Vuex);
// Utils.default.fetchPersons(10).then(
//   (resolve)=> {console.log("fetchPersons",resolve)}
//   );

// let p = Utils.default.fetchPersons(10)

let store = new Vuex.Store({
  state: {
    someNumber: 3,
    // persons: Utils.default.fetchPersons(10).then(
    //   (resolve)=> {return resolve}
    // ),
    persons: [],
    countries: Set,
  },
  getters: {
    citiesSentence() {
      // ( TODO ) reduce Set
      // return "The people live in the cities of " + store.state.cities.join(' ');
    },
    printPersons() {
      return store.state.persons;
    },
    testGetter() {
      return "testGetter";
    },
  },
  mutations: {
    updatePersons(persons) { // TODO keep?
      store.state.persons = persons;
    }
  },
  actions:{}
});

let app = new Vue({
  el:'#app',
  store,
  render: h => h(App, {props: {name:'test'  /* :this.fetchPersons(10) */}}),
});
app.$mount('#app');

