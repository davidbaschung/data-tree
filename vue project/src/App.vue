<template>
	<div id="app">
		<team-selector></team-selector>
	</div>
</template>

<script>
	import TeamSelector from "@/components/TeamSelector.vue";
	export default {
		name: "App",
		components: {
			TeamSelector
		}
	}
</script>