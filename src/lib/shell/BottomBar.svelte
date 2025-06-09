<script lang="ts">
	import type { Component } from 'svelte';
	import { RadioGroup } from 'bits-ui';

	import { panel } from './panels.svelte';

	import EditorIcon from '~icons/lucide/paintbrush';
	import ThemeIcon from '~icons/lucide/palette';
	import PreviewIcon from '~icons/lucide/eye';
	import GeneratedIcon from '~icons/lucide/braces';

	const icons: { [K in typeof panel.mobile]: Component } = {
		theme: ThemeIcon,
		generated: GeneratedIcon,
		editor: EditorIcon,
		preview: PreviewIcon
	};
</script>

{#snippet item(name: string, value: typeof panel.mobile)}
	<RadioGroup.Item
		class="data-[state=checked]:text-th-fg-800-200 flex grow flex-col items-center justify-center gap-0.5 text-sm font-light transition"
		{value}
	>
		{@const Icon = icons[value]}
		<Icon />
		<span class="text-xs">{name}</span>
	</RadioGroup.Item>
{/snippet}

<RadioGroup.Root
	bind:value={panel.mobile}
	class="bg-th-bg-50-950 border-t-th-bg-100-900 fixed bottom-0 left-0 z-40 flex h-16 w-full items-center border-t md:hidden"
>
	{#snippet child({ props })}
		<nav {...props}>
			{@render item('Presets', 'theme')}
			{@render item('Editor', 'editor')}
			{@render item('Preview', 'preview')}
			{@render item('Code', 'generated')}
		</nav>
	{/snippet}
</RadioGroup.Root>
