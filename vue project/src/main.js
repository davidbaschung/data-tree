import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import * as Utils from './utils.js'
import json from './persons10.json'

Vue.config.productionTip = false
Vue.use(Utils);
Vue.use(Vuex);
// Utils.default.fetchPersons(10).then(
//   (resolve)=> {console.log("fetchPersons",resolve)}
//   );
//TODO computes cities list / property list

// let p = Utils.default.fetchPersons(10)
// console.log("p",p);

let store = new Vuex.Store({
  state: {
    someNumber: 3,
    // persons: Utils.default.fetchPersons(10).then(
    //   (resolve)=> {return resolve}
    // ),

    // persons: Utils.default.fetchPersons;
    // persons: [],
    persons: json.results,
    cities: ['Bienne','Berne','Madrid'],
    test: [
      {
        a:"a1",
        b:"b1"
      },
      {
        a:"a2",
        b:"b2"
      }
    ]
  },
  getters: {
    citiesSentence(state) {
      return "The people live in the cities of " + state.cities.join(' ');
    },
    printPersons() {
      // console.log(this.state.persons);
      // return store.state.persons;
      // TODO question async variables storage
      // return "printPersons";
      // return Utils.default.fetchPersons(10);
      return store.state.persons;
    },
    testGetter() {
      return "testGetter";
    },
    name() {
      // var name = store.state.persons[store.state.currentlyFilteredPersonIndex].name;
      return "name getter"
    }
  },
  mutations: {
    // TODO question good or not
    // TODO question TS
    setCurrentlyFilteredPersonIndex(index) {
      console.log(index);
      store.state.currentlyFilteredPersonIndex;
    },
    updatePersons(persons) {
      store.state.persons = persons;
    }
  },
  actions:{}
});

let app = new Vue({
  el:'#app',
  store,
  render: h => h(App, {props: {name:'test'  /* :this.fetchPersons(10) */}}),
  created() {
    // var x = 

    // Utils.default.fetchPersons(10, store.mutations.updatePersons);


    // store.mutations.updatePersons(
    //   Utils.default.fetchPersons(10, store.mutations.updatePersons)
    // )
  },
});
app.$mount('#app');

