<script lang="ts">
	import { app } from '$lib/app/index.svelte';
	import { writeTheme } from '$lib/theme/writer';
	import '../app.css';

	let { children } = $props();
	$inspect(app.sets);

	$effect(() => {
		console.log(writeTheme(app.sets))
	})
</script>

{@render children()}
