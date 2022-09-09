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
    persons: [],
    // persons: [],
    // persons: json.results,
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
    citiesSentence() {
      return "The people live in the cities of " + store.state.cities.join(' ');
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
  beforeCreate() {
    Utils.default.fetchPersons(10).then((p)=>{store.state.persons=p});
  },
});
app.$mount('#app');

