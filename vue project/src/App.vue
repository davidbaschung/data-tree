<template>
	<div id="app">
		<component :is="tab"></component>
	</div>
</template>

<script>
	import myMixin from "@/components/myMixin.js";
	import HomePage from "@/components/HomePage.vue"
	const TeamSelectorLazilyLoaded = () => import("@/components/TeamSelector.vue");
	import TeamBuilder from "@/components/HomePage.vue"

	let routes = {
		'/': HomePage,
		'/home-page': HomePage,
		'/team-selector' : TeamSelectorLazilyLoaded,
		'/team-builder' : TeamBuilder,
	}
	
	export default {
		name: "App",
		mixins: [myMixin],
		components: {
			HomePage,
			TeamSelector: TeamSelectorLazilyLoaded,
			TeamBuilder
		},
		data() {
			return {
				currentPath: window.location.hash,
				params: {},
			}
		},
		computed: {
			tab() {
				return routes[this.currentPath.slice(1) || '/']
			}
		},
		created() {
			this.helloWorld();
			this.$store.dispatch("INIT_PARAMS");
		},
		mounted() {
			window.addEventListener('hashchange', () => {
				this.currentPath = window.location.hash;
			} );
			TeamSelectorLazilyLoaded();
		}
	};
</script>