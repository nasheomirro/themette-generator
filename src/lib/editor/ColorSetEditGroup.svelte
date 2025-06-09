<script lang="ts">
	import { app } from '$lib/app/index.svelte';
	import AlertDialog from '$lib/shared/AlertDialog.svelte';
	import Divider from '$lib/shared/Divider.svelte';
	import type { ColorSet } from '$lib/theme/types';
	import ColorSetContrast from './ColorSetContrast.svelte';
	import ColorSetName from './ColorSetName.svelte';
	import ColorSetPalette from './ColorSetPalette.svelte';

	import TrashIcon from '~icons/lucide/trash';
	import BGIcon from '~icons/material-symbols/background-replace';

	type Props = {
		set: ColorSet;
	};

	const { set }: Props = $props();
</script>

{#if set}
	<div>
		<div class="relative mb-8">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-xl font-bold">Edit Color Set</h3>
				<div class="flex gap-2">
					<button
						class="btn disabled:opacity-50 {app.ids.backgroundId === set.id && "bg-th-bg-200-800 duration-0"}"
						onclick={() => {
							app.updateId('backgroundId', app.ids.backgroundId !== set.id ? set.id : null);
						}}
					>
						<BGIcon />
						<span class="sr-only">Toggle as Background</span>
					</button>
					<AlertDialog onconfirm={() => app.deleteColorSet(set.id)}>
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
			</div>
			<p class="text-th-bg-700-300 text-sm font-light">Edit the current chosen color set here.</p>
		</div>
		<div class="space-y-12">
			<div class="space-y-8">
				<ColorSetName {set} />
				<ColorSetPalette {set} />
			</div>
			<Divider />
			<ColorSetContrast {set} />
		</div>
	</div>
{/if}
