<script lang="ts">
	import type { Snippet } from 'svelte';
	import { RadioGroup } from 'bits-ui';

	import Navbar from './Navbar.svelte';
	import BottomBar from './BottomBar.svelte';

	import EditorIcon from '~icons/lucide/paintbrush';
	import ThemeIcon from '~icons/lucide/palette';
	import CodeIcon from '~icons/lucide/braces';
	import PreviewIcon from '~icons/lucide/eye';
	import { panel } from './panels.svelte';

	type Props = {
		theme: Snippet;
		editor: Snippet;
		preview: Snippet;
		code: Snippet;
	};

	const { theme, code, editor, preview }: Props = $props();
</script>

<Navbar />

<div
	class="centered-container grid items-start pt-14 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_3fr]"
>
	<div
		class="
      md:border-r-th-bg-100-900 px-4
      pt-10 pb-26 max-md:col-start-1 max-md:row-start-1 md:sticky md:top-14 md:z-30 md:h-[calc(100vh-3.5rem)] md:overflow-auto md:border-r md:px-6 md:pt-4 md:pb-10 lg:px-8
    "
	>
		<RadioGroup.Root
			orientation="horizontal"
			bind:value={panel.desktop.editor}
			class="bg-th-bg-50-950 border-th-bg-100-900 mb-8 ml-auto flex w-fit items-center gap-2 rounded-lg border p-2 max-md:hidden"
		>
			<RadioGroup.Item
				class="data-[state=checked]:bg-th-bg-100-900 hover:bg-th-bg-100-900 flex items-center gap-2 rounded px-2 py-1.5 text-xs transition"
				value="theme"
			>
				<ThemeIcon /> Presets
			</RadioGroup.Item>
			<RadioGroup.Item
				class="data-[state=checked]:bg-th-bg-100-900 hover:bg-th-bg-100-900 flex items-center gap-2 rounded px-2 py-1.5 text-xs transition"
				value="editor"
			>
				<EditorIcon /> Editor
			</RadioGroup.Item>
		</RadioGroup.Root>

		<div
			class="
		  {panel.mobile === 'editor' ? 'max-md:block' : 'max-md:hidden'} 
			{panel.desktop.editor === 'editor' ? 'md:block' : 'md:hidden'}"
		>
			{@render editor()}
		</div>

		<div
			class="
		  {panel.mobile === 'theme' ? 'max-md:block' : 'max-md:hidden'} 
			{panel.desktop.editor === 'theme' ? 'md:block' : 'md:hidden'}"
		>
			{@render theme()}
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
			bind:value={panel.desktop.preview}
			class="bg-th-bg-50-950 border-th-bg-100-900 mb-8 ml-auto flex w-fit items-center gap-2 rounded-lg border p-2 max-md:hidden"
		>
			<RadioGroup.Item
				class="data-[state=checked]:bg-th-bg-100-900 hover:bg-th-bg-100-900 flex items-center gap-2 rounded px-2 py-1.5 text-xs transition"
				value="preview"
			>
				<PreviewIcon /> Preview
			</RadioGroup.Item>
			<RadioGroup.Item
				class="data-[state=checked]:bg-th-bg-100-900 hover:bg-th-bg-100-900 flex items-center gap-2 rounded px-2 py-1.5 text-xs transition"
				value="generated"
			>
				<CodeIcon /> CSS
			</RadioGroup.Item>
		</RadioGroup.Root>

		<div
			class="{panel.mobile === 'preview' ? 'max-md:block' : 'max-md:hidden'}  {panel.desktop
				.preview === 'preview'
				? 'md:block'
				: 'md:hidden'}
      "
		>
			{@render preview()}
		</div>

		<div
			class="
      {panel.mobile === 'generated' ? 'max-md:block' : 'max-md:hidden'} 
      {panel.desktop.preview === 'generated' ? 'md:block' : 'md:hidden'}
    "
		>
			{@render code()}
		</div>
	</div>
</div>

<BottomBar />
