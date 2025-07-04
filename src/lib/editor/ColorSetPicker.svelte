<!-- A somewhat rudimentary and yet slightly hacky dnd'abble list -->
<script lang="ts">
	import { Spring } from 'svelte/motion';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import { app } from '$lib/app/index.svelte';
	import { isCursorInside } from '$lib/shared/utils';

	import AddIcon from '~icons/lucide/plus';
	import FlyIcon from '~icons/lucide-lab/butterfly';
	import PenIcon from '~icons/material-symbols/pen-size-5';
	import BGIcon from '~icons/material-symbols/background-replace';

	const cursorPosition = new Spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.7 });

	// variables related to dragging
	let isDragging = $state(false);
	let currentDraggedSetId = $state<string | undefined>();
	let currentPosition: number;
	let container: HTMLElement;
	let itemRects: DOMRect[] = [];

	// variables related to enabling dragging
	const DRAG_THRESHOLD = 5;
	let couldDragStartX = 0;
	let couldDragStartY = 0;

	// moving-related variables
	const FLIP_DURATION = 200;
	const DEBOUNCE_MOVE_DURATION = 50;
	let movingTo: number | undefined;
	let debounceMoveTimeout: number | undefined;
	let flippingTimeout: number | undefined; // not a boolean but used like one

	function onCouldDragStart(event: MouseEvent, set: string, index: number) {
		couldDragStartX = event.clientX;
		couldDragStartY = event.clientY;
		currentDraggedSetId = set;
		currentPosition = index;

		document.addEventListener('mousemove', onCouldDragging);
		document.addEventListener('mouseup', onCouldDragEnd);
		document.addEventListener('touchmove', onCouldTouchDragging, { passive: false });
		document.addEventListener('touchend', onCouldDragEnd);
		document.addEventListener('visibilitychange', onCouldDragEnd);
	}

	function onCouldDragTouchStart(event: TouchEvent, set: string, index: number) {
		if (event.touches.length > 1) return; // Ignore multi-touch
		const touch = event.touches[0];
		onCouldDragStart(
			{
				clientX: touch.clientX,
				clientY: touch.clientY,
				preventDefault: () => event.preventDefault()
			} as unknown as MouseEvent,
			set,
			index
		);
	}

	function onCouldDragging(event: MouseEvent) {
		event.preventDefault();
		const dx = event.clientX - couldDragStartX;
		const dy = event.clientY - couldDragStartY;
		if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
			onDragStart(event);
		}
	}

	function onCouldTouchDragging(event: TouchEvent) {
		if (event.touches.length > 1 || !event.cancelable) return; // Ignore multi-touch
		const touch = event.touches[0];
		onCouldDragging({
			clientX: touch.clientX,
			clientY: touch.clientY,
			preventDefault: () => event.preventDefault()
		} as unknown as MouseEvent);
	}

	function onCouldDragEnd() {
		document.removeEventListener('mousemove', onCouldDragging);
		document.removeEventListener('mouseup', onCouldDragEnd);
		document.removeEventListener('touchmove', onCouldTouchDragging);
		document.removeEventListener('touchend', onCouldDragEnd);
		document.removeEventListener('visibilitychange', onCouldDragEnd);
	}

	function onDragStart(event: MouseEvent) {
		event.preventDefault();

		// leave could drag phase and enter dragging phase
		isDragging = true;
		onCouldDragEnd();

		// add event listeners for dragging
		document.addEventListener('mousemove', onDragging);
		document.addEventListener('mouseup', onDragEnd);
		document.addEventListener('touchmove', onTouchDragging, { passive: false });
		document.addEventListener('touchend', onDragEnd);
		document.addEventListener('visibilitychange', onDragEnd);

		// call once to set the cursor positions
		moveCursorPosition(event, true);
	}

	// make sure everything we used for dragging is cleared
	function onDragEnd() {
		clearTimeout(debounceMoveTimeout);
		clearTimeout(flippingTimeout);

		isDragging = false;
		debounceMoveTimeout = undefined;
		flippingTimeout = undefined;
		currentDraggedSetId = undefined;
		movingTo = undefined;

		document.removeEventListener('mousemove', onDragging);
		document.removeEventListener('mouseup', onDragEnd);
		document.removeEventListener('touchmove', onTouchDragging);
		document.removeEventListener('touchend', onDragEnd);
		document.removeEventListener('visibilitychange', onDragEnd);
	}

	function moveCursorPosition(coords: { clientX: number; clientY: number }, instant?: boolean) {
		const relativeX = coords.clientX;
		const relativeY = coords.clientY;
		cursorPosition.set({ x: relativeX, y: relativeY }, { instant });
	}

	function onDragging(event: MouseEvent) {
		event.preventDefault();
		moveCursorPosition(event);

		// make sure no flips are happening before updating the list we use for calculations
		// if a flip is happening we freeze updating the item rects to prevent calculating moving items
		if (typeof flippingTimeout === 'undefined') {
			itemRects = Array.from(
				container
					.querySelectorAll(`[data-set]`)
					.values()
					.map((el) => el.getBoundingClientRect())
			);
		}

		// check for every item if cursor has entered them,
		// if so make it so we move the currently dragged item over.
		for (let i = 0; i < itemRects.length; i++) {
			if (currentPosition !== i && movingTo !== i && isCursorInside(event, itemRects[i])) {
				movingTo = i;
				clearTimeout(debounceMoveTimeout);
				debounceMoveTimeout = setTimeout(() => {
					app.reorderColorSet(currentPosition, i);
					currentPosition = i;

					// reset flip timeout here since this marks when items are flipping
					clearTimeout(flippingTimeout);
					flippingTimeout = setTimeout(() => (flippingTimeout = undefined), FLIP_DURATION);
				}, DEBOUNCE_MOVE_DURATION);
			}
		}
	}

	function onTouchDragging(e: TouchEvent) {
		if (e.touches.length > 1) return;
		const touch = e.touches[0];
		onDragging({
			clientX: touch.clientX,
			clientY: touch.clientY,
			preventDefault: () => e.preventDefault()
		} as unknown as MouseEvent);
	}
</script>

<div class="space-y-7">
	<div class="space-y-2">
		<div class="text-2xl font-bold">Color Sets</div>
		<p class="text-th-bg-700-300 text-sm font-light">
			All the colors of your theme is placed here.
		</p>
	</div>
	<div class="relative" bind:this={container}>
		<ul class="flex flex-wrap items-start gap-2.5">
			{#each app.sets as set, i (set.id)}
				<li
					animate:flip={{ duration: FLIP_DURATION }}
					style="--self: var(--color-{set.name}-500); --contrast: var(--color-{set.name}-contrast-500)"
					class="relative z-0 transition {isDragging &&
						currentDraggedSetId === set.id &&
						'scale-95 opacity-50'}"
					data-set
				>
					<button
						ontouchstart={(e) => onCouldDragTouchStart(e, set.id, i)}
						onmousedown={(e) => onCouldDragStart(e, set.id, i)}
						onclick={() => {
							app.updateId('foregroundId', set.id);
							app.updateId('selectedSetId', set.id);
						}}
						class="group flex h-10 w-10 items-center justify-center gap-5 rounded-md bg-(--self) text-(--contrast) shadow transition hover:brightness-95 {app
							.ids.selectedSetId === set.id && 'ring-2 ring-(--self)/50'}"
					>
						{#if set.id === app.ids.backgroundId}
							<BGIcon
								class="transition {app.ids.selectedSetId === set.id ? 'opacity-100' : 'opacity-80'}"
							/>
						{:else}
							<PenIcon
								class="transition {app.ids.selectedSetId === set.id ? 'opacity-100' : 'opacity-0'}"
							/>
						{/if}
						<span class="sr-only">edit {set.name}</span>
					</button>
				</li>
			{/each}
			<li>
				<button
					onclick={() => {
						const { id } = app.createEmptyColorSet() || { id: null };
						app.updateId('foregroundId', id);
						app.updateId('selectedSetId', id);
					}}
					class="text-th-bg-500 flex h-10 w-10 items-center justify-center rounded-lg"
				>
					<AddIcon class="h-6 w-6" />
					<span class="sr-only">New Color Set</span>
				</button>
			</li>
		</ul>

		<div
			class="fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2"
			style="top: {cursorPosition.current.y}px; left: {cursorPosition.current.x}px"
		>
			{#if isDragging}
				<div class="flex h-40 w-40 items-center justify-center">
					<div
						style="--c: var(--color-{app.sets.find((set) => set.id === currentDraggedSetId)
							?.name}-500)"
						class="text-th-bg-50 rounded-full bg-(--c) p-1"
						transition:scale={{ duration: 100 }}
					>
						<FlyIcon />
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
