<script lang="ts">
	import { Select, type WithoutChildren } from 'bits-ui';
	import CheckIcon from '~icons/lucide/check';

	type Props = WithoutChildren<Select.RootProps> & {
		placeholder?: string;
		items: { value: string; label: string; disabled?: boolean }[];
		contentProps?: WithoutChildren<Select.ContentProps>;
		triggerLabel?: string;
	};

	let {
		value = $bindable(),
		items,
		contentProps,
		placeholder,
		triggerLabel,
		...restProps
	}: Props = $props();
	const selectedLabel = $derived(items.find((item) => item.value === value)?.label);
</script>

<!--
TypeScript Discriminated Unions + destructing (required for "bindable") do not
get along, so we shut typescript up by casting `value` to `never`, however,
from the perspective of the consumer of this component, it will be typed appropriately.
-->
<Select.Root bind:value={value as never} {...restProps}>
	<Select.Trigger class="input text-left" aria-label={triggerLabel}>
		{selectedLabel ? selectedLabel : placeholder}
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			{...contentProps}
			class="
      bg-th-bg-50-950 border-th-bg-100-900 z-50 w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)]
      rounded-lg border
      data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2
      {contentProps?.class}"
		>
			{#each items as { value, label, disabled } (value)}
				<Select.Item
					class="data-highlighted:bg-th-bg-100-900/50 flex items-center justify-between px-4 py-2 text-sm"
					{value}
					{label}
					{disabled}
				>
					{#snippet children({ selected })}
						{label}
						{#if selected}
							<CheckIcon />
						{/if}
					{/snippet}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Portal>
</Select.Root>
