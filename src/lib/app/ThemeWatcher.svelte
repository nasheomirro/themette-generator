<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	
	import type { DeepWriteable } from '$lib/shared/utils';
	import type { ColorSet } from '$lib/theme/types';
	import { writeTheme } from '$lib/theme/writer';
	import { app } from './index.svelte';

	const theme = $derived(writeTheme(app.sets));
	const ui = $derived.by(() => {
		type T = DeepWriteable<ColorSet> | undefined;
		const fg = $state.snapshot(app.sets.find((set) => set.id === app.ids.foregroundId)) as T;
		const bg = $state.snapshot(app.sets.find((set) => set.id === app.ids.backgroundId)) as T;

		if (fg) fg.name = 'th-fg';
		if (bg) bg.name = 'th-bg';

		return writeTheme([fg, bg].filter((set) => typeof set !== 'undefined'));
	});

	$effect(() => document.documentElement.setAttribute('style', theme.raw + ' ' + ui.raw));
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey && e.key === 'q') {
			e.preventDefault();
			toggleMode();
		}
	}}
/>
