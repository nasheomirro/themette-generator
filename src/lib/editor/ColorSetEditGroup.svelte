<script lang="ts">
	import { app } from '$lib/app/index.svelte';
	import AlertDialog from '$lib/shared/AlertDialog.svelte';
	import ColorSetContrast from './ColorSetContrast.svelte';
	import ColorSetName from './ColorSetName.svelte';
	import ColorSetPalette from './ColorSetPalette.svelte';

	import TrashIcon from '~icons/lucide/trash';

	const selectedSet = $derived(
		app.ids.selectedId ? app.sets[app.getIndexFromId(app.ids.selectedId)] : null
	);
</script>

{#if selectedSet}
	<div>
		<div class="relative mb-8">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-xl font-bold">Edit Color Set</h3>
				<AlertDialog onconfirm={() => app.deleteColorSet(selectedSet.id)}>
					{#snippet trigger()}
						<TrashIcon />
					{/snippet}
					{#snippet title()}
						Delete Color Set?
					{/snippet}
					{#snippet description()}
						This action cannot be undone.
					{/snippet}
				</AlertDialog>
			</div>
			<p class="text-th-bg-700-300 text-sm font-light">Edit the current chosen color set here.</p>
		</div>
		<div class="space-y-8">
			<ColorSetName set={selectedSet} />
			<ColorSetPalette set={selectedSet} />
			<ColorSetContrast set={selectedSet} />
		</div>
	</div>
{/if}
