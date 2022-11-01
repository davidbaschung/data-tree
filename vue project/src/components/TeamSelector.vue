<template>
	<KeepAlive include="selector" exclude="results"> <!-- Could be used when the page has several tabs, e.g. one for TeamSelector and another new TeamBuilder -->
		<div class="team-selector" >
			<button @click="onReload">reload</button>
			<span class="span-remark">isLoading : <span :value="isLoading">{{isLoading}}</span></span>
			<selector-section name="selector" @personsFiltering="setPersonsFilterBy" :skillSet="this.skills"></selector-section>
			<grid-section name="results" :persons="filteredPersons" @isLoading="updateIsLoading"></grid-section>
			<!-- <selected-persons></selected-persons> -->
		</div>
	</KeepAlive>
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
	// import SelectedPersons from './SelectedPersons.vue';

	export default {
		name: 'TeamSelector',
		components: {
			'selector-section': SelectorSection,
			'grid-section': GridSection,
			// 'selected-persons': SelectedPersons
		},
		data() {
			return {
				isLoading: false,
				personsFilterBy: {}, // for SelectorSection event reception
				refreshKey: 0,
				skills: [
                    {key:"photoshop", label:"Photoshop", level:0},
                    {key:"illustrator", label:"Illustrator", level:0},
                    {key:"powerpoint", label:"Powerpoint", level:0},
                    {key:"rhinoceros", label:"Rhinoceros", level:0},
                    {key:"vray", label:"Vray", level:0},
                    {key:"alias", label:"Alias", level:0}
                ]
			}
		},
		computed: {
			...mapGetters(["persons"]),
			filteredPersons() {
				this.refreshKey;
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
				if (this.personsFilterBy.skills==undefined || p.skills==undefined) return true;
				return (
					(this.checkAttributes(p)) &&
					(this.personsFilterBy.men ? true : !(p.gender == 'male')) &&
					(this.personsFilterBy.women ? true : !(p.gender == 'female')) &&
					(this.personsFilterBy.country == "All" ? true : p.location.country == this.personsFilterBy.country) &&
					(this.personsFilterBy.minAge < p.dob.age) &&
					(this.personsFilterBy.maxAge > p.dob.age) &&
					(this.personsFilterBy.skills.every( (filterSkill, index) => {
						return filterSkill.level <= Object.values(p.skills[index])[0];
					})) &&
					(this.personsFilterBy.availability >= p.availability)
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
				setTimeout( () => {
					this.$store.dispatch("ADD_SKILLS_TO_PERSONS", {skillNames:this.skills.map(skill =>skill.key), skillMaxLevel:5});
					this.$store.dispatch("ADD_AVAILABILITY_TO_PERSONS");
				}, 1000);
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
