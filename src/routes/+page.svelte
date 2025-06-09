<script>
	import Editor from '$lib/editor/Editor.svelte';
	import CodePreview from '$lib/preview/CodePreview.svelte';
	import MainShell from '$lib/shell/MainShell.svelte';
</script>

<MainShell>
	{#snippet theme()}
		<div></div>
	{/snippet}
	{#snippet editor()}
		<Editor />
	{/snippet}
	{#snippet code()}
		<CodePreview />
	{/snippet}
	{#snippet preview()}
		<div></div>
	{/snippet}
</MainShell>
