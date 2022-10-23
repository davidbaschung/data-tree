<template>
	<div id="app">
		<component :is="tab"></component>
	</div>
</template>

<script>
	import myMixin from "@/components/myMixin.js";
	import HomePage from "@/components/HomePage.vue"
	import TeamSelector from "@/components/TeamSelector.vue";
	import TeamBuilder from "@/components/HomePage.vue"


	let routes = {
		'/': HomePage,
		'/home-page': HomePage,
		'/team-selector' : TeamSelector,
		'/team-builder' : TeamBuilder,
	}
	
	export default {
		name: "App",
		components: {
			HomePage,
			TeamSelector,
			TeamBuilder
		},
		data() {
			return {
				currentPath: window.location.hash,
			}
		},
		computed: {
			tab() {
				return routes[this.currentPath.slice(1) || '/']
			}
		},
		mounted() {
			window.addEventListener('hashchange', () => {
				this.currentPath = window.location.hash
			} );
		}
	};
</script>