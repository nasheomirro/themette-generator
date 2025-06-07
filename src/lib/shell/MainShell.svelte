<script lang="ts">
	import type { Snippet } from 'svelte';
	import { RadioGroup } from 'bits-ui';

	import Navbar from './Navbar.svelte';
	import BottomBar from './BottomBar.svelte';

	import CodeIcon from '~icons/lucide/braces';
	import PreviewIcon from '~icons/lucide/eye';
	import { panel } from './panels.svelte';

	type Props = {
		editor: Snippet;
		preview: Snippet;
		code: Snippet;
	};

	const { code, editor, preview }: Props = $props();
</script>

<Navbar />

<div
	class="centered-container grid items-start pt-14 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_3fr]"
>
	<div
		class="
      {panel.mobile === 'editor' ? 'max-md:block' : 'max-md:hidden'}
      md:border-r-th-bg-100-900 px-4
      pt-10 pb-26 max-md:col-start-1 max-md:row-start-1 md:sticky md:top-14 md:z-30 md:h-[calc(100vh-3.5rem)] md:overflow-auto md:border-r md:px-6 md:pb-10 lg:px-8
    "
	>
		<div>
			{@render editor()}
		</div>
	</div>
	<div
		class="
      {panel.mobile === 'editor' && 'max-md:hidden'}
      relative z-0 w-full min-w-0 p-4 max-md:col-start-1 max-md:row-start-1 md:px-6 lg:px-8
    "
	>
		<RadioGroup.Root
			orientation="horizontal"
			bind:value={panel.desktop}
			class="bg-th-bg-50-950 border-th-bg-100-900 ml-auto flex w-fit items-center gap-1 rounded-lg border p-2 max-md:hidden mb-4"
		>
			<RadioGroup.Item
				class="data-[state=checked]:bg-th-bg-100-900 hover:bg-th-bg-100-900 flex items-center gap-2 rounded px-2 py-1.5 text-xs transition"
				value="preview"
			>
				<PreviewIcon /> preview
			</RadioGroup.Item>
			<RadioGroup.Item
				class="data-[state=checked]:bg-th-bg-100-900 hover:bg-th-bg-100-900 flex items-center gap-2 rounded px-2 py-1.5 text-xs transition"
				value="generated"
			>
				<CodeIcon /> CSS
			</RadioGroup.Item>
		</RadioGroup.Root>

		<div
			class="{panel.mobile === 'preview' ? 'max-md:block' : 'max-md:hidden'}  {panel.desktop ===
			'preview'
				? 'md:block'
				: 'md:hidden'}
      "
		>
			{@render preview()}
		</div>

		<div
			class="
      {panel.mobile === 'generated' ? 'max-md:block' : 'max-md:hidden'} 
      {panel.desktop === 'generated' ? 'md:block' : 'md:hidden'}
    "
		>
			{@render code()}
		</div>
	</div>
</div>

<BottomBar />
