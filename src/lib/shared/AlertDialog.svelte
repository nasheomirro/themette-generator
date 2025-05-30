<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AlertDialog, type WithoutChild } from 'bits-ui';

	type Props = AlertDialog.RootProps & {
		trigger: Snippet;
		title: Snippet;
		description: Snippet;
		onconfirm: () => void;
		contentProps?: WithoutChild<AlertDialog.ContentProps>;
	};

	let {
		open = $bindable(false),
		children,
		trigger,
		contentProps,
		title,
		onconfirm,
		description,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Root bind:open {...restProps}>
	<AlertDialog.Trigger class="btn">
		{@render trigger()}
	</AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Overlay class="bg-th-bg-900-100/50 fixed inset-0 z-50" />
		<AlertDialog.Content
			class="bg-th-bg-50-950 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 pb-4 sm:max-w-lg"
			{...contentProps}
		>
			<AlertDialog.Title class="mb-2 text-xl	font-bold">
				{@render title()}
			</AlertDialog.Title>
			<AlertDialog.Description class="text-th-bg-700-300 mb-4">
				{@render description()}
			</AlertDialog.Description>
			{@render children?.()}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					open = false;
					onconfirm();
				}}
				class="flex justify-end gap-2"
			>
				<AlertDialog.Cancel type="button" class="btn px-4">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit" class="btn px-4">Confirm</AlertDialog.Action>
			</form>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
