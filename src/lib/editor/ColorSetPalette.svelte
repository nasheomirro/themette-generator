<script lang="ts">
	import chroma, { type Color } from 'chroma-js';
	import { app } from '$lib/app/index.svelte';
	import Select from '$lib/shared/Select.svelte';
	import { colorShades } from '$lib/theme/constants';
	import type { ColorSet, ColorShade } from '$lib/theme/types';
	import {
		createShadeSetFromScale,
		genRandomColor,
		genScale,
		genScaleFromColor
	} from '$lib/theme/utils';

	import RandomIcon from '~icons/lucide/dices';
	import RefreshIcon from '~icons/lucide/refresh-ccw';

	const OPTIONS = [
		{ value: 'manual', label: 'Manual' },
		{ value: 'linear', label: 'Linear' },
		{ value: 'multicolor', label: 'Multicolor' },
		{ value: 'seed', label: 'Seed' }
	];

	type Props = {
		set: ColorSet;
	};

	const { set }: Props = $props();

	let editMode = $state<'manual' | 'linear' | 'multicolor' | 'seed'>('seed');

	const shades = $derived<ColorShade[]>(
		editMode === 'manual'
			? colorShades
			: editMode === 'linear'
				? ['50', '950']
				: editMode === 'multicolor'
					? ['50', '500', '950']
					: editMode === 'seed'
						? ['500']
						: colorShades
	);

	const handleSeedGeneration = (seed: string | Color) => {
		const shades = createShadeSetFromScale(genScaleFromColor(seed));
		app.updateColorSet(set.id, { ...shades });
	};

	const handleLinearGeneration = () => {
		const shades = createShadeSetFromScale(genScale([set[50], set[950]]));
		app.updateColorSet(set.id, { ...shades });
	};

	const handleMultiColorGeneration = () => {
		const shades = createShadeSetFromScale(genScale([set[50], set[500], set[950]]));
		app.updateColorSet(set.id, { ...shades });
	};

	const refreshGeneratedValues = () => {
		if (editMode === 'linear') handleLinearGeneration();
		if (editMode === 'multicolor') handleMultiColorGeneration();
		if (editMode === 'seed') handleSeedGeneration(set[500]);
	};

	const handleColorChange = (value: string, shade: ColorShade) => {
		if (chroma.valid(value)) {
			app.updateColorSet(set.id, {
				[shade]: value
			});

			// note that we aren't checking whether the appropriate shades have been updated.
			// Here we blindly trust that the UI is showing the appropriate shade inputs depending on the edit mode
			refreshGeneratedValues();
			return true;
		}

		return false;
	};
</script>

<div>
	<div class="mb-8">
		<div class="mb-4 flex items-center justify-between gap-2">
			<div class="flex gap-1">
				<button class="btn" onclick={() => handleSeedGeneration(genRandomColor())}>
					<RandomIcon />
				</button>
				<button class="btn" onclick={() => refreshGeneratedValues()}>
					<RefreshIcon />
				</button>
			</div>
			<div class="w-30">
				<Select
					type="single"
					items={OPTIONS}
					placeholder=""
					triggerLabel="Set Editing Mode"
					bind:value={editMode}
				/>
			</div>
		</div>
		<div>
			<h4 class="mb-2 text-sm">{OPTIONS.find((item) => item.value === editMode)?.label} Mode</h4>
			<p class="text-th-bg-700-300 text-xs font-light">
				{#if editMode === 'manual'}
					You can edit each shade manually, switch to other editing modes if you want to
					automatically interpolate between two colors, three colors, or generate the whole pallete
					with just one color.
				{:else if editMode === 'linear'}
					shades between the lightest (50) and the darkest (950) are automatically generated. Switch
					to manual if you want to set them yourself.
				{:else if editMode === 'multicolor'}
					shades between the lightest (50), the middle (500), and the darkest (950) are
					automatically generated. Switch to manual if you want to set them yourself.
				{:else if editMode === 'seed'}
					All shades are automatically generated based on the middle (500). Switch to manual if you
					want to set them yourself.
				{/if}
			</p>
		</div>
	</div>

	<div class="mb-8">
		<div class="space-y-5">
			{#each shades as shade}
				<div class="flex items-center gap-4">
					<span class="w-6 text-center text-xs">
						{shade}
					</span>
					<label class="h-7 w-7">
						<span class="sr-only">color shade - {shade} (native)</span>
						<input
							type="color"
							class="h-7 w-7 rounded shadow"
							value={chroma(set[shade]).hex()}
							oninput={({ currentTarget }) => handleColorChange(currentTarget.value, shade)}
						/>
					</label>
					<label class="grow">
						<span class="sr-only">color shade ({shade})</span>
						<input
							class="input"
							value={chroma(set[shade]).hex()}
							onchange={({ currentTarget }) => {
								const isSuccess = handleColorChange(currentTarget.value, shade);
								// value might not get updated because it's invalid, force the input to change back to the original value
								if (!isSuccess) currentTarget.value = set[shade];
							}}
						/>
					</label>
				</div>
			{/each}
		</div>
	</div>

	<div class="grid min-h-8 grid-cols-11 overflow-hidden rounded-lg">
		{#each colorShades as shade}
			<div style="--bg: var(--color-{set.name}-{shade})" class="bg-(--bg)"></div>
		{/each}
	</div>
</div>
