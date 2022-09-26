<template>
	<div id="app">
		<!-- :persons="persons"> -->
		<selector-section @personsFiltering="setPersonsFilterBy"></selector-section>
		<grid-section :persons="filteredPersons"></grid-section>
	</div>
</template>

<script>
import Vue from 'vue';
import * as Utils from './utils.js'
Vue.use(Utils);
import SelectorSection from '@/components/SelectorSection.vue'
import GridSection from './components/GridSection.vue';

export default {
	name: 'App',
	components: {
		'selector-section': SelectorSection,
		'grid-section': GridSection
	},
	data() {
		return {
			personsFilterBy: {}, // for SelectorSection event reception
			refreshKey: 0
		}
	},
	computed: {
		filteredPersons() {
			this.refreshKey;
			return this.$store.state.persons.filter(this.filters);
		},
	},
	methods: {
		setPersonsFilterBy(personsFilterBy) {
			this.personsFilterBy = personsFilterBy;
			this.refreshKey++;
		},
		filters(p) {
			return (
				(this.checkAttributes(p)) &&
				(this.personsFilterBy.men ? true : !(p.gender == 'male')) &&
				(this.personsFilterBy.women ? true : !(p.gender == 'female')) &&
				(this.personsFilterBy.country == "All" ? true : p.location.country == this.personsFilterBy.country) &&
				(this.personsFilterBy.minAge < p.dob.age) &&
				(this.personsFilterBy.maxAge > p.dob.age)
			);
		},
		checkAttributes(personAttribute) {
			if ( ! (personAttribute instanceof Object)) {
				if (new String(personAttribute).toLowerCase().includes(this.personsFilterBy.input.toLowerCase()))
					return true;
			} else {
				let entries = Object.entries(personAttribute);
				for (var entry of entries) {
					if (this.checkAttributes(entry[1]))
						return true;
				}
			}
			return false;
		}
	},
	beforeCreate() {
		Utils.default.fetchPersons(10)
			.then((persons) => {
				this.$store.state.persons = persons; return persons;
			})
			.then((persons) => {
				let countries = new Set();
				persons.forEach((p) => countries.add(p.location.country));
				this.$store.state.countries = countries;
			});
	},
}
</script>

<style>
* {
	margin: 0px;
}
</style>
