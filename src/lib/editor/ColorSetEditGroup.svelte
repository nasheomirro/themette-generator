<script lang="ts">
	import { app } from '$lib/app/index.svelte';
	import ColorSetName from './ColorSetName.svelte';
	import ColorSetPalette from './ColorSetPalette.svelte';

	const selectedSet = $derived(
		app.ids.selectedId ? app.sets[app.getIndexFromId(app.ids.selectedId)] : null
	);
</script>

{#if selectedSet}
	<div>
		<div class="relative mb-8">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-xl font-bold">Edit Color Set</h3>
			</div>
			<p class="text-th-background-700-300 text-sm font-light">
				Edit the current chosen color set here.
			</p>
		</div>
		<div class="space-y-8">
			<ColorSetName set={selectedSet} />
			<ColorSetPalette set={selectedSet} />
		</div>
	</div>
{/if}
