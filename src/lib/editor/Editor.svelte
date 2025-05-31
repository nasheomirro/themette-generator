<script lang="ts">
	import { app } from '$lib/app/index.svelte';
	import Divider from '$lib/shared/Divider.svelte';
	import ColorSetEditGroup from './ColorSetEditGroup.svelte';
	import ColorSetPicker from './ColorSetPicker.svelte';

	const selectedSet = $derived(
		app.ids.selectedId ? app.sets[app.getIndexFromId(app.ids.selectedId)] : null
	);
</script>

<div class="space-y-12">
	<ColorSetPicker />
	{#if selectedSet}
		<Divider />
		<ColorSetEditGroup set={selectedSet} />
	{/if}
</div>
