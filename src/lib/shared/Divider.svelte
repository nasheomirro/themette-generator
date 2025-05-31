<script lang="ts">
	type Props = {
		class?: string;
	};

	const { class: className }: Props = $props();
</script>

<div class="border-t-th-bg-100-900 border-t {className}"></div>
