<script lang="ts">
	import { app } from "$lib/app/index.svelte";
	import { writeThemeToBoilerPlate } from "$lib/theme/writer";

  const str = $derived(writeThemeToBoilerPlate(app.sets));
</script>

<div>
  <pre class="text-xs p-6 border border-th-bg-100-900 rounded-lg overflow-scroll">{str}</pre>
</div>