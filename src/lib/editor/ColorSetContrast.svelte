<script lang="ts">
	import { app } from '$lib/app/index.svelte';
	import Select from '$lib/shared/Select.svelte';
	import { colorShades } from '$lib/theme/constants';
	import type { ColorSet } from '$lib/theme/types';
	import { getVarColorObjValue, computeContrastForColor } from '$lib/theme/utils';

	type Props = {
		set: ColorSet;
	};

	const { set }: Props = $props();

	const shades = $derived(
		colorShades.map((shade) => {
			const light = getVarColorObjValue(app.sets, set.contrasts.light);
			const dark = getVarColorObjValue(app.sets, set.contrasts.dark);
			const v = computeContrastForColor(set[shade], light!, dark!);
			return {
				shade,
				value: v
			};
		})
	);

	const onValueChange = (v: string) => {
		app.updateColorSet(set.id, {
			contrasts: { light: { setId: v, shade: '50' }, dark: { setId: v, shade: '950' } }
		});
	};
</script>

<div>
	<h4 class="mb-2 text-sm">Contrast Set</h4>
	<p class="text-th-bg-700-300 mb-8 text-xs font-light">
		This is the set that will be used to provide contrast values for the selected set. The lightest
		(50) and darkest (950) shades are used.
	</p>

	<Select
		type="single"
		items={app.sets.map((set) => ({ label: set.name, value: set.id }))}
		value={set.contrasts.light.setId}
		{onValueChange}
	/>

	<div class="mt-8">
		<h5 class="mb-4 text-sm">Contrast Scores</h5>
		<p class="text-th-bg-700-300 mb-8 text-xs font-light">
			The numbers below show the contrast scores for each shade when the shade is used as background
			and the contrast as text.
		</p>
		<ul class="mb-8 grid grid-cols-3 items-start gap-2">
			{#each shades as { shade, value }}
				<li
					class="group grid h-10 grid-cols-2 items-center justify-center rounded-lg p-1 shadow-sm {value <
					4.5
						? 'bg-[#de3a3a]/20'
						: value < 7
							? 'bg-[#5be169]/20'
							: 'bg-[#1fab9d]/20'}"
				>
					<div class="text-center text-xs">
						{shade}
					</div>
					<div>
						<div class="text-center text-xs font-bold">
							{value.toFixed(2)}
						</div>
					</div>
				</li>
			{/each}
		</ul>
		<p class="text-th-bg-700-300 mb-8 text-xs font-light">
			In some cases, shades, especially around (500), would often have low contrast scores. When
			exporting code you have an option to remove contrast colors that have low contrast values.
		</p>
	</div>
</div>
