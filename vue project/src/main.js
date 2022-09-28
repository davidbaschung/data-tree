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
    nativesCount: 0
  },
  getters: {
    citiesSentence() {
      // ( TODO ) reduce Set
      // return "The people live in the cities of " + store.state.cities.join(' ');
    },
    persons() {
      return store.state.persons;
    },
    countries() {
      return store.state.countries;
    }
  },
  mutations: {
    UPDATE_PERSONS(state, persons) {
      state.persons = persons;
    },
    UPDATE_COUNTRIES_SET_FILTER(state, countries) {
      state.countries = countries;
    },
    UPDATE_NATIVES_COUNT(state, count) {
      state.nativesCount = count;
    }
  },
  actions:{
    UPDATE_COUNTRIES_SET_FILTER({commit, state}, countries) {
      this.commit("UPDATE_COUNTRIES_SET_FILTER", countries);
      let nativesCount = 0;
      state.persons.forEach((p) => {
        p.location.country == "Switzerland" ? ++nativesCount : void(0);
      });
      this.commit("UPDATE_NATIVES_COUNT", nativesCount);
    }
  }
});

let app = new Vue({
  el:'#app',
  store,
  render: h => h(App, {props: {name:'test'  /* :this.fetchPersons(10) */}}),
});
app.$mount('#app');

