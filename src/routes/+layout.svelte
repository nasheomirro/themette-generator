<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/main.css';
	import ThemeWatcher from '$lib/app/ThemeWatcher.svelte';

	let { children } = $props();
</script>

<ThemeWatcher />
<ModeWatcher />
{@render children()}
