import Vue from 'vue'
import Vuex from 'vuex'
import App from '../App.vue'
import * as Utils from '../utils.js'
import { fetchPersons } from "../api/";
Vue.config.productionTip = false
Vue.use(Utils);
Vue.use(Vuex);

/**
 * It is good practice to have the store in its own folder
 * For now I just used one file index.js as the store is really small
 * In a more complicated App this of course will grow. 
 * Then we usually move getters, mutations and actions in its own file
 * and structure the store by modules
 * The point is to make code more easy to navigate and have clear responsibilities
 * so that reasoning about the signal flow is more easy to track
 */
let store = new Vuex.Store({
  state: {
    someNumber: 3,
    persons: [],
    countries: [Set, Array], default: () => [], // allows to return the default type as an array
    nativesCount: 0
  },
  getters: {
    persons() {
      return store.state.persons;
    },
    getPersons: state => { // alternative
      return state.persons;
    },
    countries() {
      return store.state.countries;
    }
  },
    /**
     * INHO Vuex is a bit too verbose. This will get more straightforward when using Vue 3 and pinia.
     * Still the point of the mutations is to protect changes to the state.
     * Every change to the store should go through a mutation (even if it is verbose).
     * The reason for this is again: When things get more complicated we want to prevent 100s of components
     * to change the state directly. This can lead to some very hard to track bugs (who does change what an when)
     * If we have every change go through a mutation then these things are way easier to track and 
     * it makes maintaining code much easier and fun
     */
    // self-note : this means tracking (with logs) can be done for all to the accesses to the store at once.
  mutations: {
    UPDATE_ALL_PERSONS(state, persons) {
      state.persons = persons;
    },
    UPDATE_PERSON(state, person) {
      let statePerson = state.persons.find(p => p.login.uuid == person.login.uuid);
      statePerson = person;
    },
    RESET_ALL_PERSONS(state) {
      state.persons = [];
    },
    UPDATE_COUNTRIES_SET_FILTER(state, countries) {
      state.countries = countries;
    },
    UPDATE_NATIVES_COUNT(state, count) {
      state.nativesCount = count;
    }
  },
  /**
   * Actions are a good option if we have async calls or need to bundle multiple changes 
   * to the state of store 
   */
  actions:{
    UPDATE_COUNTRIES_SET_FILTER({commit, state}, countries) {
      this.commit("UPDATE_COUNTRIES_SET_FILTER", countries);
      let nativesCount = 0;
      state.persons.forEach((p) => {
        p.location.country == "Switzerland" ? ++nativesCount : void(0);
      });
      this.commit("UPDATE_NATIVES_COUNT", nativesCount);
    },
    LOAD_PERSONS({commit, state}, amount=100) {
			Utils.default.fetchPersons(amount)
      .then((persons) => {
        store.commit("UPDATE_ALL_PERSONS", persons);
        return persons;
      })
      .then((persons) => {
        let countries = new Set();
        persons.forEach((p) => countries.add(p.location.country));
        store.dispatch("UPDATE_COUNTRIES_SET_FILTER", countries);
      });
    },
    ADD_SKILLS_TO_PERSONS({commit, state}, payload) {
      state.persons.forEach( (person) => {
        let personSkills = [payload.skillNames.length];
        payload. skillNames.forEach( (skillName, index) => {
          personSkills[index] = { [skillName] : Math.floor(Math.random()*(1+payload.skillMaxLevel)) };
        });
        person.skills = personSkills;
      });
    },
    ADD_AVAILABILITY_TO_PERSONS({commit, state}) {
      state.persons.forEach( (person) => {
        person.availability = Math.floor(Math.random()*2);
      });
    },
    ADD_SELECTIVITY_TO_PERSONS({commit, state}) {
      state.persons.forEach( (person, index) => {
        person.isSelected = false;
      })
    }
  }
});

let app = new Vue({
  el:'#app',
  store,
  render: h => h(App, {props: {name:'test'  /* :this.fetchPersons(10) */}}),
  // mixins: [routingMixin]
});
app.$mount('#app');

const GlobalMixin = Vue.mixin({
  created() {
    console.log("global mixin");
  }
});
const globalMixin = new GlobalMixin();

// app.component("home-page", {
//   name: "HomePage",
//   template: `
//     <p style="text-align:center; top:0; bottom:0">
//       <strong>Welcome to the team selector and builder.</strong> <br>
//       <p><a href="/team-selector">Team Selector</a></p>
//       <p><a href="/team-builder">Team Builder</a></p>
//     </p>
//   `
// })