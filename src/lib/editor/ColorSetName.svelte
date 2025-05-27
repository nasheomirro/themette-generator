<script lang="ts">
	import { app } from "$lib/app/index.svelte";
	import type { ColorSet } from "$lib/theme/types";


	type Props = {
		set: ColorSet;
	};

	const { set }: Props = $props();
</script>

<div>
	<label class="mb-3 block">
		<span class="label-text">Name</span>
		<input
			class="input"
			value={set.name}
			onchange={(e) => {
				const _set = app.updateColorSet(set.id, { name: e.currentTarget.value });
				// edge-case for when user types the exact same name except that it's invalid.
				// value won't trigger because it assumes no change has been made, so we'll have to correct it here manually.
				e.currentTarget.value = set.name;
			}}
		/>
	</label>
	<p class="text-th-bg-600-400 text-xs font-light">
		This will be used as the name on the generated CSS variables.
	</p>
</div>
