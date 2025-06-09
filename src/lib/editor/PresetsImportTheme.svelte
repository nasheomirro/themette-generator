<script lang="ts">
	import FileDownIcon from '~icons/material-symbols/file-save-outline-rounded';
	import { readTheme } from '$lib/theme/reader';
	import { app } from '$lib/app/index.svelte';

	let isDraggingOver = $state(false);

	function readThemeFile(file: File) {
		const reader = new FileReader();

		reader.onload = (e: ProgressEvent<FileReader>) => {
			try {
				const fileContent = e.target?.result as string;
				const sets = readTheme(fileContent);
				app.setNewTheme(sets);
			} catch {
				alert('Error! Cannot read uploaded file.');
			}
		};

		reader.readAsText(file);
	}

	function handleDragover(event: Event) {
		event.preventDefault();
		isDraggingOver = true;
	}

	function handleDragleave(event: Event) {
		event.preventDefault();
		isDraggingOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDraggingOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			readThemeFile(files[0]);
		}
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;

		if (input.files && input.files[0]) {
			const file = input.files[0];
			readThemeFile(file);
		}
	}
</script>

<label
	role="region"
	class="border-th-bg-100-900 has-focus-visible:keyboard-focused hover:bg-th-bg-100-900/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 transition
  {isDraggingOver && 'bg-th-bg-100-900/50'}"
	ondrop={handleDrop}
	ondragover={handleDragover}
	ondragleave={handleDragleave}
>
	<FileDownIcon class="text-th-bg-400-600 mb-4 h-12 w-12" />
	<span class="text-th-bg-600-400 text-center text-xs"
		>Drag and drop your theme here or choose a file from your system.</span
	>
	<input type="file" class="absolute opacity-0 -z-10" onchange={handleFileChange} />
</label>
