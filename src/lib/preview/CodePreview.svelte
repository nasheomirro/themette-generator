<script lang="ts">
	import { scale } from 'svelte/transition';

	import { app } from '$lib/app/index.svelte';
	import { writeThemeToBoilerPlate } from '$lib/theme/writer';

	import CopyIcon from '~icons/material-symbols/content-copy-outline';
	import CheckIcon from '~icons/material-symbols/check';

	const str = $derived(writeThemeToBoilerPlate(app.sets));

	let isCopied = $state(false);
	let timeout: number;

	function handleCopyClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		navigator.clipboard.writeText(str);
		isCopied = true;

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			isCopied = false;
		}, 2000);
	}
</script>

<div class="relative z-0">
	<button class="btn absolute z-10 top-4 right-4 grid" onclick={handleCopyClick}>
		<span class="sr-only">Copy Code</span>
		{#if isCopied}
			<span transition:scale class="col-start-1 row-start-1">
				<CheckIcon />
			</span>
		{:else}
			<span transition:scale class="col-start-1 row-start-1">
				<CopyIcon />
			</span>
		{/if}
	</button>
	<pre class="border-th-bg-100-900 overflow-scroll rounded-lg border p-6 text-xs max-h-[80rem]">{str}</pre>
</div>
