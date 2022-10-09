<template>
	<div id="team-selection">
        <button @click="onReload">reload</button>
        <span class="span-remark">isLoading : <span :value="isLoading">{{isLoading}}</span></span>
		<selector-section @personsFiltering="setPersonsFilterBy"></selector-section>
		<grid-section :persons="filteredPersons" @isLoading="updateIsLoading"></grid-section>
	</div>
</template>

<script>
    /**
    * The TeamSelector provides the User with a panel where he can select team members from a list of all possible candidates. 
    * The User can filter the candidates based on a couple of criterias to make the selection easier
    *  
    * The TeamSelector is responsible to load all the possible candidates and provide a filtered list, based on the criterias that have been set by the user
    * All the Business Logic is handled here, so that the logic is centralized and can easily be traced.
    * In no child component there is the need to access the store or have logic that goes beyond ensuring the components contract
    */
	import { mapGetters } from 'vuex'
	import SelectorSection from './SelectorSection.vue'
	import GridSection from './GridSection.vue';

	export default {
		name: 'TeamSelector',
		components: {
			'selector-section': SelectorSection,
			'grid-section': GridSection
		},
		data() {
			return {
				isLoading: false,
				personsFilterBy: {}, // for SelectorSection event reception
				refreshKey: 0
			}
		},
		computed: {
			...mapGetters(["persons"]),
			filteredPersons() {
				this.refreshKey;
				console.log("filtering : " ,this.persons.value);
				let p = this.persons;
				return (
					(p != undefined )
					? p.filter(this.filters)
					: []
				);
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
			},
            onReload() {
				this.$store.commit("RESET_PERSONS");
                this.loadPersons();
            },
            loadPersons() {
                this.isLoading = true;
                this.$store.dispatch("LOAD_PERSONS", 10);
                // this.$store.dispatch("LOAD_PERSONS", 10).then(() => {
                //     setTimeout(() => {
                //         this.isLoading = false;
                //     }, 1000);
                // })
                // TODO has a use? (already reload in case of failure)
            },
			updateIsLoading(isLoading) {
				console.log("updateIsLoading : ", isLoading);
				this.isLoading = isLoading;
			}
            
		},
		created() {
            this.loadPersons();
		}
	}
</script>

<style>
    * {
        margin: 0px;
    }
    .span-remark {
        color:grey;
        padding: 0.5em;
    }
    span > span[value*='true'] {
        color : limegreen !important;
    }
    span > span:not([value*='true']) {
        color : red !important;
    }
</style>
